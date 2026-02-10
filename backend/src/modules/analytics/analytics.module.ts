import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { KpiValue } from '../../entities/kpi-value.entity';
import { Campaign } from '../../entities/campaign.entity';

@Module({
  imports: [TypeOrmModule.forFeature([KpiValue, Campaign])],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
