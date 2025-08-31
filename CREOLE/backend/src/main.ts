import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  const config = app.get(ConfigService);

  const corsOrigin = config.get<string>('API_CORS_ORIGIN') || 'http://localhost:3000';
  app.enableCors({ origin: corsOrigin });

  const host = config.get<string>('API_HOST') || '0.0.0.0';
  const port = parseInt(config.get<string>('API_PORT') || '4000', 10);

  await app.listen(port, host);
  console.log(`API listening on http://${host}:${port}`);
}
bootstrap();