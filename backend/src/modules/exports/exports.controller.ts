import {
  Controller,
  Post,
  Body,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';

import { ExportsService } from './exports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Exports')
@Controller('exports')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ExportsController {
  constructor(private exportsService: ExportsService) {}

  @Post('csv')
  @ApiOperation({ summary: 'Export data to CSV' })
  @ApiResponse({ status: 200, description: 'CSV file generated' })
  async exportCSV(@Body() data: any[], @Res() res: Response) {
    const csv = await this.exportsService.exportToCSV(data);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=export.csv');
    res.send(csv);
  }

  @Post('pdf')
  @ApiOperation({ summary: 'Export data to PDF' })
  @ApiResponse({ status: 200, description: 'PDF file generated' })
  async exportPDF(@Body() data: any[], @Res() res: Response) {
    const pdf = await this.exportsService.exportToPDF(data);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=export.pdf');
    res.send(pdf);
  }
}
