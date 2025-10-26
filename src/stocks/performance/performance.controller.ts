import { Controller, Get, Query } from '@nestjs/common';
import { PerformanceService } from './performance.service';

@Controller('performance')
export class PerformanceController {
    constructor(private readonly performanceService: PerformanceService) { }

    @Get('top-gainers-losers')
    async getTopGainersLosers(@Query('date') date?: string): Promise<{ topGainers: { symbol: string; percentage: number }[]; topLosers: { symbol: string; percentage: number }[] }> {
        return this.performanceService.getTopGainerLoser(date);
    }
}
