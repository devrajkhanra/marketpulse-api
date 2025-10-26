import { Injectable, NotFoundException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import csv from 'csv-parser';
import { GetSectorPerformanceResponseDto, GetSectorVolumeRatioResponseDto } from './dto/sectors.dto';

@Injectable()
export class SectorsService {
    private dataPath = path.join(process.cwd(), '.data', 'NSE-Data');
    private readonly indicesFilePath = path.join(this.dataPath, 'indices');

    private readonly majorSectors = [
        'Nifty Auto',
        'Nifty Bank',
        'Nifty Financial Services',
        'Nifty Financial Services Ex-Bank',
        'Nifty Financial Services 25/50',
        'Nifty FMCG',
        'Nifty Healthcare',
        'Nifty IT',
        'Nifty Media',
        'Nifty Metal',
        'Nifty Pharma',
        'Nifty Private Bank',
        'Nifty PSU Bank',
        'Nifty Realty',
        'Nifty Consumer Durables',
        'Nifty Oil and Gas',
        'Nifty Chemicals',
        'Nifty MidSmall Financial Services',
        'Nifty MidSmall Healthcare',
        'Nifty MidSmall IT & Telecom',
    ];

    async getSectorPerformance(date: string): Promise<GetSectorPerformanceResponseDto> {
        const filePath = path.join(this.indicesFilePath, `${date}.csv`);

        if (!fs.existsSync(filePath)) {
            throw new NotFoundException(`Data for date ${date} not found.`);
        }

        const sectorsData = await this.parseSectorsData(filePath);
        const sectorsPerformance = this.calculateSectorsPerformance(sectorsData);
        const sortedSectors = this.sortSectorsByPerformance(sectorsPerformance);

        return {
            topGainers: sortedSectors.slice(0, 5),
            topLosers: sortedSectors.slice(-5).reverse(),
        };
    }

    async getSectorVolumeRatio(currentDate: string, previousDate: string): Promise<GetSectorVolumeRatioResponseDto> {
        const currentFilePath = path.join(this.indicesFilePath, `${currentDate}.csv`);
        const previousFilePath = path.join(this.indicesFilePath, `${previousDate}.csv`);

        if (!fs.existsSync(currentFilePath)) {
            throw new NotFoundException(`Data for date ${currentDate} not found.`);
        }
        if (!fs.existsSync(previousFilePath)) {
            throw new NotFoundException(`Data for date ${previousDate} not found.`);
        }

        const currentSectorsVolume = await this.parseSectorsVolumeData(currentFilePath);
        const previousSectorsVolume = await this.parseSectorsVolumeData(previousFilePath);

        const volumeRatios = this.calculateVolumeRatio(currentSectorsVolume, previousSectorsVolume);
        const sortedVolumeRatios = this.sortSectorsByVolumeRatio(volumeRatios);

        return {
            topVolumeGainers: sortedVolumeRatios.slice(0, 5),
            topVolumeLosers: sortedVolumeRatios.slice(-5).reverse(),
        };
    }

    private async parseSectorsData(filePath: string): Promise<{ sector: string; percentageChange: number }[]> {
        const results: any[] = [];
        return new Promise((resolve, reject) => {
            fs.createReadStream(filePath)
                .pipe(csv())
                .on('data', (data) => results.push(data))
                .on('end', () => {
                    const sectorsData = results
                        .filter(row => this.majorSectors.includes(row['Index Name']))
                        .map(row => ({
                            sector: row['Index Name'],
                            percentageChange: parseFloat(row['Change(%)']),
                        }));
                    resolve(sectorsData);
                })
                .on('error', (error) => reject(error));
        });
    }

    private async parseSectorsVolumeData(filePath: string): Promise<{ sector: string; volume: number }[]> {
        const results: any[] = [];
        return new Promise((resolve, reject) => {
            fs.createReadStream(filePath)
                .pipe(csv())
                .on('data', (data) => results.push(data))
                .on('end', () => {
                    const sectorsData = results
                        .filter(row => this.majorSectors.includes(row['Index Name']))
                        .map(row => ({
                            sector: row['Index Name'],
                            volume: parseFloat(row['Traded Volume (in Lakhs)']),
                        }));
                    resolve(sectorsData);
                })
                .on('error', (error) => reject(error));
        });
    }

    private calculateSectorsPerformance(sectorsData: { sector: string; percentageChange: number }[]): { sector: string; percentageChange: number }[] {
        return sectorsData;
    }

    private calculateVolumeRatio(currentData: { sector: string; volume: number }[], previousData: { sector: string; volume: number }[]): { sector: string; volumeRatio: number }[] {
        const volumeRatios: { sector: string; volumeRatio: number }[] = [];
        const MINIMUM_VOLUME_THRESHOLD = 1000;

        currentData.forEach(currentSector => {
            const previousSector = previousData.find(prev => prev.sector === currentSector.sector);

            if (
                previousSector &&
                previousSector.volume > MINIMUM_VOLUME_THRESHOLD &&
                currentSector.volume > MINIMUM_VOLUME_THRESHOLD
            ) {
                const rawRatio = currentSector.volume / previousSector.volume;
                const volumeRatio = Math.round(rawRatio * 100) / 100;

                volumeRatios.push({ sector: currentSector.sector, volumeRatio });
            }
        });

        return volumeRatios;
    }

    private sortSectorsByPerformance(sectorsPerformance: { sector: string; percentageChange: number }[]): { sector: string; percentageChange: number }[] {
        return sectorsPerformance.sort((a, b) => b.percentageChange - a.percentageChange);
    }

    private sortSectorsByVolumeRatio(volumeRatios: { sector: string; volumeRatio: number }[]): { sector: string; volumeRatio: number }[] {
        return volumeRatios.sort((a, b) => b.volumeRatio - a.volumeRatio);
    }
}
