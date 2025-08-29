import { Injectable, ForbiddenException } from '@nestjs/common';
import { TransactionRepository } from './repository/repository';
import { CreateTransactionDTO } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { Transaction } from '@prisma/client';
import { Role, UserStatus } from '@prisma/client';

@Injectable()
export class TransactionService {
  constructor(private readonly transactionRepository: TransactionRepository) {}

  private ensureActive(currentUser: { role: Role; status: UserStatus }) {
    if (currentUser.role !== Role.ADMIN && currentUser.status !== UserStatus.ACTIVE) {
      throw new ForbiddenException('Your account must be active to perform this action');
    }
  }

  private ensureOwnershipOrAdmin(transaction_user_id: number, currentUser: { user_id: number; role: Role }) {
    if (currentUser.role !== Role.ADMIN && currentUser.user_id !== transaction_user_id) {
      throw new ForbiddenException('Access denied: you can only access your own transactions');
    }
  }

  async createTransaction(createTransactionDTO: CreateTransactionDTO, currentUser: { user_id: number; role: Role; status: UserStatus }): Promise<Transaction> {
    this.ensureActive(currentUser);

    return this.transactionRepository.createTransaction(currentUser.user_id, createTransactionDTO);
  }

  async findTransactionById(transaction_id: number, currentUser: { user_id: number; role: Role; status: UserStatus }): Promise<Transaction> {
    this.ensureActive(currentUser);

    const transaction = await this.transactionRepository.findTransactionById(transaction_id);

    if (transaction.user_id !== null) {
      this.ensureOwnershipOrAdmin(transaction.user_id, currentUser);
    }

    return transaction;
  }

  async findTransactionsByUserId(user_id: number, currentUser: { user_id: number; role: Role; status: UserStatus }): Promise<Transaction[]> {
    this.ensureActive(currentUser);

    this.ensureOwnershipOrAdmin(user_id, currentUser);

    return this.transactionRepository.findTransactionsByUserId(user_id);
  }

  async findMyTransactions(currentUser: { user_id: number; role: Role; status: UserStatus }): Promise<Transaction[]> {
    this.ensureActive(currentUser);

    return this.transactionRepository.findTransactionsByUserId(currentUser.user_id);
  }

  async updateTransaction(transaction_id: number, updateTransactionDTO: UpdateTransactionDto, currentUser: { user_id: number; role: Role; status: UserStatus }): Promise<Transaction> {
    this.ensureActive(currentUser);

    const existingTransaction = await this.transactionRepository.findTransactionById(transaction_id);

    if (existingTransaction.user_id !== null) {
      this.ensureOwnershipOrAdmin(existingTransaction.user_id, currentUser);
    }

    return this.transactionRepository.updateTransaction(transaction_id, updateTransactionDTO);
  }
}
