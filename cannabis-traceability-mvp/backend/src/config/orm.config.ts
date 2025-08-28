import { TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { Plant } from '../plants/plant.entity';
import { Harvest } from '../harvests/harvest.entity';
import { UserEntity } from '../users/user.entity';

const ormConfig: TypeOrmModuleAsyncOptions = {
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
  ],
  useFactory: async () => {
    const host = process.env.POSTGRES_HOST || 'localhost';
    const port = parseInt(process.env.POSTGRES_PORT || '5432', 10);
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
  entities: [Plant, Harvest, UserEntity],
      synchronize: true,
      logging: false,
    } as const;
  },
};

export default ormConfig;
