import { IsOptional, IsString, IsDateString, MaxLength, IsInt, Min, Matches } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';

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
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'start_date must be in YYYY-MM-DD format' })
  @ApiPropertyOptional({
    description: 'Filter events by start date (format: YYYY-MM-DD)',
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

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @ApiPropertyOptional({
    description: 'Current page number for pagination (min 1)',
    example: 1,
    minimum: 1,
    default: 1,
    required: false,
    type: 'number',
  })
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @ApiPropertyOptional({
    description: 'Number of items per page (pagination limit, min 1)',
    example: 10,
    minimum: 1,
    default: 10,
    required: false,
    type: 'number',
  })
  limit?: number = 10;
}
