import { IsOptional, IsInt, IsString, MaxLength, Matches } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class SearchEventDto {
  @IsOptional()
  @IsInt()
  @ApiPropertyOptional({
    description: 'Filter events by category ID)',
    example: 1,
    required: false,
    type: 'number',
  })
  category_id?: number;

  @IsOptional()
  @IsString()
  @MaxLength(127)
  @Transform(({ value }) => value?.trim())
  @ApiPropertyOptional({
    description: 'Filter events by location (partial match). Max length: 127 characters',
    example: 'Jakarta',
    maxLength: 127,
    required: false,
    type: 'string',
  })
  location?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/, { message: 'Filter event start_date must be in YYYY-MM-DD format and a valid date' })
  @ApiPropertyOptional({
    description: 'Filter events start date. Must be in YYYY-MM-DD format with a valid month (01-12) and day (01-31).',
    example: '2024-12-25',
    required: false,
    type: 'string',
  })
  start_date?: string;

  @IsOptional()
  @IsString()
  @MaxLength(127)
  @Transform(({ value }) => value?.trim())
  @ApiPropertyOptional({
    description: 'Search events by title or description (partial match). Max length: 127 characters',
    example: 'concert',
    maxLength: 127,
    required: false,
    type: 'string',
  })
  search?: string;
}
