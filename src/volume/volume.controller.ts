// volume.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { VolumeService } from './volume.service';

interface VolumeRequestBody {
    dates: string[];
}

@Controller('volume')
export class VolumeController {
    constructor(private readonly volumeService: VolumeService) { }

    @Post('differences')
    getVolumeRatio(@Body() body: VolumeRequestBody): { symbol: string; difference: string }[] {
        return this.volumeService.calculateVolumeRatio(body.dates);
    }
}