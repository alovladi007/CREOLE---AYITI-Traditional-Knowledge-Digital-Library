import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MediaEntity } from './media.entity';
import { MediaService } from './media.service';
import { MediaController } from './media.controller';

@Module({
  imports: [TypeOrmModule.forFeature([MediaEntity])],
  providers: [MediaService],
  controllers: [MediaController],
  exports: [MediaService],
})
export class MediaModule {}