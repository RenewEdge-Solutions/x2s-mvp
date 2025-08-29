import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import ormConfig from './config/orm.config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PlantsModule } from './plants/plants.module';
import { HarvestsModule } from './harvests/harvests.module';
import { LifecycleModule } from './lifecycle/lifecycle.module';
import { IntegrityModule } from './integrity/integrity.module';
import { Plant } from './plants/plant.entity';
import { Harvest } from './harvests/harvest.entity';
import { ReportsModule } from './reports/reports.module';
import { LocationsModule } from './locations/locations.module';
import { Geolocation } from './locations/geolocation.entity';
import { Facility } from './locations/facility.entity';
import { Structure } from './locations/structure.entity';

@Module({
  imports: [
  TypeOrmModule.forRootAsync(ormConfig),
  TypeOrmModule.forFeature([Plant, Harvest, Geolocation, Facility, Structure]),
    AuthModule,
    UsersModule,
    PlantsModule,
    HarvestsModule,
    LifecycleModule,
  IntegrityModule,
  ReportsModule,
  LocationsModule,
  ],
})
export class AppModule {}
