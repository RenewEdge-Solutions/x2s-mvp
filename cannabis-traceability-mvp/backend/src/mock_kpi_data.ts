import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Harvest } from './harvests/harvest.entity';
import { Repository } from 'typeorm';

async function mockKpiData() {
  const app = await NestFactory.createApplicationContext(AppModule, { logger: false });
  try {
    const harvestRepo = app.get<Repository<Harvest>>(getRepositoryToken(Harvest));

    // Remove all existing harvests for a clean mock
    await harvestRepo.clear();

    // Insert realistic harvests for KPI
    const now = new Date();
    const harvests: Omit<Harvest, 'id'>[] = [
      // Drying
      { plantId: 'plant-1', yieldGrams: 1200, status: 'drying', harvestedAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 10) },
      { plantId: 'plant-2', yieldGrams: 950, status: 'drying', harvestedAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 8) },
      // Dried
      { plantId: 'plant-3', yieldGrams: 1100, status: 'dried', harvestedAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 20) },
      { plantId: 'plant-4', yieldGrams: 1050, status: 'dried', harvestedAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 18) },
      { plantId: 'plant-5', yieldGrams: 980, status: 'dried', harvestedAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 15) },
      // Storage (simulate by more dried harvests)
      { plantId: 'plant-6', yieldGrams: 1300, status: 'dried', harvestedAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 12) },
      { plantId: 'plant-7', yieldGrams: 1250, status: 'dried', harvestedAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 11) },
    ];
    await harvestRepo.save(harvests);

    // Mock sales and revenue (not in schema, but can be added to a new table or reported as static for now)
    // For now, print to console for dashboard use
    const sold = 5; // 5 lots sold
    const revenue = 42000; // $42,000 revenue
    console.log('Mock KPI: Drying:', 2, 'Dried:', 5, 'Storage:', 2, 'Sold:', sold, 'Revenue:', revenue);
  } catch (err) {
    console.error('KPI mock error:', err);
    process.exitCode = 1;
  } finally {
    await app.close();
  }
}

mockKpiData();
