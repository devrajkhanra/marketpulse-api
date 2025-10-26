// src/performance/performance.service.ts
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

@Injectable()
export class PerformanceService {
    private readonly logger = new Logger(PerformanceService.name);
    private dataPath = path.join(process.cwd(), '.data', 'NSE-Data');
    private desktopPath = path.join(this.dataPath, 'ma');

    private parseDate(dateStr: string): Date {
        const day = parseInt(dateStr.slice(0, 2));
        const month = parseInt(dateStr.slice(2, 4)) - 1;
        const year = parseInt(dateStr.slice(4, 8));
        return new Date(year, month, day);
    }

    async getTopGainerLoser(date?: string): Promise<{ topGainers: { symbol: string; percentage: number }[]; topLosers: { symbol: string; percentage: number }[] }> {
        if (!fs.existsSync(this.desktopPath)) {
            throw new NotFoundException('Data directory not found');
        }

        let latestFile: string;

        if (date) {
            latestFile = `${date}.csv`;
            const filePath = path.join(this.desktopPath, latestFile);
            if (!fs.existsSync(filePath)) {
                throw new NotFoundException(`File for date ${date} not found`);
            }
        } else {
            const files = fs.readdirSync(this.desktopPath).filter(f => f.endsWith('.csv'));
            if (files.length === 0) {
                throw new NotFoundException('No data files found');
            }

            // Sort files by date descending
            const sortedFiles = files.sort((a, b) => {
                const dateA = this.parseDate(a.replace('.csv', ''));
                const dateB = this.parseDate(b.replace('.csv', ''));
                return dateB.getTime() - dateA.getTime();
            });

            latestFile = sortedFiles[0];
        }

        const filePath = path.join(this.desktopPath, latestFile);

        const data = fs.readFileSync(filePath, 'utf8');
        const lines = data.split(/\r?\n/);

        let gainerStart = -1;
        let loserStart = -1;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line.startsWith(',Top Five Nifty 50 Gainers:') || line === 'Top Five Nifty 50 Gainers:') {
                gainerStart = i + 1;
            } else if (line.startsWith(',Top Five Nifty 50 Losers:') || line === 'Top Five Nifty 50 Losers:') {
                loserStart = i + 1;
            }
        }

        if (gainerStart === -1 || loserStart === -1) {
            throw new Error('Gainers or Losers section not found');
        }

        const topGainers: { symbol: string; percentage: number }[] = [];
        let count = 0;
        for (let i = gainerStart; i < lines.length && count < 5; i++) {
            const line = lines[i].trim();
            if (!line) continue; // skip empty

            const parts = line.split(',').map(p => p.trim()).filter(p => p);
            if (parts.length >= 2) {
                const symbol = parts[0];
                const percentageStr = parts[parts.length - 1].replace('%', '');
                const percentage = parseFloat(percentageStr);
                if (!isNaN(percentage)) {
                    topGainers.push({ symbol, percentage: parseFloat(percentage.toFixed(2)) });
                    count++;
                }
            }
        }

        const topLosers: { symbol: string; percentage: number }[] = [];
        count = 0;
        for (let i = loserStart; i < lines.length && count < 5; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            const parts = line.split(',').map(p => p.trim()).filter(p => p);
            if (parts.length >= 2) {
                const symbol = parts[0];
                const percentageStr = parts[parts.length - 1].replace('%', '');
                const percentage = parseFloat(percentageStr);
                if (!isNaN(percentage)) {
                    topLosers.push({ symbol, percentage: parseFloat(percentage.toFixed(2)) });
                    count++;
                }
            }
        }

        if (topGainers.length < 5 || topLosers.length < 5) {
            throw new Error('Insufficient data for top 5 gainers or losers');
        }

        return { topGainers, topLosers };
    }
}