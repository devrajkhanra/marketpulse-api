import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DateModule } from './date/date.module';
import { NseModule } from './nse/nse.module';
import { StocksModule } from './stocks/stocks.module';
import { SectorsModule } from './sectors/sectors.module';

@Module({
  imports: [
    DateModule,
    NseModule,
    StocksModule,
    SectorsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
