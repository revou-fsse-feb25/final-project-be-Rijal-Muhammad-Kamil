import { IsString, IsNotEmpty, IsEnum, IsDateString, MinLength, MaxLength } from 'class-validator';
import { Gender, Role } from '@prisma/client';

export class CreateUserProfileDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(51)
  first_name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(51)
  last_name: string;

  @IsDateString()
  @IsNotEmpty()
  date_of_birth: string;

  @IsEnum(Gender)
  @IsNotEmpty()
  gender: Gender;

  @IsString()
  @IsNotEmpty()
  @MaxLength(14)
  phone_number: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(255)
  password: string;

  @IsEnum(Role)
  @IsNotEmpty()
  role: Role;
}
