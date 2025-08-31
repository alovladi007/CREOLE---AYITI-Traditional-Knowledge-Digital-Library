import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConsentEntity } from './entities/consent.entity';
import { ConsentsService } from './consents.service';
import { ConsentsController } from './consents.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ConsentEntity])],
  providers: [ConsentsService],
  controllers: [ConsentsController],
  exports: [ConsentsService],
})
export class ConsentsModule {}