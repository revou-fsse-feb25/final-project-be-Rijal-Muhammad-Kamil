import { IsEmail, IsNotEmpty, IsEnum, IsString, IsDateString, Matches, MinLength, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { Role, Gender } from '@prisma/client';

export class CreateUserDTO {
  @IsNotEmpty()
  @IsEmail()
  @MaxLength(51)
  @Transform(({ value }) => value.trim())
  @ApiProperty({
    example: 'user@example.com',
    description: 'The email address of the user, must be unique and valid.',
    format: 'email',
    maxLength: 51,
  })
  email: string;

  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value.trim())
  @Matches(/^\+[1-9]\d{7,14}$/, {
    message: 'Phone number must be in international format with 8-15 digits, e.g., +6281234567890',
  })
  @ApiProperty({
    example: '+6281234567890',
    description: 'Phone number of the user in international format (E.164).',
    pattern: '^\\+[1-9]\\d{7,14}$',
  })
  phone_number: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  @MaxLength(51)
  @Transform(({ value }) => value.trim())
  @Matches(/^(?=.*[A-Z])(?=.*\d)[A-Za-z\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+$/, {
    message: 'Password must contain at least one uppercase letter and one number, special characters are optional',
  })
  @ApiProperty({
    example: 'Password1!',
    description: 'The password for the user account. Must contain at least one uppercase letter and one number, special characters optional, length 6-51 characters.',
    minLength: 6,
    maxLength: 51,
  })
  password: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(51)
  @Transform(({ value }) => value.trim())
  @ApiProperty({
    example: 'John',
    description: 'First name of the user.',
    minLength: 3,
    maxLength: 51,
  })
  first_name: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  @MaxLength(51)
  @Transform(({ value }) => value.trim())
  @ApiProperty({
    example: 'Doe',
    description: 'Last name of the user.',
    minLength: 1,
    maxLength: 51,
  })
  last_name: string;

  @IsNotEmpty()
  @IsEnum(Gender)
  @ApiProperty({
    example: Gender.MALE,
    description: 'Gender of the user, must be either Male or Female.',
    enum: Gender,
  })
  gender: Gender;

  @IsNotEmpty()
  @IsEnum(Role)
  @ApiProperty({
    example: Role.ATTENDEE,
    description: 'Role of the user, default is ATTENDEE if not provided.',
    enum: Role,
  })
  role: Role;

  @IsNotEmpty()
  @IsDateString()
  @Transform(({ value }) => new Date(value))
  @ApiProperty({
    example: '1990-01-01',
    description: 'Date of birth of the user in ISO format (YYYY-MM-DD).',
    type: 'string',
    format: 'date',
  })
  date_of_birth: Date;
}
