import { Transaction } from '@prisma/client';
import { CreateTransactionDTO } from '../dto/create-transaction.dto';
import { UpdateTransactionDto } from '../dto/update-transaction.dto';

export interface ITransactionRepository {
  createTransaction(user_id: number, createTransactionDTO: CreateTransactionDTO): Promise<Transaction>;
  findTransactionById(transaction_id: number): Promise<Transaction>;
  findTransactionsByUserId(user_id: number): Promise<Transaction[]>;
  updateTransaction(transaction_id: number, updateTransactionDTO: UpdateTransactionDto): Promise<Transaction>;
}
