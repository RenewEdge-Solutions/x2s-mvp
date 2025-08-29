import { Controller, Get, Post, Param, Res, Query, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { ReportsService } from './reports.service';
import { ReportType } from './report.entity';

@Controller('reports')
export class ReportsController {
  constructor(private reports: ReportsService) {}

  @Get('types')
  types() {
    return this.reports.listTypes();
  }

  @Get()
  list() {
    return this.reports.list();
  }

  @Post(':type')
  async create(@Param('type') type: ReportType) {
    return this.reports.create(type);
  }

  @Get('download/:id')
  async download(@Param('id') id: string, @Res() res: Response) {
    const file = await this.reports.getFilePath(id);
    if (!file) throw new HttpException('Not found', HttpStatus.NOT_FOUND);
    res.download(file.path, file.filename);
  }

  @Get('auto/:type')
  async auto(@Param('type') type: ReportType, @Res() res: Response) {
    const { content, mime, extension } = await this.reports.generate(type);
    const filename = `${type}-${new Date().toISOString().slice(0, 10)}.${extension}`;
    res.setHeader('Content-Type', mime);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(content);
  }
}
