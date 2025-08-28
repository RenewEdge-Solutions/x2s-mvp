import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Harvest } from './harvest.entity';
import { HarvestsService } from './harvests.service';
import { HarvestsController } from './harvests.controller';
import { PlantsModule } from '../plants/plants.module';

@Module({
  imports: [TypeOrmModule.forFeature([Harvest]), PlantsModule],
  providers: [HarvestsService],
  controllers: [HarvestsController],
  exports: [HarvestsService],
})
export class HarvestsModule {}
