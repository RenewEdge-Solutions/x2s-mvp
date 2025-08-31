import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Geolocation } from './geolocation.entity';
import { Facility } from './facility.entity';
import { Structure } from './structure.entity';
import { Plant } from '../plants/plant.entity';
import { LocationsService } from './locations.service';
import { OccupancyService } from './occupancy.service';
import { LocationsController } from './locations.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Geolocation, Facility, Structure, Plant])],
  providers: [LocationsService, OccupancyService],
  controllers: [LocationsController],
  exports: [LocationsService, OccupancyService],
})
export class LocationsModule {}
