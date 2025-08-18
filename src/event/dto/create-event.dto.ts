import { ApiProperty } from '@nestjs/swagger';
import { EventStatus } from '@prisma/client';
import { IsNotEmpty, IsNumber, IsString, IsEnum, IsDateString } from 'class-validator';

export class EventDTO {
  @ApiProperty({ example: 1, description: 'Unique identifier of the event' })
  @IsNotEmpty()
  @IsNumber()
  event_id: number;

  @ApiProperty({ example: 1, description: 'ID of the category this event belongs to' })
  @IsNotEmpty()
  @IsNumber()
  category_id: number;

  @ApiProperty({ example: 1, description: 'ID of the organizer who created this event' })
  @IsNotEmpty()
  @IsNumber()
  organizer_id: number;

  @ApiProperty({ example: 'Music Festival 2025', description: 'Title of the event' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ example: 'Detailed description', description: 'Detailed description of the event' })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({ example: 'Terms and conditions', description: 'Terms and conditions for attending the event' })
  @IsNotEmpty()
  @IsString()
  terms: string;

  @ApiProperty({ example: 'Jakarta', description: 'Location of the event' })
  @IsNotEmpty()
  @IsString()
  location: string;

  @ApiProperty({ example: 'https://example.com/image.jpg', description: 'URL of the event image' })
  @IsNotEmpty()
  @IsString()
  image_url: string;

  @ApiProperty({ enum: EventStatus, example: EventStatus.active, description: 'Current status of the event' })
  @IsEnum(EventStatus)
  status: EventStatus;
}
