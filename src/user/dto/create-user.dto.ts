import { IsEmail, IsNotEmpty, MaxLength, IsString, MinLength, Matches, IsEnum, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { Role, Gender } from '@prisma/client';

export class CreateUserDTO {
  @IsEmail({}, { message: 'Email must be a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  @MaxLength(51, { message: 'Email cannot exceed 51 characters' })
  @Transform(({ value }) => value.trim())
  @ApiProperty({
    example: 'user@example.com',
    description: 'User email, must be unique and valid.',
    format: 'email',
    maxLength: 51,
  })
  email: string;

  @IsString({ message: 'Phone number must be a string' })
  @IsNotEmpty({ message: 'Phone number is required' })
  @MinLength(8, { message: 'Phone number must be at least 8 digits' })
  @MaxLength(15, { message: 'Phone number cannot exceed 15 digits' })
  @Matches(/^\+[1-9]\d{7,14}$/, { message: 'Phone number must be in international format, e.g., +6281234567890' })
  @Transform(({ value }) => value.trim())
  @ApiProperty({
    example: '+6281234567890',
    description: 'User phone number in international format (E.164).',
    minLength: 8,
    maxLength: 15,
  })
  phone_number: string;

  @IsString({ message: 'First name must be a string' })
  @IsNotEmpty({ message: 'First name is required' })
  @MinLength(3, { message: 'First name must be at least 3 characters' })
  @MaxLength(51, { message: 'First name cannot exceed 51 characters' })
  @Matches(/^[\p{L}\s'\-]*$/u, { message: 'First name can only contain letters, spaces, apostrophes, and hyphens' })
  @Transform(({ value }) => value.trim())
  @ApiProperty({
    example: 'John',
    description: 'User first name.',
    minLength: 3,
    maxLength: 51,
  })
  first_name: string;

  @IsString({ message: 'Last name must be a string' })
  @IsNotEmpty({ message: 'Last name is required' })
  @MinLength(3, { message: 'Last name must be at least 3 characters' })
  @MaxLength(51, { message: 'Last name cannot exceed 51 characters' })
  @Matches(/^[\p{L}\s'\-]*$/u, { message: 'Last name can only contain letters, spaces, apostrophes, and hyphens' })
  @Transform(({ value }) => value.trim())
  @ApiProperty({
    example: 'Doe',
    description: 'User last name.',
    minLength: 3,
    maxLength: 51,
  })
  last_name: string;

  @IsEnum(Gender, { message: 'Gender must be either MALE or FEMALE' })
  @IsNotEmpty({ message: 'Gender is required' })
  @ApiProperty({
    example: Gender.MALE,
    description: 'User gender, must be MALE or FEMALE.',
    enum: Gender,
  })
  gender: Gender;

  @IsString({ message: 'Date of birth must be a string' })
  @IsNotEmpty({ message: 'Date of birth is required' })
  @Matches(/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/, { message: 'Date of birth must be in YYYY-MM-DD format and valid' })
  @ApiProperty({
    example: '1990-01-01',
    description: 'User date of birth in YYYY-MM-DD format.',
    type: 'string',
    format: 'date',
  })
  date_of_birth: string;

  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  @MaxLength(51, { message: 'Password cannot exceed 51 characters' })
  @Matches(/^(?=.*[A-Z])(?=.*\d)[A-Za-z\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+$/, {
    message: 'Password must contain at least one uppercase letter and one number',
  })
  @Transform(({ value }) => value.trim())
  @ApiProperty({
    example: 'Password1!',
    description: 'User password, must include at least one uppercase letter and one number.',
    minLength: 6,
    maxLength: 51,
  })
  password: string;

  @IsEnum(Role, { message: 'Role must be a valid role' })
  @IsOptional()
  @ApiProperty({
    example: Role.ATTENDEE,
    description: 'User role, default is ATTENDEE if not provided.',
    default: Role.ATTENDEE,
  })
  role?: Role = Role.ATTENDEE;
}
