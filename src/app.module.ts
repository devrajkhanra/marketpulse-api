import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DateModule } from './date/date.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NseModule } from './nse/nse.module';
import { PerformanceModule } from './performance/performance.module';
import { VolumeModule } from './volume/volume.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'root',
      database: 'marketpulse',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true, // use false in production
    }),
    DateModule,
    NseModule,
    PerformanceModule,
    VolumeModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
