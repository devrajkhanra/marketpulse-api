import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

@Injectable()
export class VolumeService {
    calculateVolumeRatio(dates: string[]): { symbol: string; difference: string }[] {
        if (dates.length !== 2) {
            throw new Error('Exactly two dates are required');
        }

        const [prevDate, latestDate] = dates;
        const dataPath = path.join(process.cwd(), '.data', 'NSE-Data');
        const basePath = path.join(dataPath, 'stocks');
        const prevPath = path.join(basePath, `${prevDate}.csv`);
        const latestPath = path.join(basePath, `${latestDate}.csv`);

        let prevContent: string;
        let latestContent: string;
        try {
            prevContent = fs.readFileSync(prevPath, 'utf-8');
            latestContent = fs.readFileSync(latestPath, 'utf-8');
        } catch (err) {
            throw new Error('File not found or unable to read');
        }

        const prevVolumes = this.parseCSV(prevContent);
        const latestVolumes = this.parseCSV(latestContent);
        const niftySymbols = this.getNiftySymbols();

        const commonSymbols = Array.from(prevVolumes.keys()).filter((symbol) =>
            latestVolumes.has(symbol) && niftySymbols.has(symbol),
        );

        const results: { symbol: string; difference: string }[] = [];
        for (const symbol of commonSymbols.sort()) {
            const diff = latestVolumes.get(symbol)! / prevVolumes.get(symbol)!;
            results.push({ symbol, difference: diff.toFixed(2) });
        }

        return results;
    }

    private parseCSV(content: string): Map<string, number> {
        const volumes = new Map<string, number>();
        const lines = content.split(/\r?\n/);
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            const cols = line.split(',').map((col) => col.trim());
            if (cols.length < 11) continue;
            const symbol = cols[0];
            const series = cols[1];
            if (series === 'EQ') {
                const ttl = parseInt(cols[10], 10);
                if (!isNaN(ttl)) {
                    volumes.set(symbol, ttl);
                }
            }
        }
        return volumes;
    }

    private getNiftySymbols(): Set<string> {
        const dataPath = path.join(process.cwd(), '.data', 'NSE-Data');
        const niftyPath = path.join(dataPath, 'broad', 'nifty50list.csv');
        let content: string;
        try {
            content = fs.readFileSync(niftyPath, 'utf-8');
        } catch (err) {
            throw new Error('Nifty file not found or unable to read');
        }
        const symbols = new Set<string>();
        const lines = content.split(/\r?\n/);
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            const cols = line.split(',').map((col) => col.trim());
            if (cols.length >= 3) {
                const symbol = cols[2];
                symbols.add(symbol);
            }
        }
        return symbols;
    }
}