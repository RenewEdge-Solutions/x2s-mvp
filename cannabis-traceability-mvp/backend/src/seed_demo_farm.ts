import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Geolocation } from './locations/geolocation.entity';
import { Facility } from './locations/facility.entity';
import { Structure } from './locations/structure.entity';
import { Equipment } from './equipment/equipment.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

async function seedDemoFarm() {
  const app = await NestFactory.createApplicationContext(AppModule, { logger: false });
  try {
    const geoRepo = app.get(getRepositoryToken(Geolocation));
    const facilityRepo = app.get(getRepositoryToken(Facility));
    const structureRepo = app.get(getRepositoryToken(Structure));
    const equipmentRepo = app.get(getRepositoryToken(Equipment));

    // 1. Geolocation
    const geo = geoRepo.create({
      name: 'Green Hope Farm',
      address: 'Roseau, Dominica, West Indies',
      lat: 15.2976,
      lng: -61.37,
    });
    await geoRepo.save(geo);

    // 2. Facilities
    // Main Building
    const building = facilityRepo.create({
      name: 'Main Building',
      type: 'building',
      geo,
    });
    await facilityRepo.save(building);

    // Farm
    const farm = facilityRepo.create({
      name: 'Farm Area',
      type: 'farm',
      geo,
    });
    await facilityRepo.save(farm);

    // 3. Structures (Rooms in Building)
    // Drying Room
    const dryingRoom = structureRepo.create({
      name: 'Drying Room',
      type: 'room',
      usage: 'Drying',
      size: 200,
      facility: building,
    });
    await structureRepo.save(dryingRoom);

    // Grow Room 1 - Tents
    const growRoomTents = structureRepo.create({
      name: 'Grow Room 1 (Tents)',
      type: 'room',
      usage: 'Tents',
      size: 400,
      tents: Array(10).fill({ widthFt: 4, lengthFt: 4 }),
      facility: building,
    });
    await structureRepo.save(growRoomTents);

    // Grow Room 2 - Racks
    const growRoomRacks = structureRepo.create({
      name: 'Grow Room 2 (Racks)',
      type: 'room',
      usage: 'Racks/Tents',
      size: 300,
      racks: Array(10).fill({ widthCm: 120, lengthCm: 60, shelves: 4 }),
      facility: building,
    });
    await structureRepo.save(growRoomRacks);

    // Storage Room 1
    const storage1 = structureRepo.create({
      name: 'Storage Room 1',
      type: 'room',
      usage: 'Storage',
      size: 150,
      facility: building,
    });
    await structureRepo.save(storage1);

    // Storage Room 2
    const storage2 = structureRepo.create({
      name: 'Storage Room 2',
      type: 'room',
      usage: 'Storage',
      size: 150,
      facility: building,
    });
    await structureRepo.save(storage2);

    // Veg Room
    const vegRoom = structureRepo.create({
      name: 'Veg Room',
      type: 'room',
      usage: 'Vegetative',
      size: 250,
      facility: building,
    });
    await structureRepo.save(vegRoom);

    // Flowering Room
    const flowerRoom = structureRepo.create({
      name: 'Flowering Room',
      type: 'room',
      usage: 'Flowering',
      size: 300,
      facility: building,
    });
    await structureRepo.save(flowerRoom);

    // 4. Structures (Greenhouses in Farm)
    const greenhouses = [];
    for (let i = 1; i <= 10; i++) {
      const gh = structureRepo.create({
        name: `Greenhouse ${i}`,
        type: 'greenhouse',
        usage: 'Vegetative',
        size: 400,
        beds: 10,
        facility: farm,
      });
      await structureRepo.save(gh);
      greenhouses.push(gh);
    }

    // Remove all existing equipment for a clean seed
    await equipmentRepo.clear();

    // Helper to create equipment for a structure
    const addEquipment = async (structure: any, items: any[]) => {
      for (const item of items) {
        await equipmentRepo.save({ ...item, location: structure.name, structureId: structure.id });
      }
    };

    // Drying Room Equipment
    await addEquipment(dryingRoom, [
      { type: 'dehumidifier', subtype: 'Industrial', details: { capacity: '70L/day' } },
      { type: 'dehumidifier', subtype: 'Industrial', details: { capacity: '70L/day' } },
      { type: 'fan', subtype: 'Oscillating', details: { size: '16"' } },
      { type: 'fan', subtype: 'Oscillating', details: { size: '16"' } },
      { type: 'fan', subtype: 'Oscillating', details: { size: '16"' } },
      { type: 'fan', subtype: 'Oscillating', details: { size: '16"' } },
      { type: 'sensor', subtype: 'Temp/Humidity', details: { type: 'Digital' } },
      { type: 'sensor', subtype: 'Temp/Humidity', details: { type: 'Digital' } },
      { type: 'sensor', subtype: 'Temp/Humidity', details: { type: 'Digital' } },
      { type: 'rack', subtype: 'Drying', details: { material: 'Stainless Steel' } },
      { type: 'rack', subtype: 'Drying', details: { material: 'Stainless Steel' } },
      { type: 'rack', subtype: 'Drying', details: { material: 'Stainless Steel' } },
      { type: 'rack', subtype: 'Drying', details: { material: 'Stainless Steel' } },
      { type: 'rack', subtype: 'Drying', details: { material: 'Stainless Steel' } },
      { type: 'rack', subtype: 'Drying', details: { material: 'Stainless Steel' } },
      { type: 'rack', subtype: 'Drying', details: { material: 'Stainless Steel' } },
      { type: 'rack', subtype: 'Drying', details: { material: 'Stainless Steel' } },
      { type: 'air_purifier', subtype: 'HEPA', details: {} },
    ]);

    // Grow Room 1 - Tents Equipment
    for (let i = 0; i < 10; i++) {
      await addEquipment(growRoomTents, [
        { type: 'light', subtype: 'LED', details: { wattage: '480W', spectrum: 'Full' } },
        { type: 'fan', subtype: 'Inline', details: { size: '6"' } },
        { type: 'filter', subtype: 'Carbon', details: { size: '6x20"' } },
        { type: 'sensor', subtype: 'Temperature', details: { type: 'Digital' } },
        { type: 'timer', subtype: 'Digital', details: {} },
      ]);
    }

    // Grow Room 2 - Racks Equipment
    for (let i = 0; i < 10; i++) {
      for (let j = 0; j < 4; j++) {
        await addEquipment(growRoomRacks, [
          { type: 'light', subtype: 'T5', details: { wattage: '54W' } },
        ]);
      }
      await addEquipment(growRoomRacks, [
        { type: 'heat_mat', subtype: 'Seedling', details: { size: '20x48"' } },
        { type: 'propagation_dome', subtype: 'Clear', details: {} },
        { type: 'humidity_controller', subtype: 'Digital', details: {} },
        { type: 'fan', subtype: 'Desk', details: { size: '6"' } },
      ]);
    }

    // Storage Room 1 Equipment
    await addEquipment(storage1, [
      { type: 'shelving', subtype: 'Heavy Duty', details: {} },
      { type: 'shelving', subtype: 'Heavy Duty', details: {} },
      { type: 'shelving', subtype: 'Heavy Duty', details: {} },
      { type: 'shelving', subtype: 'Heavy Duty', details: {} },
      { type: 'shelving', subtype: 'Heavy Duty', details: {} },
      { type: 'shelving', subtype: 'Heavy Duty', details: {} },
      { type: 'dehumidifier', subtype: '50L/day', details: {} },
      { type: 'camera', subtype: 'HD', details: {} },
      { type: 'sensor', subtype: 'Climate', details: { type: 'WiFi' } },
    ]);
    // Storage Room 2 Equipment
    await addEquipment(storage2, [
      { type: 'shelving', subtype: 'Heavy Duty', details: {} },
      { type: 'shelving', subtype: 'Heavy Duty', details: {} },
      { type: 'shelving', subtype: 'Heavy Duty', details: {} },
      { type: 'shelving', subtype: 'Heavy Duty', details: {} },
      { type: 'shelving', subtype: 'Heavy Duty', details: {} },
      { type: 'shelving', subtype: 'Heavy Duty', details: {} },
      { type: 'refrigeration', subtype: 'Medical', details: {} },
      { type: 'camera', subtype: 'HD', details: {} },
      { type: 'logger', subtype: 'Temperature', details: {} },
    ]);
    // Veg Room Equipment
    await addEquipment(vegRoom, [
      { type: 'light', subtype: 'LED', details: { wattage: '320W', spectrum: 'Full' } },
      { type: 'light', subtype: 'LED', details: { wattage: '320W', spectrum: 'Full' } },
      { type: 'light', subtype: 'LED', details: { wattage: '320W', spectrum: 'Full' } },
      { type: 'light', subtype: 'LED', details: { wattage: '320W', spectrum: 'Full' } },
      { type: 'light', subtype: 'LED', details: { wattage: '320W', spectrum: 'Full' } },
      { type: 'light', subtype: 'LED', details: { wattage: '320W', spectrum: 'Full' } },
      { type: 'fan', subtype: 'Exhaust', details: { size: '8"' } },
      { type: 'fan', subtype: 'Exhaust', details: { size: '8"' } },
      { type: 'fan', subtype: 'Oscillating', details: { size: '16"' } },
      { type: 'fan', subtype: 'Oscillating', details: { size: '16"' } },
      { type: 'fan', subtype: 'Oscillating', details: { size: '16"' } },
      { type: 'fan', subtype: 'Oscillating', details: { size: '16"' } },
      { type: 'controller', subtype: 'Environmental', details: { type: 'Digital' } },
      { type: 'co2_generator', subtype: 'Propane', details: {} },
    ]);
    // Flowering Room Equipment
    await addEquipment(flowerRoom, [
      { type: 'light', subtype: 'LED', details: { wattage: '640W', spectrum: 'Full' } },
      { type: 'light', subtype: 'LED', details: { wattage: '640W', spectrum: 'Full' } },
      { type: 'light', subtype: 'LED', details: { wattage: '640W', spectrum: 'Full' } },
      { type: 'light', subtype: 'LED', details: { wattage: '640W', spectrum: 'Full' } },
      { type: 'light', subtype: 'LED', details: { wattage: '640W', spectrum: 'Full' } },
      { type: 'light', subtype: 'LED', details: { wattage: '640W', spectrum: 'Full' } },
      { type: 'light', subtype: 'LED', details: { wattage: '640W', spectrum: 'Full' } },
      { type: 'light', subtype: 'LED', details: { wattage: '640W', spectrum: 'Full' } },
      { type: 'fan', subtype: 'Exhaust', details: { size: '10"' } },
      { type: 'fan', subtype: 'Exhaust', details: { size: '10"' } },
      { type: 'fan', subtype: 'Exhaust', details: { size: '10"' } },
      { type: 'filter', subtype: 'Carbon', details: { size: '10x24"' } },
      { type: 'filter', subtype: 'Carbon', details: { size: '10x24"' } },
      { type: 'filter', subtype: 'Carbon', details: { size: '10x24"' } },
      { type: 'controller', subtype: 'Environmental', details: { type: 'Advanced' } },
      { type: 'dehumidifier', subtype: 'Industrial', details: { capacity: '70L/day' } },
      { type: 'dehumidifier', subtype: 'Industrial', details: { capacity: '70L/day' } },
      { type: 'co2_system', subtype: 'Tank', details: { regulator: 'Included' } },
    ]);

    // Greenhouse Equipment
    for (const gh of greenhouses) {
      await addEquipment(gh, [
        { type: 'heater', subtype: 'Propane', details: { btu: '30,000' } },
        { type: 'fan', subtype: 'Exhaust', details: { size: '36" Shutter' } },
        { type: 'fan', subtype: 'Exhaust', details: { size: '36" Shutter' } },
        { type: 'fan', subtype: 'Circulation', details: { size: '18" Poly' } },
        { type: 'fan', subtype: 'Circulation', details: { size: '18" Poly' } },
        { type: 'fan', subtype: 'Circulation', details: { size: '18" Poly' } },
        { type: 'fan', subtype: 'Circulation', details: { size: '18" Poly' } },
        { type: 'irrigation', subtype: 'Drip', details: { timer: 'Included' } },
        { type: 'shade_cloth', subtype: 'Motorized', details: { percent: '50%' } },
        { type: 'sensor', subtype: 'Temperature', details: { type: 'Wireless' } },
      ]);
    }

    console.log('Green Hope Farm demo data seeded successfully!');
  } catch (err) {
    console.error('Seed error:', err);
    process.exitCode = 1;
  } finally {
    await app.close();
  }
}

seedDemoFarm();
