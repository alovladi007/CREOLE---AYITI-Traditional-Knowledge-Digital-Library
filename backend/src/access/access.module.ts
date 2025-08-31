import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccessRequestEntity } from './access-request.entity';
import { AccessService } from './access.service';
import { AccessController } from './access.controller';
import { RecordsModule } from '../records/records.module';
import { AuditModule } from '../audit/audit.module';
import { NotifyService } from '../notify/notify.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([AccessRequestEntity]),
    forwardRef(() => RecordsModule),
    AuditModule,
  ],
  providers: [AccessService, NotifyService],
  controllers: [AccessController],
  exports: [AccessService],
})
export class AccessModule {}