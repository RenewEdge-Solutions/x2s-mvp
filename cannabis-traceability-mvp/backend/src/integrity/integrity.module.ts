import { Module } from '@nestjs/common';
import { IntegrityController } from './integrity.controller';
import { PlantsModule } from '../plants/plants.module';
import { HarvestsModule } from '../harvests/harvests.module';

@Module({
  imports: [PlantsModule, HarvestsModule],
  controllers: [IntegrityController],
})
export class IntegrityModule {}
