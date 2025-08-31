import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LabelEntity } from './entities/label.entity';
import { LabelsService } from './labels.service';
import { LabelsController } from './labels.controller';

@Module({
  imports: [TypeOrmModule.forFeature([LabelEntity])],
  providers: [LabelsService],
  controllers: [LabelsController],
  exports: [LabelsService],
})
export class LabelsModule {}