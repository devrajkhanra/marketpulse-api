// src/nse/nse.controller.ts
import { Body, Controller, Get, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { NseService } from './nse.service';
import { getLastDate } from './utils/date-store';
import { DateArrayDto } from './dto/date-array.dto';

@Controller('nse')
export class NseController {
    constructor(private readonly nseService: NseService) { }

    @Post('download')
    @UsePipes(new ValidationPipe({ transform: true }))
    async downloadCSVs(@Body() body: DateArrayDto): Promise<string[]> {
        return this.nseService.downloadAllCSVs(body.dates);
    }

    @Get('last-date')
    getLastDownloadedDate(): string | null {
        return getLastDate();
    }
}