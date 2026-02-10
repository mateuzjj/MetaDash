import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { KpiService } from './kpi.service';
import { KpiController } from './kpi.controller';
import { KpiDefinition } from '../../entities/kpi-definition.entity';
import { KpiValue } from '../../entities/kpi-value.entity';

@Module({
  imports: [TypeOrmModule.forFeature([KpiDefinition, KpiValue])],
  controllers: [KpiController],
  providers: [KpiService],
  exports: [KpiService],
})
export class KpiModule {}
