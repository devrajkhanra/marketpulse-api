// src/nse/nse.service.ts
import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import axios, { AxiosError } from 'axios';
import * as os from 'os';
import { saveLastDate } from './utils/date-store';

@Injectable()
export class NseService {
    private readonly logger = new Logger(NseService.name);
    private desktopPath = path.join(os.homedir(), 'Desktop', 'NSE-Data');
    private folders = ['stocks', 'indices', 'ma', 'broad'];

    private urls = {
        stocks: (date: string) =>
            `https://archives.nseindia.com/products/content/sec_bhavdata_full_${date}.csv`,
        indices: (date: string) =>
            `https://archives.nseindia.com/content/indices/ind_close_all_${date}.csv`,
        ma: (date: string) => {
            const shortDate = date.slice(0, 4) + date.slice(6); // ddmmyy
            return `https://archives.nseindia.com/archives/equities/mkt/MA${shortDate}.csv`;
        },
        broad: () =>
            `https://archives.nseindia.com/content/indices/ind_nifty50list.csv`,
    };

    private ensureFolders(): void {
        if (!fs.existsSync(this.desktopPath)) fs.mkdirSync(this.desktopPath);
        this.folders.forEach(folder => {
            const fullPath = path.join(this.desktopPath, folder);
            if (!fs.existsSync(fullPath)) fs.mkdirSync(fullPath);
        });
    }

    private async download(url: string, folder: string, filename: string): Promise<string> {
        const filePath = path.join(this.desktopPath, folder, filename);
        try {
            const response = await axios.get(url, { responseType: 'stream' });
            return new Promise((resolve, reject) => {
                const writer = fs.createWriteStream(filePath);
                (response.data as NodeJS.ReadableStream).pipe(writer);
                writer.on('finish', () => resolve(filePath));
                writer.on('error', reject);
            });
        } catch (error) {
            // Type-safe check for AxiosError
            if (error instanceof AxiosError && error.response?.status === 404) {
                this.logger.warn(`File not found for URL: ${url}`);
            } else {
                this.logger.error(`Error downloading ${url}: ${(error as Error).message}`);
            }
            throw error; // Rethrow to handle in caller
        }
    }

    async downloadAllCSVs(dates: string[]): Promise<string[]> {
        this.ensureFolders();
        const saved: string[] = [];
        const successfulDates: string[] = [];

        // A queue of dates to process, sorted chronologically
        const datesQueue = [...dates].sort();

        // Number of concurrent downloads
        const concurrencyLimit = 5;

        // Worker function that picks dates from the queue and downloads files
        const worker = async () => {
            while (datesQueue.length > 0) {
                // Get the next date from the queue
                const date = datesQueue.shift();
                if (!date) continue;

                try {
                    // Attempt to download all three date-specific files
                    const files = await Promise.all([
                        this.download(this.urls.stocks(date), 'stocks', `${date}.csv`),
                        this.download(this.urls.indices(date), 'indices', `${date}.csv`),
                        this.download(this.urls.ma(date), 'ma', `${date}.csv`),
                    ]);
                    saved.push(...files);
                    successfulDates.push(date); // Record successful download
                } catch (error) {
                    this.logger.log(`Skipping date ${date} due to unavailable data (likely holiday or invalid date).`);
                    // Continue to next date without adding to saved
                }
            }
        };

        // Create and start the workers
        const workers = Array(concurrencyLimit).fill(null).map(worker);
        await Promise.all(workers);

        // Download broad once, outside the loop (it's date-independent)
        try {
            const broadPath = await this.download(this.urls.broad(), 'broad', `nifty50list.csv`);
            saved.push(broadPath);
        } catch (error) {
            this.logger.error(`Failed to download broad market list: ${(error as Error).message}`);
        }

        // Save the latest successful date if any were processed successfully
        if (successfulDates.length > 0) {
            // Sort to find the latest date among all successful downloads
            const latestSuccessfulDate = successfulDates.sort().pop();
            if (latestSuccessfulDate) {
                saveLastDate(latestSuccessfulDate);
            }
        }

        return saved;
    }
}
