import { Injectable, NotFoundException, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { ITransactionRepository } from './repository.interface';
import { PrismaService } from 'src/prisma/prisma.service';
import { Transaction } from '@prisma/client';
import { CreateTransactionDTO } from '../dto/create-transaction.dto';
import { UpdateTransactionDto } from '../dto/update-transaction.dto';

@Injectable()
export class TransactionRepository implements ITransactionRepository {
  constructor(private readonly prisma: PrismaService) {}

  private async getAvailableTickets(ticket_ids: number[]) {
    const tickets = await this.prisma.ticket.findMany({
      where: {
        ticket_id: { in: ticket_ids },
        transaction_id: null,
        deleted_at: null,
      },
      include: { type: true },
    });

    if (tickets.length !== ticket_ids.length) {
      throw new BadRequestException('Some tickets are not available or do not exist');
    }

    return tickets;
  }

  private async checkTransactionExists(transaction_id: number) {
    const transaction = await this.prisma.transaction.findFirst({
      where: { transaction_id, deleted_at: null },
    });

    if (!transaction) throw new NotFoundException(`Transaction with ID ${transaction_id} not found`);
  }

  private getTransactionInclude() {
    return {
      user: {
        select: { user_id: true, email: true, first_name: true, last_name: true },
      },
      tickets: {
        include: {
          type: {
            include: {
              period: { include: { event: true } },
              category: true,
            },
          },
        },
      },
    };
  }

  async createTransaction(user_id: number, createTransactionDTO: CreateTransactionDTO): Promise<Transaction> {
    try {
      const tickets = await this.getAvailableTickets(createTransactionDTO.ticket_ids);

      const total_price = tickets.reduce((sum, ticket) => {
        const price = ticket.type.discount ?? ticket.type.price;
        return sum + Number(price);
      }, 0);

      const transaction = await this.prisma.$transaction(async (tx) => {
        const created = await tx.transaction.create({
          data: {
            user_id,
            total_price,
            payment_method: createTransactionDTO.payment_method,
          },
        });

        await tx.ticket.updateMany({
          where: { ticket_id: { in: createTransactionDTO.ticket_ids } },
          data: { transaction_id: created.transaction_id },
        });

        return created;
      });

      return transaction;
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Failed to create transaction');
    }
  }

  async findTransactionById(transaction_id: number): Promise<Transaction> {
    const transaction = await this.prisma.transaction.findFirst({
      where: { transaction_id, deleted_at: null },
      include: this.getTransactionInclude(),
    });

    if (!transaction) throw new NotFoundException(`Transaction with ID ${transaction_id} not found`);

    return transaction;
  }

  async findTransactionsByUserId(user_id: number): Promise<Transaction[]> {
    return this.prisma.transaction.findMany({
      where: { user_id, deleted_at: null },
      include: this.getTransactionInclude(),
      orderBy: { created_at: 'desc' },
    });
  }

  async updateTransaction(transaction_id: number, updateTransactionDTO: UpdateTransactionDto): Promise<Transaction> {
    try {
      await this.checkTransactionExists(transaction_id);

      const updatedTransaction = await this.prisma.transaction.update({
        where: { transaction_id },
        data: updateTransactionDTO,
        include: this.getTransactionInclude(),
      });

      return updatedTransaction;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to update transaction');
    }
  }
}
