import { Module } from '@nestjs/common';
import { NseService } from './nse.service';
import { NseController } from './nse.controller';

@Module({
  providers: [NseService],
  controllers: [NseController]
})
export class NseModule {}
