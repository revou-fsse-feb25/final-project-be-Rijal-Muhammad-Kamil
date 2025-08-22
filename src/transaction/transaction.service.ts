import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { CreateTransactionDto } from './dto/create-transaction.dto';

import { SearchTransactionDto } from './dto/search-transaction.dto';
import { TransactionRepository } from './repository/repository';
import { TransactionWithRelations } from './repository/repository.interface';

interface CurrentUser {
  userId: number;
  role: Role;
}

@Injectable()
export class TransactionService {
  constructor(private readonly transactionRepository: TransactionRepository) {}

  async createTransaction(createTransactionDto: CreateTransactionDto, currentUser: CurrentUser): Promise<TransactionWithRelations> {
    // Only ATTENDEE can create transactions (buy tickets)
    if (currentUser.role !== Role.ATTENDEE) {
      throw new ForbiddenException('Only attendees can create transactions');
    }

    return this.transactionRepository.createTransaction(createTransactionDto, currentUser.userId);
  }

  async findTransactionById(transactionId: number, currentUser: CurrentUser): Promise<TransactionWithRelations> {
    const transaction = await this.transactionRepository.findTransactionById(transactionId);

    // Users can only view their own transactions, admins can view all
    if (currentUser.role !== Role.ADMIN && transaction.user_id !== currentUser.userId) {
      throw new ForbiddenException('You can only view your own transactions');
    }

    return transaction;
  }

  async findMyTransactions(currentUser: CurrentUser): Promise<TransactionWithRelations[]> {
    // Only ATTENDEE can view their own transactions
    if (currentUser.role !== Role.ATTENDEE) {
      throw new ForbiddenException('Only attendees can view their transactions');
    }

    return this.transactionRepository.findTransactionsByUserId(currentUser.userId);
  }

  async findAllTransactionsForAdmin(currentUser: CurrentUser): Promise<TransactionWithRelations[]> {
    // Only admins can view all transactions
    if (currentUser.role !== Role.ADMIN) {
      throw new ForbiddenException('Only admins can view all transactions');
    }

    return this.transactionRepository.findAllTransactions();
  }

  async cancelTransaction(transactionId: number, currentUser: CurrentUser): Promise<TransactionWithRelations> {
    // Check if transaction exists and user has permission
    const existingTransaction = await this.transactionRepository.findTransactionById(transactionId);

    // Users can only cancel their own transactions, admins can cancel all
    if (currentUser.role !== Role.ADMIN && existingTransaction.user_id !== currentUser.userId) {
      throw new ForbiddenException('You can only cancel your own transactions');
    }

    return this.transactionRepository.deleteTransaction(transactionId);
  }

  async searchTransactions(
    searchDto: SearchTransactionDto,
    currentUser: CurrentUser,
  ): Promise<{
    transactions: TransactionWithRelations[];
    total: number;
    page: number;
    limit: number;
  }> {
    // Only admins can search all transactions
    if (currentUser.role !== Role.ADMIN) {
      throw new ForbiddenException('Only admins can search transactions');
    }

    return this.transactionRepository.searchTransactions(searchDto);
  }

  async searchMyTransactions(
    searchDto: SearchTransactionDto,
    currentUser: CurrentUser,
  ): Promise<{
    transactions: TransactionWithRelations[];
    total: number;
    page: number;
    limit: number;
  }> {
    // Only ATTENDEE can search their own transactions
    if (currentUser.role !== Role.ATTENDEE) {
      throw new ForbiddenException('Only attendees can search their transactions');
    }

    // Modify search to filter by current user
    const userFilteredSearch = {
      ...searchDto,
      user_id: currentUser.userId,
    };

    // We need to modify the repository method to accept user_id filter
    // For now, we'll get user transactions and apply filters manually
    const userTransactions = await this.transactionRepository.findTransactionsByUserId(currentUser.userId);

    // Apply filters manually (this could be optimized by modifying repository)
    let filteredTransactions = userTransactions;

    if (searchDto.status) {
      filteredTransactions = filteredTransactions.filter((t) => t.status === searchDto.status);
    }

    if (searchDto.payment_method) {
      filteredTransactions = filteredTransactions.filter((t) => t.payment_method === searchDto.payment_method);
    }

    if (searchDto.start_date) {
      const startDate = new Date(searchDto.start_date);
      filteredTransactions = filteredTransactions.filter((t) => new Date(t.created_at) >= startDate);
    }

    if (searchDto.end_date) {
      const endDate = new Date(searchDto.end_date + 'T23:59:59.999Z');
      filteredTransactions = filteredTransactions.filter((t) => new Date(t.created_at) <= endDate);
    }

    // Apply pagination
    const page = searchDto.page || 1;
    const limit = searchDto.limit || 10;
    const skip = (page - 1) * limit;
    const total = filteredTransactions.length;
    const paginatedTransactions = filteredTransactions.slice(skip, skip + limit);

    return {
      transactions: paginatedTransactions,
      total,
      page,
      limit,
    };
  }
}
