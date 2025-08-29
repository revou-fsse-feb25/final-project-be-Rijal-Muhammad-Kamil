import { Controller, Post, Body, UseGuards, Get, Param, ParseIntPipe, Patch } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TransactionService } from './transaction.service';
import { CreateTransactionDTO } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { JwtAuthGuard } from 'src/common/guard/jwt-auth.guard';
import { CurrentUser } from 'src/common/decorator/current-user.decorator';
import { Transaction, Role, UserStatus } from '@prisma/client';

@ApiTags('transactions')
@ApiBearerAuth()
@Controller('transactions')
@UseGuards(JwtAuthGuard)
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new transaction' })
  @ApiResponse({
    status: 201,
    description: 'Transaction created successfully',
    type: 'Transaction',
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async createTransaction(@Body() createTransactionDTO: CreateTransactionDTO, @CurrentUser() currentUser: { user_id: number; role: Role; status: UserStatus }): Promise<Transaction> {
    return this.transactionService.createTransaction(createTransactionDTO, currentUser);
  }

  @Get('my-transactions')
  @ApiOperation({ summary: 'Get current user transactions' })
  @ApiResponse({
    status: 200,
    description: 'User transactions retrieved successfully',
    type: 'Transaction',
    isArray: true,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getMyTransactions(@CurrentUser() currentUser: { user_id: number; role: Role; status: UserStatus }): Promise<Transaction[]> {
    return this.transactionService.findMyTransactions(currentUser);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get transactions by user ID (Admin only or own transactions)' })
  @ApiResponse({
    status: 200,
    description: 'User transactions retrieved successfully',
    type: 'Transaction',
    isArray: true,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getTransactionsByUserId(@Param('userId', ParseIntPipe) userId: number, @CurrentUser() currentUser: { user_id: number; role: Role; status: UserStatus }): Promise<Transaction[]> {
    return this.transactionService.findTransactionsByUserId(userId, currentUser);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get transaction by ID' })
  @ApiResponse({
    status: 200,
    description: 'Transaction retrieved successfully',
    type: 'Transaction',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  async getTransactionById(@Param('id', ParseIntPipe) id: number, @CurrentUser() currentUser: { user_id: number; role: Role; status: UserStatus }): Promise<Transaction> {
    return this.transactionService.findTransactionById(id, currentUser);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update transaction' })
  @ApiResponse({
    status: 200,
    description: 'Transaction updated successfully',
    type: 'Transaction',
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  async updateTransaction(@Param('id', ParseIntPipe) id: number, @Body() updateTransactionDto: UpdateTransactionDto, @CurrentUser() currentUser: { user_id: number; role: Role; status: UserStatus }): Promise<Transaction> {
    return this.transactionService.updateTransaction(id, updateTransactionDto, currentUser);
  }
}
