import { IsNotEmpty, IsEmail, IsString, Matches, MinLength, MaxLength, IsEnum, IsOptional } from 'class-validator';
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
  @MinLength(8)
  @MaxLength(15)
  @Transform(({ value }) => value.trim())
  @Matches(/^\+[1-9]\d{7,14}$/, { message: 'Phone number must be in international format with 8-15 digits, e.g., +6281234567890' })
  @ApiProperty({
    example: '+6281234567890',
    description: 'Phone number of the user in international format (E.164).',
    minLength: 8,
    maxLength: 15,
  })
  phone_number: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(51)
  @Matches(/^[\p{L}\s'\-]*$/u, { message: 'Names may only contain letters (all languages), spaces, apostrophes and minus signs.' })
  @Transform(({ value }) => value.trim())
  @ApiProperty({
    example: 'John',
    description: 'First name of the user. Only letters (all languages), spaces, apostrophes, and minus signs.',
    minLength: 3,
    maxLength: 51,
  })
  first_name: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(51)
  @Matches(/^[\p{L}\s'\-]*$/u, { message: 'Names may only contain letters (all languages), spaces, apostrophes and minus signs.' })
  @Transform(({ value }) => value.trim())
  @ApiProperty({
    example: 'Doe',
    description: 'Last name of the user. Only letters (all languages), spaces, apostrophes, and minus signs.',
    minLength: 3,
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
  @IsString()
  @Matches(/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/, { message: 'date_of_birth must be in YYYY-MM-DD format and a valid date' })
  @ApiProperty({
    example: '1990-01-01',
    description: 'Date of birth of the user. Must be in YYYY-MM-DD format with a valid month (01-12) and day (01-31).',
    type: 'string',
    format: 'date',
  })
  date_of_birth: string;

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

  @IsOptional()
  @IsEnum(Role)
  @ApiProperty({
    example: Role.ATTENDEE,
    description: 'Role of the user, default is ATTENDEE if not provided.',
    default: Role.ATTENDEE,
  })
  role?: Role = Role.ATTENDEE;
}
