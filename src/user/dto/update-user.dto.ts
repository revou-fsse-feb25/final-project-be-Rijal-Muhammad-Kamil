import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDTO } from './create-user.dto';
import { IsNotEmpty, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto extends PartialType(CreateUserDTO) {
  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({ example: 1, description: 'User ID to update' })
  user_id: number;
}
