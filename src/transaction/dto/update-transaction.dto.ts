import { ApiProperty } from '@nestjs/swagger';
import { TRANSACTION_STATUS } from '@prisma/client';
import { IsNotEmpty, IsEnum } from 'class-validator';

export class UpdateTransactionDto {
  @ApiProperty({
    enum: TRANSACTION_STATUS,
    example: TRANSACTION_STATUS.SUCCESS,
    description: 'New status for the transaction',
  })
  @IsNotEmpty()
  @IsEnum(TRANSACTION_STATUS)
  status: TRANSACTION_STATUS;
}
