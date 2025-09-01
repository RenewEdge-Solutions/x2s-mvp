import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Facility } from './locations/facility.entity';
import { Repository } from 'typeorm';

async function mockFacilityCapacity() {
  const app = await NestFactory.createApplicationContext(AppModule, { logger: false });
  try {
    const facilityRepo = app.get<Repository<Facility>>(getRepositoryToken(Facility));
    // Remove all existing facilities for a clean mock
    await facilityRepo.clear();

    // Mock up some facilities with realistic total capacity
    const facilities: Omit<Facility, 'id' | 'geo' | 'structures'>[] = [
      { name: 'Main Building', type: 'building' },
      { name: 'Farm Area', type: 'farm' },
    ];
    await facilityRepo.save(facilities);

    // Mock facility capacity (static for now, e.g., sum of all structure sizes for each facility)
    // For demonstration, print to console
    const facilityCapacities = [
      { name: 'Main Building', totalCapacity: 1200, usedCapacity: 900 }, // 75% utilization
      { name: 'Farm Area', totalCapacity: 2000, usedCapacity: 1200 },   // 60% utilization
    ];
    for (const f of facilityCapacities) {
      console.log(`Facility: ${f.name}, Total Capacity: ${f.totalCapacity}, Used: ${f.usedCapacity}, Utilization: ${Math.round((f.usedCapacity / f.totalCapacity) * 100)}%`);
    }
  } catch (err) {
    console.error('Facility Capacity mock error:', err);
    process.exitCode = 1;
  } finally {
    await app.close();
  }
}

mockFacilityCapacity();
