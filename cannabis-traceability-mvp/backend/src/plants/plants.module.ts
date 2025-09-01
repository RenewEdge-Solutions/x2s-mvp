
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Plant } from './plant.entity';
import { PlantsService } from './plants.service';
import { PlantsController } from './plants.controller';
import { InventoryModule } from '../inventory/inventory.module';
import { Structure } from '../locations/structure.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Plant, Structure]), InventoryModule],
  providers: [PlantsService],
  controllers: [PlantsController],
  exports: [PlantsService],
})
export class PlantsModule {}
