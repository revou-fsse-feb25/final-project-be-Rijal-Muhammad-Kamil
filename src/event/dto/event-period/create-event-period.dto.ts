import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, IsEnum } from 'class-validator';
import { Type, Transform } from 'class-transformer';
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
    type: String,
  })
  @IsNotEmpty()
  @Type(() => Date)
  start_date: Date;

  @ApiProperty({
    example: '2025-08-20',
    description: 'End date of the period (YYYY-MM-DD)',
    type: String,
  })
  @IsNotEmpty()
  @Type(() => Date)
  end_date: Date;

  @ApiProperty({
    example: '08:00:00',
    description: 'Start time of the period (HH:mm:ss)',
    type: String,
  })
  @IsNotEmpty()
  @Type(() => Date)
  start_time: Date;

  @ApiProperty({
    example: '12:00:00',
    description: 'End time of the period (HH:mm:ss)',
    type: String,
  })
  @IsNotEmpty()
  @Type(() => Date)
  end_time: Date;

  @ApiProperty({
    enum: Object.values(PeriodStatus),
    example: PeriodStatus.UPCOMING,
    description: 'Status of the period',
  })
  @IsNotEmpty()
  @IsEnum(PeriodStatus)
  status: PeriodStatus;
}
