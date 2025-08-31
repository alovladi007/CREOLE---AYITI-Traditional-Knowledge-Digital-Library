import { IsArray, IsIn, IsOptional, IsString } from 'class-validator';

export class CreateRecordDto {
  @IsString() title_ht: string;
  @IsOptional() @IsString() title_fr?: string;
  @IsOptional() @IsString() abstract_en?: string;
  @IsString() creole_class: string;
  @IsOptional() @IsArray() ipc_codes?: string[];
  @IsOptional() @IsArray() tk_labels?: string[];
  @IsOptional() @IsIn(['public','restricted','secret']) access_tier?: 'public' | 'restricted' | 'secret';
  @IsOptional() @IsString() examiner_digest?: string;
  @IsOptional() @IsString() community?: string;
  @IsOptional() @IsArray() region?: string[];
  @IsOptional() metadata?: any;
}