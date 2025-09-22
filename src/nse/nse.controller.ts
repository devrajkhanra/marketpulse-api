import { Body, Controller, Get, Post } from '@nestjs/common';
import { NseService } from './nse.service';
import { getLastDate } from './utils/date-store';

@Controller('nse')
export class NseController {
    constructor(private readonly nseService: NseService) { }

    @Post('download')
    async downloadCSVs(@Body('dates') dates: string[]): Promise<string[]> {
        return this.nseService.downloadAllCSVs(dates);
    }

    @Get('last-date')
    getLastDownloadedDate(): string | null {
        return getLastDate();
    }
}
