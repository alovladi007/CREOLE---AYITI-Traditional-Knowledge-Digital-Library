import { Controller, Get, Module } from '@nestjs/common';
import { Public } from 'nest-keycloak-connect';

@Controller('health')
class HealthController {
  @Get()
  @Public()
  ok() { 
    return { status: 'ok', timestamp: new Date().toISOString() }; 
  }
}

@Module({
  controllers: [HealthController],
})
export class HealthModule {}