import { Injectable } from '@nestjs/common';
import { DateDto } from './dto/date.dto';

@Injectable()
export class DateService {
  getCurrentDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  getDateDetails(): DateDto {
    const today = new Date();
    return {
      date: today.toISOString().split('T')[0],
      dayOfWeek: today.toLocaleDateString('en-US', { weekday: 'long' }),
    };
  }

}
