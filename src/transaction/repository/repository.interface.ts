import { CreateTransactionDto } from '../dto/create-transaction.dto';
import { UpdateTransactionDto } from '../dto/update-transaction.dto';
import { SearchTransactionDto } from '../dto/search-transaction.dto';
import { Prisma } from '@prisma/client';

type TransactionWithRelations = Prisma.TransactionGetPayload<{
  include: {
    user: {
      select: {
        user_id: true;
        email: true;
        first_name: true;
        last_name: true;
      };
    };
    tickets: {
      include: {
        type: {
          include: {
            period: {
              include: {
                event: {
                  include: {
                    category: true;
                    organizer: true;
                  };
                };
              };
            };
            category: true;
          };
        };
      };
    };
  };
}>;

export interface ITransactionRepository {
  createTransaction(createTransactionDto: CreateTransactionDto, userId: number): Promise<TransactionWithRelations>;
  findTransactionById(transactionId: number): Promise<TransactionWithRelations>;
  findTransactionsByUserId(userId: number): Promise<TransactionWithRelations[]>;
  findAllTransactions(): Promise<TransactionWithRelations[]>;
  updateTransaction(transactionId: number, updateTransactionDto: UpdateTransactionDto): Promise<TransactionWithRelations>;
  deleteTransaction(transactionId: number): Promise<TransactionWithRelations>;
  searchTransactions(searchDto: SearchTransactionDto): Promise<{
    transactions: TransactionWithRelations[];
    total: number;
    page: number;
    limit: number;
  }>;
  checkTransactionOwnership(transactionId: number, userId: number): Promise<boolean>;
}

export { TransactionWithRelations };
