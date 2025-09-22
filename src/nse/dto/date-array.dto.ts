// src/nse/dto/date-array.dto.ts
import { IsArray, IsString, Matches } from 'class-validator';

export class DateArrayDto {
    @IsArray()
    @IsString({ each: true })
    @Matches(/^\d{8}$/, { each: true, message: 'Date must be in ddmmyyyy format' })
    dates: string[];
}
