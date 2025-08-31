import { Module, Controller, Get } from '@nestjs/common';
import { Public } from 'nest-keycloak-connect';

@Controller('health')
class HealthController {
  @Get()
  @Public()
  check() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}

@Module({
  controllers: [HealthController],
})
export class HealthModule {}