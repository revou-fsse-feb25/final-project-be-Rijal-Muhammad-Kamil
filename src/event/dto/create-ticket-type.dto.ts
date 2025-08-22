import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsEnum, Min, IsDecimal } from 'class-validator';
import { TicketStatus } from '@prisma/client';

export class CreateTicketTypeDTO {
  @ApiProperty({
    example: 1,
    description: 'ID of the TicketTypeCategory',
  })
  @IsNotEmpty()
  @IsNumber()
  category_id: number;

  @ApiProperty({
    example: 100000.0,
    description: 'Price of the ticket',
  })
  @IsNotEmpty()
  @IsDecimal()
  @Min(0)
  price: number;

  @ApiProperty({
    example: 5000.0,
    description: 'Discount for the ticket (optional)',
    required: false,
  })
  @IsOptional()
  @IsDecimal()
  @Min(0)
  discount?: number;

  @ApiProperty({
    example: 100,
    description: 'Quota for this ticket type',
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  quota: number;

  @ApiProperty({
    enum: TicketStatus,
    example: TicketStatus.available,
    description: 'Status of the ticket type',
    required: false,
  })
  @IsOptional()
  @IsEnum(TicketStatus)
  status?: TicketStatus;
}
