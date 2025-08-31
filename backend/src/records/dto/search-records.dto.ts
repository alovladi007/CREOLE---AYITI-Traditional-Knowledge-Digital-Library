import { IsOptional, IsString } from 'class-validator';

export class SearchRecordsDto {
  @IsOptional() @IsString() q?: string;
  @IsOptional() @IsString() creole_class?: string;
  @IsOptional() @IsString() access_tier?: string;
}