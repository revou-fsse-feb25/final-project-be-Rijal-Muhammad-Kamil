import { IsNotEmpty, IsString, MaxLength, IsUrl, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { EventStatus } from '@prisma/client';

export class CreateEventDTO {
  @IsNotEmpty()
  @IsString()
  @MaxLength(127)
  @Transform(({ value }) => value.trim())
  @ApiProperty({
    example: 'Music Festival 2025',
    description: 'Title of the event (max 127 characters)',
    maxLength: 127,
  })
  title: string;

  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value.trim())
  @ApiProperty({
    example: 'Detailed description',
    description: 'Detailed description of the event',
  })
  description: string;

  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value.trim())
  @ApiProperty({
    example: 'Terms and conditions',
    description: 'Terms and conditions for attending the event',
  })
  terms: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(127)
  @Transform(({ value }) => value.trim())
  @ApiProperty({
    example: 'Jakarta',
    description: 'Location of the event (max 127 characters)',
    maxLength: 127,
  })
  location: string;

  @IsNotEmpty()
  @IsString()
  @IsUrl()
  @MaxLength(255)
  @Transform(({ value }) => value.trim())
  @ApiProperty({
    example: 'https://example.com/image.jpg',
    description: 'URL of the event image (max 255 characters)',
    maxLength: 255,
  })
  image_url: string;

  @IsOptional()
  @IsEnum(EventStatus)
  @ApiProperty({
    enum: EventStatus,
    example: EventStatus.ACTIVE,
    description: 'Current status of the event',
    required: false,
  })
  status?: EventStatus;
}
