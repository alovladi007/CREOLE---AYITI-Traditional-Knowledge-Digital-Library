import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LabelsService } from './labels.service';
import { LabelsController } from './labels.controller';
import { LabelEntity } from './entities/label.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LabelEntity])],
  controllers: [LabelsController],
  providers: [LabelsService],
  exports: [LabelsService],
})
export class LabelsModule {}