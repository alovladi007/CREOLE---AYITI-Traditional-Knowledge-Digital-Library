import { IsString, IsOptional, IsArray, IsEnum, IsObject } from 'class-validator';
import { AccessTier } from '../entities/record.entity';

export class CreateRecordDto {
  @IsString()
  title_ht: string;

  @IsString()
  @IsOptional()
  title_fr?: string;

  @IsString()
  @IsOptional()
  abstract_en?: string;

  @IsString()
  @IsOptional()
  creole_class?: string;

  @IsArray()
  @IsOptional()
  ipc_codes?: string[];

  @IsArray()
  @IsOptional()
  tk_labels?: string[];

  @IsEnum(['public', 'restricted', 'secret'])
  @IsOptional()
  access_tier?: AccessTier;

  @IsString()
  @IsOptional()
  examiner_digest?: string;

  @IsString()
  @IsOptional()
  community?: string;

  @IsArray()
  @IsOptional()
  region?: string[];

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}