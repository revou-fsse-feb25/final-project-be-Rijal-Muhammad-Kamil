import { IsEnum, IsArray, ArrayNotEmpty, IsInt, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PAYMENT_METHOD } from '@prisma/client';

export class CreateTransactionDTO {
  @ApiProperty({
    description: 'Method of payment for the transaction',
    enum: PAYMENT_METHOD,
    example: PAYMENT_METHOD.CREDIT_CARD,
  })
  @IsNotEmpty()
  @IsEnum(PAYMENT_METHOD)
  payment_method: PAYMENT_METHOD;

  @ApiProperty({
    description: 'Array of ticket IDs to be included in the transaction',
    type: [Number],
    example: [1, 2, 3],
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  ticket_ids: number[];
}
