import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DataSource } from 'typeorm';
import { Plant } from './plants/plant.entity';
import { Harvest } from './harvests/harvest.entity';
import { ReportEntity } from './reports/report.entity';
import { UserEntity } from './users/user.entity';
import { Geolocation } from './locations/geolocation.entity';
import { Facility } from './locations/facility.entity';
import { Structure } from './locations/structure.entity';
import fs from 'fs';
import path from 'path';

async function cleanup() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn'],
  });

  try {
    const ds = app.get(DataSource);
    const plantRepo = ds.getRepository(Plant);
    const harvestRepo = ds.getRepository(Harvest);
  const reportRepo = ds.getRepository(ReportEntity);
  const userRepo = ds.getRepository(UserEntity);
  const structureRepo = ds.getRepository(Structure);
  const facilityRepo = ds.getRepository(Facility);
  const geoRepo = ds.getRepository(Geolocation);

    const counts = {
      plants: await plantRepo.count(),
      harvests: await harvestRepo.count(),
      reports: await reportRepo.count(),
      users: await userRepo.count(),
    };

    // Delete dependent data first
  await harvestRepo.clear();
    await reportRepo.clear();
    await plantRepo.clear();
  await structureRepo.clear();
  await facilityRepo.clear();
  await geoRepo.clear();

    // Keep only the Daniel.Veselski user; remove all others
    const keep = await userRepo.findOne({ where: { username: 'Daniel.Veselski' } });
    if (keep) {
      await userRepo.createQueryBuilder().delete().where('username != :u', { u: 'Daniel.Veselski' }).execute();
    } else {
      await userRepo.clear();
    }

    // Clean stored report files
    const reportsDir = path.resolve(__dirname, '..', 'storage', 'reports');
    try {
      if (fs.existsSync(reportsDir)) {
        for (const f of fs.readdirSync(reportsDir)) {
          const p = path.join(reportsDir, f);
          try { fs.rmSync(p, { recursive: true, force: true }); } catch {}
        }
      }
    } catch {}

    console.log(
  `Cleanup complete. Removed ${counts.plants} plants, ${counts.harvests} harvests, ${counts.reports} reports. Users kept: Daniel.Veselski only.`
    );
  } catch (err) {
    console.error('Cleanup error:', err);
    process.exitCode = 1;
  } finally {
    await app.close();
  }
}

cleanup();
