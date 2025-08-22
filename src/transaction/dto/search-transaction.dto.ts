import { ApiPropertyOptional } from '@nestjs/swagger';
import { TRANSACTION_STATUS, PAYMENT_METHOD } from '@prisma/client';
import { IsOptional, IsEnum, IsDateString, IsNumber, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class SearchTransactionDto {
  @ApiPropertyOptional({
    enum: TRANSACTION_STATUS,
    example: TRANSACTION_STATUS.SUCCESS,
    description: 'Filter by transaction status',
  })
  @IsOptional()
  @IsEnum(TRANSACTION_STATUS)
  status?: TRANSACTION_STATUS;

  @ApiPropertyOptional({
    enum: PAYMENT_METHOD,
    example: PAYMENT_METHOD.CREDIT_CARD,
    description: 'Filter by payment method',
  })
  @IsOptional()
  @IsEnum(PAYMENT_METHOD)
  payment_method?: PAYMENT_METHOD;

  @ApiPropertyOptional({
    example: '2024-01-01',
    description: 'Filter transactions created from this date (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsDateString()
  start_date?: string;

  @ApiPropertyOptional({
    example: '2024-12-31',
    description: 'Filter transactions created until this date (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsDateString()
  end_date?: string;

  @ApiPropertyOptional({
    example: 1,
    description: 'Page number for pagination',
    minimum: 1,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    example: 10,
    description: 'Number of items per page',
    minimum: 1,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  limit?: number = 10;
}
