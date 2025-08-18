import { IsEmail, IsNotEmpty, IsEnum, IsString, IsDateString, Matches } from 'class-validator';
import { Transform } from 'class-transformer';
import { Role, Gender } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDTO {
  @IsNotEmpty()
  @IsEmail()
  @Transform(({ value }) => value.trim())
  @ApiProperty({
    example: 'user@example.com',
    description: 'The email address of the user, must be unique and valid.',
  })
  email: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: 'password123',
    description: 'The password for the user account, minimum 9 characters recommended.',
  })
  password: string;

  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value.trim())
  @ApiProperty({
    example: 'John',
    description: 'First name of the user.',
  })
  first_name: string;

  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value.trim())
  @ApiProperty({
    example: 'Doe',
    description: 'Last name of the user.',
  })
  last_name: string;

  @IsNotEmpty()
  @IsEnum(Gender)
  @ApiProperty({
    example: 'Male',
    description: 'Gender of the user, must be either Male or Female.',
  })
  gender: Gender;

  @IsNotEmpty()
  @IsString()
  @Matches(/^\+?[1-9]\d{7,14}$/, {
    message: 'Phone number must be in international format with 8-15 digits, e.g., +6281234567890',
  })
  @ApiProperty({
    example: '+6281234567890',
    description: 'Phone number of the user in international format.',
  })
  phone_number: string;

  @IsNotEmpty()
  @IsEnum(Role)
  @ApiProperty({
    example: 'ATTENDEE',
    required: false,
    description: 'Role of the user, default is ATTENDEE if not provided.',
  })
  role: Role;

  @IsNotEmpty()
  @IsDateString()
  @ApiProperty({
    example: '1990-01-01',
    description: 'Date of birth of the user in ISO format (YYYY-MM-DD).',
  })
  date_of_birth: Date;
}
