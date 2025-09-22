import { Controller, Get } from '@nestjs/common';
import { DateService } from './date.service';
import { DateDto } from './dto/date.dto';

@Controller('date')
export class DateController {
    constructor(private readonly dateService: DateService) { }

    @Get()
    getDate(): string {
        return this.dateService.getCurrentDate();
    }

    @Get('details')
    getDateDetails(): DateDto {
        return this.dateService.getDateDetails();
    }
}
