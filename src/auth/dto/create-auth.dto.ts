import { IsNotEmpty, IsEmail, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class LoginUserDTO {
  @IsNotEmpty()
  @IsEmail()
  @Transform(({ value }) => value?.trim())
  @ApiProperty({
    description: 'Email user yang terdaftar',
    example: 'user@example.com',
    type: String,
  })
  email: string;

  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value?.trim())
  @ApiProperty({
    description: 'Password user',
    example: 'strongpassword123',
    type: String,
  })
  password: string;
}
