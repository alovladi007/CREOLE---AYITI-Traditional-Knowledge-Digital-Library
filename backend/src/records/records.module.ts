import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecordEntity } from './entities/record.entity';
import { RecordsService } from './records.service';
import { RecordsController } from './records.controller';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([RecordEntity]),
    AuditModule,
  ],
  providers: [RecordsService],
  controllers: [RecordsController],
  exports: [RecordsService],
})
export class RecordsModule {}