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

@Module({
  imports: [
    TypeOrmModule.forRootAsync(ormConfig),
    TypeOrmModule.forFeature([Plant, Harvest]),
    AuthModule,
    UsersModule,
    PlantsModule,
    HarvestsModule,
    LifecycleModule,
    IntegrityModule,
  ],
})
export class AppModule {}
