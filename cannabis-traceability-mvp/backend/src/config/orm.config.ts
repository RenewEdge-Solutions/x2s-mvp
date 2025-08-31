import { TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { Plant } from '../plants/plant.entity';
import { Harvest } from '../harvests/harvest.entity';
import { UserEntity } from '../users/user.entity';
import { ReportEntity } from '../reports/report.entity';
import { Geolocation } from '../locations/geolocation.entity';
import { Facility } from '../locations/facility.entity';
import { Structure } from '../locations/structure.entity';
import { Equipment } from '../equipment/equipment.entity';
import { InventoryItem } from '../inventory/inventory.entity';
import { Event } from '../events/event.entity';

const ormConfig: TypeOrmModuleAsyncOptions = {
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
  ],
  useFactory: async () => {
    const host = process.env.POSTGRES_HOST || 'localhost';
    const port = parseInt(process.env.POSTGRES_PORT || '5433', 10);
    const username = process.env.POSTGRES_USER || 'trace_user';
    const password = process.env.POSTGRES_PASSWORD || 'trace_password';
    const database = process.env.POSTGRES_DB || 'traceability';
    
    return {
      type: 'postgres',
      host,
      port,
      username,
      password,
      database,
      entities: [
        Plant,
        Harvest,
        UserEntity,
        ReportEntity,
        Geolocation,
        Facility,
        Structure,
        Equipment,
        InventoryItem,
        Event,
      ],
      synchronize: true, // Set to false in production
      logging: false,
    };
  },
};

export default ormConfig;
