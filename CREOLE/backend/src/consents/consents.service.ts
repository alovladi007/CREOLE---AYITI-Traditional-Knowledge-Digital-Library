import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConsentEntity } from './entities/consent.entity';

@Injectable()
export class ConsentsService {
  constructor(@InjectRepository(ConsentEntity) private repo: Repository<ConsentEntity>) {}
  
  findAll() { 
    return this.repo.find({ relations: ['record'] }); 
  }
}