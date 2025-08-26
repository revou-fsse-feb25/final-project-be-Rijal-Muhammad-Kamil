import { IsNotEmpty, IsEmail, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class LoginUserDTO {
  @IsEmail({}, { message: 'Email is not valid' })
  @IsNotEmpty({ message: 'Email must not be empty' })
  @Transform(({ value }) => value?.trim())
  @ApiProperty({
    description: 'Email user yang terdaftar',
    example: 'user@example.com',
    type: String,
  })
  email: string;

  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password must not be empty' })
  @Transform(({ value }) => value?.trim())
  @ApiProperty({
    description: 'Password user',
    example: 'strongpassword123',
    type: String,
  })
  password: string;
}
