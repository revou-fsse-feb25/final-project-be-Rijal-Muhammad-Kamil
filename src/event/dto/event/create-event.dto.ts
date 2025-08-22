import { ApiProperty } from '@nestjs/swagger';
import { EventStatus } from '@prisma/client';
import { IsNotEmpty, IsNumber, IsString, IsEnum, MaxLength, IsOptional } from 'class-validator';

export class CreateEventDTO {
  @ApiProperty({
    example: 1,
    description: 'ID of the category this event belongs to',
  })
  @IsNotEmpty()
  @IsNumber()
  category_id: number;

  @ApiProperty({
    example: 'Music Festival 2025',
    description: 'Title of the event (max 127 characters)',
    maxLength: 127,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(127)
  title: string;

  @ApiProperty({
    example: 'Detailed description',
    description: 'Detailed description of the event',
  })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({
    example: 'Terms and conditions',
    description: 'Terms and conditions for attending the event',
  })
  @IsNotEmpty()
  @IsString()
  terms: string;

  @ApiProperty({
    example: 'Jakarta',
    description: 'Location of the event (max 127 characters)',
    maxLength: 127,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(127)
  location: string;

  @ApiProperty({
    example: 'https://example.com/image.jpg',
    description: 'URL of the event image (max 255 characters)',
    maxLength: 255,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  image_url: string;

  @ApiProperty({
    enum: EventStatus,
    example: EventStatus.ACTIVE,
    description: 'Current status of the event',
    required: false,
  })
  @IsOptional()
  @IsEnum(EventStatus)
  status?: EventStatus;
}
