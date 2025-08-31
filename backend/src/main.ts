import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.enableCors({
    origin: process.env.API_CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  });
  
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
  }));
  
  app.setGlobalPrefix('v1', { exclude: ['health'] });
  
  const port = process.env.API_PORT || 4000;
  const host = process.env.API_HOST || '0.0.0.0';
  
  await app.listen(port, host);
  console.log(`CREOLE Backend API running on http://${host}:${port}`);
}

bootstrap();