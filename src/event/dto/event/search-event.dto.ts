import { IsOptional, IsString, IsDateString, IsInt, Min } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class SearchEventDto {
  @ApiPropertyOptional({
    description: 'Filter by event category ID',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  category_id?: number;

  @ApiPropertyOptional({
    description: 'Filter by event location (partial match)',
    example: 'Jakarta',
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  location?: string;

  @ApiPropertyOptional({
    description: 'Filter by event start date (YYYY-MM-DD format)',
    example: '2024-12-25',
  })
  @IsOptional()
  @IsDateString()
  start_date?: string;

  @ApiPropertyOptional({
    description: 'Search by event title or description (partial match)',
    example: 'concert',
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  search?: string;

  @ApiPropertyOptional({
    description: 'Page number for pagination',
    example: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    example: 10,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;
}
