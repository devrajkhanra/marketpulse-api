import { Module } from '@nestjs/common';
import { PerformanceModule } from './performance/performance.module';
import { VolumeModule } from './volume/volume.module';

@Module({
  imports: [PerformanceModule, VolumeModule],
  exports: [PerformanceModule, VolumeModule],
})
export class StocksModule {}
