import { Module } from '@nestjs/common';
import { KeycloakConnectModule, ResourceGuard, RoleGuard, AuthGuard } from 'nest-keycloak-connect';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecordsModule } from './records/records.module';
import { ConsentsModule } from './consents/consents.module';
import { LabelsModule } from './labels/labels.module';
import { HealthModule } from './misc/health.module';
import { AccessModule } from './access/access.module';
import { MediaModule } from './media/media.module';
import { AuditModule } from './audit/audit.module';
import { BenefitModule } from './benefit/benefit.module';

@Module({
  imports: [
    KeycloakConnectModule.registerAsync({
      useFactory: (config: ConfigService) => ({
        authServerUrl: config.get('KEYCLOAK_URL') || 'http://localhost:8080',
        realm: config.get('KEYCLOAK_REALM') || 'creole',
        clientId: config.get('KEYCLOAK_CLIENT_ID') || 'creole-backend',
        secret: config.get('KEYCLOAK_CLIENT_SECRET') || 'backend-secret-please-change',
      }),
      inject: [ConfigService]
    }),
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('POSTGRES_HOST', 'localhost'),
        port: parseInt(config.get('POSTGRES_PORT', '5432'), 10),
        username: config.get('POSTGRES_USER', 'creole'),
        password: config.get('POSTGRES_PASSWORD', 'creolepass'),
        database: config.get('POSTGRES_DB', 'creole'),
        autoLoadEntities: true,
        synchronize: true, // dev only
      }),
      inject: [ConfigService],
    }),
    RecordsModule,
    ConsentsModule,
    LabelsModule,
    HealthModule,
    AccessModule,
    MediaModule,
    AuditModule,
    BenefitModule
  ],
  providers: [
    { provide: APP_GUARD, useClass: AuthGuard },
    { provide: APP_GUARD, useClass: ResourceGuard },
    { provide: APP_GUARD, useClass: RoleGuard },
  ]
})
export class AppModule {}