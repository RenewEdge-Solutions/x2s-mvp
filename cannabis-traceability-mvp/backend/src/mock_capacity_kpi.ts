import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Structure } from './locations/structure.entity';
import { Repository } from 'typeorm';

async function mockCapacityKpi() {
  const app = await NestFactory.createApplicationContext(AppModule, { logger: false });
  try {
    const structureRepo = app.get<Repository<Structure>>(getRepositoryToken(Structure));
    // Remove all existing structures for a clean mock
    await structureRepo.clear();

    // Mock up some structures with realistic total capacity
    const structures: Omit<Structure, 'id' | 'facility'>[] = [
      { name: 'Drying Room', type: 'room', usage: 'Drying', size: 200, beds: null, tents: null, racks: null },
      { name: 'Flower Room', type: 'room', usage: 'Flowering', size: 300, beds: null, tents: null, racks: null },
      { name: 'Veg Room', type: 'room', usage: 'Vegetative', size: 250, beds: null, tents: null, racks: null },
      { name: 'Storage Room 1', type: 'room', usage: 'Storage', size: 150, beds: null, tents: null, racks: null },
      { name: 'Greenhouse 1', type: 'greenhouse', usage: 'Vegetative', size: 400, beds: 10, tents: null, racks: null },
      { name: 'Greenhouse 2', type: 'greenhouse', usage: 'Vegetative', size: 400, beds: 10, tents: null, racks: null },
    ];
    await structureRepo.save(structures);

    // Mock capacity utilization: e.g., 70% of total capacity used
    const totalCapacity = structures.reduce((sum, s) => sum + (s.size || 0), 0); // e.g., sum of room sizes
    const usedCapacity = Math.round(totalCapacity * 0.7); // 70% utilization
    console.log('Mock KPI: Total Capacity:', totalCapacity, 'Used Capacity:', usedCapacity, 'Utilization:', (usedCapacity / totalCapacity) * 100 + '%');
  } catch (err) {
    console.error('Capacity KPI mock error:', err);
    process.exitCode = 1;
  } finally {
    await app.close();
  }
}

mockCapacityKpi();
