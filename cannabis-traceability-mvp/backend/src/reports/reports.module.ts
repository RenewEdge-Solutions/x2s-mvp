import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportEntity } from './report.entity';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { PlantsModule } from '../plants/plants.module';
import { HarvestsModule } from '../harvests/harvests.module';

@Module({
  imports: [TypeOrmModule.forFeature([ReportEntity]), PlantsModule, HarvestsModule],
  providers: [ReportsService],
  controllers: [ReportsController],
})
export class ReportsModule {}
