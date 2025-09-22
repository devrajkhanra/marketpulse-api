import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';
import * as os from 'os';

@Injectable()
export class NseService {
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
        const response = await axios.get(url, { responseType: 'stream' });

        return new Promise((resolve, reject) => {
            const writer = fs.createWriteStream(filePath);
            (response.data as NodeJS.ReadableStream).pipe(writer);
            writer.on('finish', () => resolve(filePath));
            writer.on('error', reject);
        });
    }


    async downloadAllCSVs(dates: string[]): Promise<string[]> {
        this.ensureFolders();
        const saved: string[] = [];

        for (const date of dates) {
            const files = await Promise.all([
                this.download(this.urls.stocks(date), 'stocks', `${date}.csv`),
                this.download(this.urls.indices(date), 'indices', `${date}.csv`),
                this.download(this.urls.ma(date), 'ma', `${date}.csv`),
            ]);
            saved.push(...files);
        }

        // Download broad once
        const broadPath = await this.download(this.urls.broad(), 'broad', `nifty50list.csv`);
        saved.push(broadPath);

        return saved;
    }
}
