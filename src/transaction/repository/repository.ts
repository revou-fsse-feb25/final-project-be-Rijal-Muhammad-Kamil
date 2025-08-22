import { Injectable } from '@nestjs/common';
import { Prisma, TRANSACTION_STATUS } from '@prisma/client';
import { ITransactionRepository, TransactionWithRelations } from './repository.interface';
import { PrismaService } from 'src/prisma/prisma.service';
import { InternalServerErrorException, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateTransactionDto } from '../dto/create-transaction.dto';
import { UpdateTransactionDto } from '../dto/update-transaction.dto';
import { SearchTransactionDto } from '../dto/search-transaction.dto';

@Injectable()
export class TransactionRepository implements ITransactionRepository {
  constructor(private prisma: PrismaService) {}

  async createTransaction(createTransactionDto: CreateTransactionDto, userId: number): Promise<TransactionWithRelations> {
    try {
      // Validate that all tickets exist and are available
      const tickets = await this.prisma.ticket.findMany({
        where: {
          ticket_id: { in: createTransactionDto.ticket_ids },
          transaction_id: null, // Ensure tickets are not already sold
        },
        include: {
          type: {
            include: {
              period: {
                include: {
                  event: true,
                },
              },
            },
          },
        },
      });

      if (tickets.length !== createTransactionDto.ticket_ids.length) {
        throw new BadRequestException('Some tickets are not available or do not exist');
      }

      // Create transaction and assign tickets
      const transaction = await this.prisma.transaction.create({
        data: {
          user_id: userId,
          payment_method: createTransactionDto.payment_method,
          status: TRANSACTION_STATUS.PENDING,
          tickets: {
            connect: createTransactionDto.ticket_ids.map(id => ({ ticket_id: id })),
          },
        },
        include: {
          user: {
            select: {
              user_id: true,
              email: true,
              first_name: true,
              last_name: true,
            },
          },
          tickets: {
            include: {
              type: {
                include: {
                  period: {
                    include: {
                      event: {
                        include: {
                          category: true,
                          organizer: true,
                        },
                      },
                    },
                  },
                  category: true,
                },
              },
            },
          },
        },
      });

      return transaction;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to create transaction');
    }
  }

  async findTransactionById(transactionId: number): Promise<TransactionWithRelations> {
    try {
      const transaction = await this.prisma.transaction.findUnique({
        where: { transaction_id: transactionId },
        include: {
          user: {
            select: {
              user_id: true,
              email: true,
              first_name: true,
              last_name: true,
            },
          },
          tickets: {
            include: {
              type: {
                include: {
                  period: {
                    include: {
                      event: {
                        include: {
                          category: true,
                          organizer: true,
                        },
                      },
                    },
                  },
                  category: true,
                },
              },
            },
          },
        },
      });

      if (!transaction) {
        throw new NotFoundException(`Transaction with ID ${transactionId} not found`);
      }

      return transaction;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to find transaction');
    }
  }

  async findTransactionsByUserId(userId: number): Promise<TransactionWithRelations[]> {
    try {
      const transactions = await this.prisma.transaction.findMany({
        where: { user_id: userId },
        include: {
          user: {
            select: {
              user_id: true,
              email: true,
              first_name: true,
              last_name: true,
            },
          },
          tickets: {
            include: {
              type: {
                include: {
                  period: {
                    include: {
                      event: {
                        include: {
                          category: true,
                          organizer: true,
                        },
                      },
                    },
                  },
                  category: true,
                },
              },
            },
          },
        },
        orderBy: { created_at: 'desc' },
      });

      return transactions;
    } catch (error) {
      throw new InternalServerErrorException('Failed to find transactions by user');
    }
  }

