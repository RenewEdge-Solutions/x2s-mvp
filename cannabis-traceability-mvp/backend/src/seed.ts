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
      modules: ['cannabis'],
    });
    console.log('Seed complete: created/updated user Daniel.Veselski only.');
  } catch (err) {
    console.error('Seed error:', err);
    process.exitCode = 1;
  } finally {
    await app.close();
  }
}

seed();
