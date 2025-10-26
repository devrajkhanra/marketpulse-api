import * as fs from 'fs';
import * as path from 'path';

const storePath = path.join(process.cwd(), 'last-success.json');

export function saveLastDate(date: string): void {
    fs.writeFileSync(storePath, JSON.stringify({ lastDate: date }, null, 2));
}

export function getLastDate(): string | null {
    if (!fs.existsSync(storePath)) return null;
    const data = JSON.parse(fs.readFileSync(storePath, 'utf-8'));
    return data.lastDate || null;
}
