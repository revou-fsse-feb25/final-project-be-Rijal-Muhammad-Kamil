import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, IsOptional, IsDateString, Matches, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';
import { PeriodStatus } from '@prisma/client';

export class CreateEventPeriodDTO {
  @ApiProperty({
    example: 'Morning Session',
    description: 'Name of the event period',
    maxLength: 127,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(127)
  @Transform(({ value }) => value?.trim())
  name: string;

  @ApiProperty({
    example: '2025-08-20',
    description: 'Start date of the period (YYYY-MM-DD)',
  })
  @IsNotEmpty()
  @IsDateString()
  @Transform(({ value }) => value?.trim())
  start_date: string;

  @ApiProperty({
    example: '2025-08-20',
    description: 'End date of the period (YYYY-MM-DD)',
  })
  @IsNotEmpty()
  @IsDateString()
  @Transform(({ value }) => value?.trim())
  end_date: string;

  @ApiProperty({
    example: '08:00:00',
    description: 'Start time of the period (HH:mm:ss)',
  })
  @IsNotEmpty()
  @Matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/, {
    message: 'start_time must be in HH:mm:ss format',
  })
  @Transform(({ value }) => value?.trim())
  start_time: string;

  @ApiProperty({
    example: '12:00:00',
    description: 'End time of the period (HH:mm:ss)',
  })
  @IsNotEmpty()
  @Matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/, {
    message: 'end_time must be in HH:mm:ss format',
  })
  @Transform(({ value }) => value?.trim())
  end_time: string;

  @ApiProperty({
    enum: PeriodStatus,
    example: PeriodStatus.upcoming,
    description: 'Status of the period',
    required: false,
  })
  @IsOptional()
  @IsEnum(PeriodStatus)
  status?: PeriodStatus;
}
