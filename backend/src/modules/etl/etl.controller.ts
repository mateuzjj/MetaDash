import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

import { EtlService } from './etl.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../entities/user.entity';

@ApiTags('ETL')
@Controller('etl')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class EtlController {
  constructor(private etlService: EtlService) {}

  @Post('sync')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Trigger manual sync for a connector' })
  @ApiResponse({ status: 200, description: 'Sync triggered' })
  async triggerSync(@Body('connectorId') connectorId: string) {
    await this.etlService.triggerManualSync(connectorId);
    return { message: 'Sync triggered successfully' };
  }

  @Post('reprocess')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Reprocess data for a date range' })
  @ApiResponse({ status: 200, description: 'Reprocessing started' })
  async reprocessDateRange(
    @Body('connectorId') connectorId: string,
    @Body('startDate') startDate: string,
    @Body('endDate') endDate: string,
  ) {
    await this.etlService.reprocessDateRange(
      connectorId,
      new Date(startDate),
      new Date(endDate),
    );
    return { message: 'Reprocessing started successfully' };
  }
}
