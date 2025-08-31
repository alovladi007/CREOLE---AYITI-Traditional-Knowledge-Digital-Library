import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KeycloakConnectModule, ResourceGuard, RoleGuard, AuthGuard } from 'nest-keycloak-connect';
import { APP_GUARD } from '@nestjs/core';

import { HealthModule } from './misc/health.module';
import { RecordsModule } from './records/records.module';
import { LabelsModule } from './labels/labels.module';
import { ConsentsModule } from './consents/consents.module';
import { AccessModule } from './access/access.module';
import { MediaModule } from './media/media.module';
import { AuditModule } from './audit/audit.module';
import { BenefitModule } from './benefit/benefit.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST || 'localhost',
      port: parseInt(process.env.POSTGRES_PORT || '5432'),
      username: process.env.POSTGRES_USER || 'creole',
      password: process.env.POSTGRES_PASSWORD || 'creolepass',
      database: process.env.POSTGRES_DB || 'creole',
      autoLoadEntities: true,
      synchronize: true, // Only for development
      logging: false,
    }),
    KeycloakConnectModule.register({
      authServerUrl: process.env.KEYCLOAK_URL || 'http://localhost:8080',
      realm: process.env.KEYCLOAK_REALM || 'creole',
      clientId: process.env.KEYCLOAK_CLIENT_ID || 'creole-backend',
      secret: process.env.KEYCLOAK_CLIENT_SECRET || 'backend-secret-please-change',
      bearerOnly: true,
    }),
    HealthModule,
    RecordsModule,
    LabelsModule,
    ConsentsModule,
    AccessModule,
    MediaModule,
    AuditModule,
    BenefitModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ResourceGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RoleGuard,
    },
  ],
})
export class AppModule {}