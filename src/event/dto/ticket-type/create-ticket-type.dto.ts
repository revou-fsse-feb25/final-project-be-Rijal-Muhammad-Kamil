import { IsNotEmpty, IsInt, IsNumber, Min, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TicketStatus } from '@prisma/client';

export class CreateTicketTypeDTO {
  @IsNotEmpty()
  @IsInt()
  @ApiProperty({
    example: 1,
    description: 'ID of the TicketTypeCategory',
    type: 'number',
  })
  category_id: number;

  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @ApiProperty({
    example: 100000.0,
    description: 'Price of the ticket (non-negative, up to 2 decimal places)',
    minimum: 0,
    type: 'number',
  })
  price: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @ApiProperty({
    example: 5000.0,
    description: 'Discount for the ticket (optional, non-negative, up to 2 decimal places)',
    minimum: 0,
    required: false,
    type: 'number',
  })
  discount?: number;

  @IsNotEmpty()
  @IsInt()
  @Min(0)
  @ApiProperty({
    example: 100,
    description: 'Quota for this ticket type (integer, non-negative)',
    minimum: 0,
    type: 'number',
  })
  quota: number;

  @IsNotEmpty()
  @IsEnum(TicketStatus)
  @ApiProperty({
    enum: Object.values(TicketStatus),
    example: TicketStatus.AVAILABLE,
    description: 'Status of the ticket type ( e.g., AVAILABLE or SOLD_OUT)',
    type: 'string',
  })
  status: TicketStatus;
}
