import { IsOptional, IsString, IsEnum } from 'class-validator';
import { AccessTier } from '../entities/record.entity';

export class SearchRecordsDto {
  @IsString()
  @IsOptional()
  q?: string;

  @IsEnum(['public', 'restricted', 'secret'])
  @IsOptional()
  access_tier?: AccessTier;

  @IsString()
  @IsOptional()
  community?: string;

  @IsString()
  @IsOptional()
  creole_class?: string;
}