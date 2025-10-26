import { Controller, Get, Query, Param } from '@nestjs/common';
import { SectorsService } from './sectors.service';
import { GetSectorPerformanceResponseDto, GetSectorVolumeRatioResponseDto } from './dto/sectors.dto';

@Controller('sectors')
export class SectorsController {
    constructor(private readonly sectorsService: SectorsService) { }

    @Get('performance/:date')
    async getSectorPerformance(
        @Param('date') date: string,
    ): Promise<GetSectorPerformanceResponseDto> {
        return this.sectorsService.getSectorPerformance(date);
    }

    @Get('volume-ratio/:currentDate/:previousDate')
    async getSectorVolumeRatio(
        @Param('currentDate') currentDate: string,
        @Param('previousDate') previousDate: string,
    ): Promise<GetSectorVolumeRatioResponseDto> {
        return this.sectorsService.getSectorVolumeRatio(currentDate, previousDate);
    }
}
