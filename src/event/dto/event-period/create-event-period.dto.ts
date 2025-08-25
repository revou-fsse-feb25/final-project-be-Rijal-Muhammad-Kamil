import { IsNotEmpty, IsString, MaxLength, Matches, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { PeriodStatus } from '@prisma/client';

export class CreateEventPeriodDTO {
  @IsNotEmpty()
  @IsString()
  @MaxLength(127)
  @Transform(({ value }) => value.trim())
  @ApiProperty({
    example: 'Morning Session',
    description: 'The name of the event period (maximum 127 characters)',
    maxLength: 127,
    type: 'string',
  })
  name: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/, { message: 'Start date must be in the format YYYY-MM-DD and a valid calendar date' })
  @ApiProperty({
    example: '2025-08-20',
    description: 'Start date of the period (format: YYYY-MM-DD, must be a valid calendar date)',
    type: String,
  })
  start_date: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/, { message: 'End date must be in the format YYYY-MM-DD and a valid calendar date' })
  @ApiProperty({
    example: '2025-08-21',
    description: 'End date of the period (format: YYYY-MM-DD, must be a valid calendar date)',
    type: String,
  })
  end_date: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/, { message: 'Start time must follow 24-hour format: HH:mm or HH:mm:ss' })
  @ApiProperty({
    example: '08:00:00',
    description: 'Start time of the period (format: HH:mm or HH:mm:ss, 24-hour clock)',
    type: String,
  })
  start_time: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/, { message: 'End time must follow 24-hour format: HH:mm or HH:mm:ss' })
  @ApiProperty({
    example: '12:00:00',
    description: 'End time of the period (format: HH:mm or HH:mm:ss, 24-hour clock)',
    type: String,
  })
  end_time: string;

  @IsNotEmpty()
  @IsEnum(PeriodStatus)
  @ApiProperty({
    enum: Object.values(PeriodStatus),
    example: PeriodStatus.UPCOMING,
    description: 'The status of the period (e.g., UPCOMING, ONGOING, COMPLETED)',
    type: 'string',
  })
  status: PeriodStatus;
}
