import { IsOptional, IsString, IsArray, IsNumber, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class SearchRecordsDto {
  @IsOptional() @IsString() q?: string;
  @IsOptional() @IsString() creole_class?: string;
  @IsOptional() @IsString() access_tier?: string;

  // Advanced search fields
  @IsOptional() @IsArray() @Type(() => String) tk_labels?: string[];
  @IsOptional() @IsArray() @Type(() => String) regions?: string[];
  @IsOptional() @IsString() community?: string;
  @IsOptional() @IsArray() @Type(() => String) ipc_codes?: string[];

  // Date range filtering
  @IsOptional() @IsDateString() date_from?: string;
  @IsOptional() @IsDateString() date_to?: string;

  // Pagination
  @IsOptional() @IsNumber() @Type(() => Number) page?: number;
  @IsOptional() @IsNumber() @Type(() => Number) limit?: number;

  // Sorting
  @IsOptional() @IsString() sort_by?: 'createdAt' | 'title_ht' | 'relevance';
  @IsOptional() @IsString() sort_order?: 'ASC' | 'DESC';

  // Faceted search enabler
  @IsOptional() include_facets?: boolean;
}