  async findAllTransactions(): Promise<TransactionWithRelations[]> {
    try {
      const transactions = await this.prisma.transaction.findMany({
        include: {
          user: {
            select: {
              user_id: true,
              email: true,
              first_name: true,
              last_name: true,
            },
          },
          tickets: {
            include: {
              type: {
                include: {
                  period: {
                    include: {
                      event: {
                        include: {
                          category: true,
                          organizer: true,
                        },
                      },
                    },
                  },
                  category: true,
                },
              },
            },
          },
        },
        orderBy: { created_at: 'desc' },
      });

      return transactions;
    } catch (error) {
      throw new InternalServerErrorException('Failed to find all transactions');
    }
  }

  async updateTransaction(transactionId: number, updateTransactionDto: UpdateTransactionDto): Promise<TransactionWithRelations> {
    try {
      const transaction = await this.prisma.transaction.update({
        where: { transaction_id: transactionId },
        data: updateTransactionDto,
        include: {
          user: {
            select: {
              user_id: true,
              email: true,
              first_name: true,
              last_name: true,
            },
          },
          tickets: {
            include: {
              type: {
                include: {
                  period: {
                    include: {
                      event: {
                        include: {
                          category: true,
                          organizer: true,
                        },
                      },
                    },
                  },
                  category: true,
                },
              },
            },
          },
        },
      });

      return transaction;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Transaction with ID ${transactionId} not found`);
      }
      throw new InternalServerErrorException('Failed to update transaction');
    }
  }

  async deleteTransaction(transactionId: number): Promise<TransactionWithRelations> {
    try {
      // First, disconnect tickets from the transaction
      await this.prisma.ticket.updateMany({
        where: { transaction_id: transactionId },
        data: { transaction_id: null },
      });

      // Then delete the transaction
      const transaction = await this.prisma.transaction.delete({
        where: { transaction_id: transactionId },
        include: {
          user: {
            select: {
              user_id: true,
              email: true,
              first_name: true,
              last_name: true,
            },
          },
          tickets: {
            include: {
              type: {
                include: {
                  period: {
                    include: {
                      event: {
                        include: {
                          category: true,
                          organizer: true,
                        },
                      },
                    },
                  },
                  category: true,
                },
              },
            },
          },
        },
      });

      return transaction;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Transaction with ID ${transactionId} not found`);
      }
      throw new InternalServerErrorException('Failed to delete transaction');
    }
  }

  async searchTransactions(searchDto: SearchTransactionDto): Promise<{
    transactions: TransactionWithRelations[];
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      const { status, payment_method, start_date, end_date, page = 1, limit = 10 } = searchDto;
      const skip = (page - 1) * limit;

      const where: Prisma.TransactionWhereInput = {};

      if (status) {
        where.status = status;
      }

      if (payment_method) {
        where.payment_method = payment_method;
      }

      if (start_date || end_date) {
        where.created_at = {};
        if (start_date) {
          where.created_at.gte = new Date(start_date);
        }
        if (end_date) {
          where.created_at.lte = new Date(end_date + 'T23:59:59.999Z');
        }
      }

      const [transactions, total] = await Promise.all([
        this.prisma.transaction.findMany({
          where,
          include: {
            user: {
              select: {
                user_id: true,
                email: true,
                first_name: true,
                last_name: true,
              },
            },
            tickets: {
              include: {
                type: {
                  include: {
                    period: {
                      include: {
                        event: {
                          include: {
                            category: true,
                            organizer: true,
                          },
                        },
                      },
                    },
                    category: true,
                  },
                },
              },
            },
          },
          orderBy: { created_at: 'desc' },
          skip,
          take: limit,
        }),
        this.prisma.transaction.count({ where }),
      ]);

      return {
        transactions,
        total,
        page,
        limit,
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to search transactions');
    }
  }

  async checkTransactionOwnership(transactionId: number, userId: number): Promise<boolean> {
    try {
      const transaction = await this.prisma.transaction.findUnique({
        where: {
          transaction_id: transactionId,
          user_id: userId,
        },
      });

      return !!transaction;
    } catch (error) {
      throw new InternalServerErrorException('Failed to check transaction ownership');
    }
  }
}