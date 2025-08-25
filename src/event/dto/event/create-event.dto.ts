import { IsNotEmpty, IsInt, IsString, MinLength, MaxLength, IsUrl, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { EventStatus } from '@prisma/client';

export class CreateEventDTO {
  @IsNotEmpty()
  @IsInt()
  @ApiProperty({
    example: 1,
    description: 'Category ID of the event',
    type: 'number',
  })
  category_id: number;

  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(127)
  @Transform(({ value }) => value.trim())
  @ApiProperty({
    example: 'Music Festival 2025',
    description: 'Title of the event (min 3 characters, max 127 characters)',
    minLength: 3,
    maxLength: 127,
    type: 'string',
  })
  title: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @Transform(({ value }) => value.trim())
  @ApiProperty({
    example: 'Detailed description',
    description: 'Detailed description of the event (min 3 characters)',
    minLength: 3,
    type: 'string',
  })
  description: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @Transform(({ value }) => value.trim())
  @ApiProperty({
    example: 'Terms and conditions',
    description: 'Terms and conditions for attending the event (min 3 characters)',
    minLength: 3,
    type: 'string',
  })
  terms: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(127)
  @Transform(({ value }) => value.trim())
  @ApiProperty({
    example: 'Jakarta',
    description: 'Location of the event (min 3 characters, max 127 characters)',
    minLength: 3,
    maxLength: 127,
    type: 'string',
  })
  location: string;

  @IsNotEmpty()
  @IsUrl({ protocols: ['http', 'https'] }, { message: 'image_url must be a valid URL starting with http or https' })
  @MaxLength(255)
  @Transform(({ value }) => value.trim())
  @ApiProperty({
    example: 'https://example.com/image.jpg',
    description: 'URL of the event image (max 255 characters)',
    maxLength: 255,
    type: 'string',
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
