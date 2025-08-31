import { IsOptional, IsString } from 'class-validator';

export class CreateAccessRequestDto {
  @IsString() recordId: string;
  @IsString() purpose: string;
  @IsOptional() requested_fields?: any;
}