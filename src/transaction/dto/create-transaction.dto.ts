import { ApiProperty } from '@nestjs/swagger';
import { PAYMENT_METHOD } from '@prisma/client';
import { IsNotEmpty, IsEnum, IsArray, IsNumber } from 'class-validator';

export class CreateTransactionDto {
  @ApiProperty({
    enum: PAYMENT_METHOD,
    example: PAYMENT_METHOD.CREDIT_CARD,
    description: 'Payment method for the transaction',
  })
  @IsNotEmpty()
  @IsEnum(PAYMENT_METHOD)
  payment_method: PAYMENT_METHOD;

  @ApiProperty({
    example: [1, 2, 3],
    description: 'Array of ticket IDs to purchase',
    type: [Number],
  })
  @IsNotEmpty()
  @IsArray()
  @IsNumber({}, { each: true })
  ticket_ids: number[];
}
