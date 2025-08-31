import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecordEntity } from '../records/entities/record.entity';
import { NotifyService } from '../notify/notify.service';
import { AuditModule } from '../audit/audit.module';
import { AccessRequestEntity } from './access-request.entity';
import { AccessService } from './access.service';
import { AccessController } from './access.controller';

@Module({
  imports: [TypeOrmModule.forFeature([AccessRequestEntity, RecordEntity]), AuditModule],
  providers: [AccessService, NotifyService],
  controllers: [AccessController],
})
export class AccessModule {}