import { IsNotEmpty, IsString, MinLength, MaxLength, IsOptional, IsUrl } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEventOrganizerDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(127)
  @Transform(({ value }) => value.trim())
  @ApiProperty({
    example: 'We The Fest',
    description: 'The name of the event organizer. Must be unique and descriptive.',
    minLength: 3,
    maxLength: 127,
    type: String,
  })
  name: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(127)
  @Transform(({ value }) => value.trim())
  @ApiProperty({
    example: 'Jl. Sudirman No. 123, Jakarta',
    description: 'The address of the event organizer.',
    minLength: 3,
    maxLength: 127,
    type: String,
  })
  address: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  @ApiPropertyOptional({
    example: 'A leading event organizer in Indonesia',
    description: 'Optional description of the event organizer.',
    required: false,
    type: String,
  })
  description?: string;

  @IsOptional()
  @IsUrl({ protocols: ['http', 'https'] }, { message: 'logo_url must be a valid URL starting with http or https' })
  @MaxLength(225)
  @Transform(({ value }) => value?.trim())
  @ApiPropertyOptional({
    example: 'https://example.com/logo.png',
    description: "Optional URL of the event organizer's logo.",
    format: 'url',
    maxLength: 225,
    required: false,
    type: String,
  })
  logo_url?: string;
}
