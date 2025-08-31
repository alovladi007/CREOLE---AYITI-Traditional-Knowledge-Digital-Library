import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecordsController } from './records.controller';
import { RecordsService } from './records.service';
import { RecordEntity } from './entities/record.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RecordEntity])],
  controllers: [RecordsController],
  providers: [RecordsService],
  exports: [RecordsService],
})
export class RecordsModule {}