import { IsNotEmpty, IsString, MaxLength, Matches, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { PeriodStatus } from '@prisma/client';

export class CreateEventPeriodDTO {
  @IsNotEmpty()
  @IsString()
  @MaxLength(127)
  @Transform(({ value }) => value.trim())
  @ApiProperty({
    example: 'Morning Session',
    description: 'Name of the event period (max 127 characters)',
    maxLength: 127,
  })
  name: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'start_date must be in YYYY-MM-DD format' })
  @ApiProperty({
    example: '2025-08-20',
    description: 'Start date of the period (YYYY-MM-DD)',
    type: String,
  })
  start_date: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'end_date must be in YYYY-MM-DD format' })
  @ApiProperty({
    example: '2025-08-20',
    description: 'End date of the period (YYYY-MM-DD)',
    type: String,
  })
  end_date: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/, { message: 'start_time must be HH:mm or HH:mm:ss' })
  @ApiProperty({
    example: '08:00:00',
    description: 'Start time of the period (HH:mm:ss)',
    type: String,
  })
  start_time: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/, { message: 'end_time must be HH:mm or HH:mm:ss' })
  @ApiProperty({
    example: '12:00:00',
    description: 'End time of the period (HH:mm:ss)',
    type: String,
  })
  end_time: string;

  @IsNotEmpty()
  @IsEnum(PeriodStatus)
  @ApiProperty({
    enum: Object.values(PeriodStatus),
    example: PeriodStatus.UPCOMING,
    description: 'Status of the period',
  })
  status: PeriodStatus;
}
