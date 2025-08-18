import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateEventOrganizerDto {
  @ApiProperty({
    example: 'We The Fest',
    description: 'The name of the event organizer. Must be unique and descriptive.',
  })
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value.trim())
  name: string;

  @ApiProperty({
    example: 'https://example.com/logo.png',
    description: 'Optional URL of the event organizer’s logo or image.',
  })
  @IsOptional()
  @IsString()
  image_url?: string;
}
