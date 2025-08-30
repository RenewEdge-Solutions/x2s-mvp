import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UsersService } from './users/users.service';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn'],
  });

  try {
    const usersService = app.get(UsersService);

    // Seed requested users
    const modulesAll = ['cannabis', 'alcohol', 'explosives', 'mushrooms'];
    await usersService.upsert({
      username: 'Farmer',
      password: '1234',
      role: 'Operator.Farmer',
      firstName: 'Farm',
      lastName: 'Operator',
      email: 'farmer@example.com',
      phone: '+1 (555) 555-1001',
      address: '100 Farm Lane, AgriTown',
      modules: modulesAll,
    });
    await usersService.upsert({
      username: 'Regulator',
      password: '1234',
      role: 'Regulator',
      firstName: 'Regula',
      lastName: 'Tor',
      email: 'regulator@example.com',
      phone: '+1 (555) 555-1002',
      address: '10 Gov Ave, Capital City',
      modules: modulesAll,
    });
    await usersService.upsert({
      username: 'Auditor',
      password: '1234',
      role: 'Auditor',
      firstName: 'Audit',
      lastName: 'Or',
      email: 'auditor@example.com',
      phone: '+1 (555) 555-1003',
      address: '42 Ledger St, Verifyville',
      modules: modulesAll,
    });
    await usersService.upsert({
      username: 'Shop',
      password: '1234',
      role: 'Operator.Shop',
      firstName: 'Retail',
      lastName: 'Shop',
      email: 'shop@example.com',
      phone: '+1 (555) 555-1004',
      address: '77 Market Rd, Commerce City',
      modules: modulesAll,
    });
    await usersService.upsert({
      username: 'Lab',
      password: '1234',
      role: 'Operator.Lab',
      firstName: 'Quality',
      lastName: 'Lab',
      email: 'lab@example.com',
      phone: '+1 (555) 555-1005',
      address: '5 Science Way, Testtown',
      modules: modulesAll,
    });
    console.log('Seed complete: Farmer, Regulator, Auditor, Shop, Lab.');
  } catch (err) {
    console.error('Seed error:', err);
    process.exitCode = 1;
  } finally {
    await app.close();
  }
}

seed();
