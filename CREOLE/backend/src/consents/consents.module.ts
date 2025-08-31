import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConsentsService } from './consents.service';
import { ConsentsController } from './consents.controller';
import { ConsentEntity } from './entities/consent.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ConsentEntity])],
  controllers: [ConsentsController],
  providers: [ConsentsService],
})
export class ConsentsModule {}