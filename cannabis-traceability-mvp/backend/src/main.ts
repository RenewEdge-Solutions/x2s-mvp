import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  
  // Set global API prefix
  app.setGlobalPrefix('api');

  // Swagger API docs
  const config = new DocumentBuilder()
    .setTitle('Cannabis Traceability API')
    .setDescription('MVP endpoints for auth, plants, harvests, lifecycle, and integrity')
    .setVersion('0.1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);
  const port = process.env.PORT ? Number(process.env.PORT) : 3001;
  await app.listen(port);
  console.log(`Backend listening on port ${port} (docs at http://localhost:${port}/docs)`);
}
bootstrap();
