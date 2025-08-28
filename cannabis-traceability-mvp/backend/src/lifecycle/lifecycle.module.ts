import { Module } from '@nestjs/common';
import { LifecycleController } from './lifecycle.controller';
import { PlantsModule } from '../plants/plants.module';
import { HarvestsModule } from '../harvests/harvests.module';

@Module({
  imports: [PlantsModule, HarvestsModule],
  controllers: [LifecycleController],
})
export class LifecycleModule {}
