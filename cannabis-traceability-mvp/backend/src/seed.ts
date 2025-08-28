import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PlantsService } from './plants/plants.service';
import { HarvestsService } from './harvests/harvests.service';
import { UsersService } from './users/users.service';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn'],
  });

  try {
    const plantsService = app.get(PlantsService);
    const harvestsService = app.get(HarvestsService);
    const usersService = app.get(UsersService);

    // Seed users
    await usersService.upsert({
      username: 'Daniel.Veselski',
      password: 'pass123',
      role: 'Operator',
      firstName: 'Daniel',
      lastName: 'Veselski',
      email: 'daniel.veselski@example.com',
      phone: '+1 (555) 555-0101',
      address: '123 Aurora Ave, Springfield, USA',
  modules: ['cannabis', 'alkohol', 'mushrooms', 'explosives'],
    });
    await usersService.upsert({
      username: 'regulator1',
      password: 'pass123',
      role: 'Regulator',
      firstName: 'Rita',
      lastName: 'Regan',
      email: 'rita.regan@example.gov',
      phone: '+1 (555) 555-0110',
      address: '1 Government Plaza, Springfield, USA',
      modules: ['cannabis', 'alcohol'],
    });
    await usersService.upsert({
      username: 'auditor1',
      password: 'pass123',
      role: 'Auditor',
      firstName: 'Ari',
      lastName: 'Audit',
      email: 'ari.audit@example.com',
      phone: '+1 (555) 555-0120',
      address: '88 Ledger Ln, Springfield, USA',
      modules: ['cannabis', 'mushrooms'],
    });

    await usersService.upsert({
      username: 'grower1',
      password: 'pass123',
      role: 'Grower',
      firstName: 'Gina',
      lastName: 'Grow',
      email: 'gina.grow@example.com',
      phone: '+1 (555) 555-0130',
      address: '42 Green Row, Springfield, USA',
      modules: ['cannabis'],
    });

    await usersService.upsert({
      username: 'shop1',
      password: 'pass123',
      role: 'Shop',
      firstName: 'Sam',
      lastName: 'Seller',
      email: 'sam.seller@example.com',
      phone: '+1 (555) 555-0140',
      address: '100 Retail Ave, Springfield, USA',
      modules: ['cannabis'],
    });

    await usersService.upsert({
      username: 'lab1',
      password: 'pass123',
      role: 'Lab',
      firstName: 'Lara',
      lastName: 'Labtech',
      email: 'lara.labtech@example.com',
      phone: '+1 (555) 555-0150',
      address: '12 Science Park, Springfield, USA',
      modules: ['cannabis'],
    });

    // Determine current count to decide whether to seed more
  const existing = await plantsService.findAll();
  const targetPlants = 250; // ~200-300 for realism without overwhelming dev env
  const canBulkSeed = existing.length < targetPlants;

    // Strain catalog
    const strainCatalog = [
      'Blue Dream',
      'OG Kush',
      'Sour Diesel',
      'Girl Scout Cookies',
      'Granddaddy Purple',
      'Pineapple Express',
      'Gelato',
      'Gorilla Glue #4',
      'Wedding Cake',
      'Jack Herer',
      'AK-47',
      'Purple Haze',
      'Northern Lights',
      'Green Crack',
      'Super Lemon Haze',
    ];

    const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];
    const rnd = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

  const created: Array<{ id: string; strain: string; location: string; age: number; skipHarvest?: boolean }> = [];

    const now = new Date();
    const daysAgo = (n: number) => new Date(now.getTime() - n * 86400000);

    // Helpers to backdate fields
    const plantRepo = (plantsService as any).repo as import('typeorm').Repository<any>;
    const harvestRepo = (harvestsService as any).repo as import('typeorm').Repository<any>;
    async function backdatePlant(id: string, plantedAt: Date) {
      await plantRepo.update({ id }, { plantedAt });
    }

    // Build locations: 5 indoor rooms with racks, 20 greenhouses with beds
    const indoorRooms = Array.from({ length: 5 }, (_, i) => `Indoor Room ${i + 1}`);
    const greenhouses = Array.from({ length: 20 }, (_, i) => `Greenhouse ${i + 1}`);

    // Create seedlings/veg in indoor rooms: ~10 per room (bulk only)
    if (canBulkSeed) {
      for (const room of indoorRooms) {
        for (let i = 0; i < 10; i++) {
          const strain = pick(strainCatalog);
          const rack = rnd(1, 8);
          const { plant } = await plantsService.create({ strain, location: `${room} - Rack ${rack}`, by: 'operator1' });
          const age = rnd(0, 12); // first weeks
          await backdatePlant(plant.id, daysAgo(age));
          created.push({ id: plant.id, strain, location: plant.location, age });
        }
      }
    }

    // Create veg/flower in greenhouses: ~10 per greenhouse (bulk only)
    if (canBulkSeed) {
      for (const gh of greenhouses) {
        for (let i = 0; i < 10; i++) {
          const strain = pick(strainCatalog);
          const bed = rnd(1, 12);
          const { plant } = await plantsService.create({ strain, location: `${gh} - Bed ${bed}`, by: 'operator1' });
          const age = rnd(10, 75); // spans veg to harvest-ready
          await backdatePlant(plant.id, daysAgo(age));
          created.push({ id: plant.id, strain, location: plant.location, age });
        }
      }
    }

    // BOOSTS to ensure rich shortcuts (aim for >=10 buttons)
    // 1) Pending harvest clusters in 4 greenhouses (leave unharvested, age >= 60)
    for (let ghNum = 1; ghNum <= 4; ghNum++) {
      for (let i = 0; i < 5; i++) {
        const strain = pick(strainCatalog);
        const bed = rnd(1, 12);
        const { plant } = await plantsService.create({ strain, location: `Greenhouse ${ghNum} - Bed ${bed}`, by: 'operator1' });
        const age = rnd(65, 80);
        await backdatePlant(plant.id, daysAgo(age));
        created.push({ id: plant.id, strain, location: plant.location, age, skipHarvest: true });
      }
    }

    // 2) Flip-ready clusters in 3 greenhouses (age 14-30)
    for (let ghNum = 5; ghNum <= 7; ghNum++) {
      for (let i = 0; i < 4; i++) {
        const strain = pick(strainCatalog);
        const bed = rnd(1, 12);
        const { plant } = await plantsService.create({ strain, location: `Greenhouse ${ghNum} - Bed ${bed}`, by: 'operator1' });
        const age = rnd(18, 26);
        await backdatePlant(plant.id, daysAgo(age));
        created.push({ id: plant.id, strain, location: plant.location, age });
      }
    }

    // 3) Transplant suggestions from 2 indoor rooms (age 10-25)
    for (let roomNum = 1; roomNum <= 2; roomNum++) {
      for (let i = 0; i < 6; i++) {
        const strain = pick(strainCatalog);
        const rack = rnd(1, 8);
        const { plant } = await plantsService.create({ strain, location: `Indoor Room ${roomNum} - Rack ${rack}`, by: 'operator1' });
        const age = rnd(15, 22);
        await backdatePlant(plant.id, daysAgo(age));
        created.push({ id: plant.id, strain, location: plant.location, age });
      }
    }

    // Harvest a subset of older plants: prefer age >= 60
    let harvestCount = 0;
    if (canBulkSeed) {
      const older = created.filter((c) => c.age >= 60 && !c.skipHarvest);
      for (const c of older) {
        // Leave some unharvested to show pending harvest
        if (Math.random() < 0.35) continue; // ~35% left as pending
        const dried = Math.random() < 0.7; // majority dried
        const harvestAgeDays = dried ? rnd(7, 50) : rnd(1, 6);
        const res = await harvestsService.create({
          plantId: c.id,
          yieldGrams: 400 + rnd(50, 200),
          status: dried ? 'dried' : 'drying',
          by: 'operator1',
        });
        await harvestRepo.update({ id: res.harvest.id }, { harvestedAt: daysAgo(harvestAgeDays) });
        harvestCount++;
      }
    }

    // 4) Ensure drying harvests in at least 2 distinct greenhouses
    const ensureDryingInSites = ['Greenhouse 8', 'Greenhouse 9'];
    for (const site of ensureDryingInSites) {
      // pick or create 3 plants per site and create drying harvests
      const sitePlants = created.filter((c) => c.location.startsWith(site));
      const chosen = sitePlants.slice(0, 3);
      while (chosen.length < 3) {
        const strain = pick(strainCatalog);
        const bed = rnd(1, 12);
        const { plant } = await plantsService.create({ strain, location: `${site} - Bed ${bed}`, by: 'operator1' });
        const age = rnd(65, 80);
        await backdatePlant(plant.id, daysAgo(age));
        const entry = { id: plant.id, strain, location: plant.location, age };
        created.push(entry);
        chosen.push(entry);
      }
      for (const c of chosen) {
        const res = await harvestsService.create({
          plantId: c.id,
          yieldGrams: 400 + rnd(50, 200),
          status: 'drying',
          by: 'operator1',
        });
        await harvestRepo.update({ id: res.harvest.id }, { harvestedAt: daysAgo(rnd(1, 5)) });
        harvestCount++;
      }
    }

    console.log(`Seed complete: users + ${created.length} plants across ${greenhouses.length} greenhouses and ${indoorRooms.length} indoor rooms, ${harvestCount} harvests.`);
  } catch (err) {
    console.error('Seed error:', err);
    process.exitCode = 1;
  } finally {
    await app.close();
  }
}

seed();
