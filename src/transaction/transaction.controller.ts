import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TransactionService } from './transaction.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { SearchTransactionDto } from './dto/search-transaction.dto';
import { JwtAuthGuard } from '../common/guard/jwt-auth.guard';
import { RolesGuard } from '../common/guard/role.guard';
import { Roles } from '../common/decorator/role.decorator';
import { CurrentUser } from '../common/decorator/current-user.decorator';
import { Role } from '@prisma/client';

@ApiTags('Transactions')
@Controller('transactions')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post()
  @Roles(Role.ATTENDEE, Role.ADMIN)
  @ApiOperation({ summary: 'Create a new transaction (Attendee and Admin only)' })
  @ApiResponse({ status: 201, description: 'Transaction created successfully' })
  @ApiResponse({ status: 403, description: 'Access denied: Event organizers cannot create transactions' })
  @ApiResponse({ status: 400, description: 'Bad request: Invalid input data or tickets not available' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async createTransaction(
    @Body() createTransactionDto: CreateTransactionDto,
    @CurrentUser() currentUser: { userId: number; role: Role },
  ) {
    return this.transactionService.createTransaction(createTransactionDto, currentUser);
  }

  @Get('my-transactions')
  @Roles(Role.ATTENDEE, Role.ADMIN)
  @ApiOperation({ summary: 'Get all transactions for current user' })
  @ApiResponse({ status: 200, description: 'List of user transactions' })
  @ApiResponse({ status: 403, description: 'Access denied: Event organizers cannot view transactions' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async findMyTransactions(@CurrentUser() currentUser: { userId: number; role: Role }) {
    return this.transactionService.findMyTransactions(currentUser);
  }

  @Get('my-transactions/search')
  @Roles(Role.ATTENDEE, Role.ADMIN)
  @ApiOperation({ summary: 'Search user own transactions with filters' })
  @ApiResponse({
    status: 200,
    description: 'List of user transactions matching search criteria with pagination',
    schema: {
      type: 'object',
      properties: {
        transactions: {
          type: 'array',
          items: { type: 'object' },
        },
        total: { type: 'number' },
        page: { type: 'number' },
        limit: { type: 'number' },
      },
    },
  })
  @ApiResponse({ status: 403, description: 'Access denied: Event organizers cannot search transactions' })
  @ApiResponse({ status: 400, description: 'Bad request: Invalid search parameters' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async searchMyTransactions(
    @Query() searchDto: SearchTransactionDto,
    @CurrentUser() currentUser: { userId: number; role: Role },
  ) {
    return this.transactionService.searchMyTransactions(searchDto, currentUser);
  }

  @Get('all')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get all transactions (Admin only)' })
  @ApiResponse({ status: 200, description: 'List of all transactions in the system' })
  @ApiResponse({ status: 403, description: 'Access denied: Only admins can view all transactions' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async findAllTransactions(@CurrentUser() currentUser: { userId: number; role: Role }) {
    return this.transactionService.findAllTransactionsForAdmin(currentUser);
  }

  @Get('all/search')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Search all transactions with filters (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'List of all transactions matching search criteria with pagination',
    schema: {
      type: 'object',
      properties: {
        transactions: {
          type: 'array',
          items: { type: 'object' },
        },
        total: { type: 'number' },
        page: { type: 'number' },
        limit: { type: 'number' },
      },
    },
  })
  @ApiResponse({ status: 403, description: 'Access denied: Only admins can search all transactions' })
  @ApiResponse({ status: 400, description: 'Bad request: Invalid search parameters' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async searchAllTransactions(
    @Query() searchDto: SearchTransactionDto,
    @CurrentUser() currentUser: { userId: number; role: Role },
  ) {
    return this.transactionService.searchTransactions(searchDto, currentUser);
  }

  @Get(':id')
  @Roles(Role.ATTENDEE, Role.ADMIN)
  @ApiOperation({ summary: 'Get transaction by ID (Own transactions for users, all for Admin)' })
  @ApiResponse({ status: 200, description: 'Transaction details' })
  @ApiResponse({ status: 403, description: 'Access denied: Can only view own transactions' })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async findTransactionById(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() currentUser: { userId: number; role: Role },
  ) {
    return this.transactionService.findTransactionById(id, currentUser);
  }

  @Patch(':id')
  @Roles(Role.ATTENDEE, Role.ADMIN)
  @ApiOperation({ summary: 'Update transaction status (Own transactions for users, all for Admin)' })
  @ApiResponse({ status: 200, description: 'Transaction updated successfully' })
  @ApiResponse({ status: 403, description: 'Access denied: Can only update own transactions' })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  @ApiResponse({ status: 400, description: 'Bad request: Invalid input data' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async updateTransaction(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTransactionDto: UpdateTransactionDto,
    @CurrentUser() currentUser: { userId: number; role: Role },
  ) {
    return this.transactionService.updateTransaction(id, updateTransactionDto, currentUser);
  }

  @Delete(':id')
  @Roles(Role.ATTENDEE, Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete transaction (Own transactions for users, all for Admin)' })
  @ApiResponse({ status: 200, description: 'Transaction deleted successfully' })
  @ApiResponse({ status: 403, description: 'Access denied: Can only delete own transactions' })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async deleteTransaction(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() currentUser: { userId: number; role: Role },
  ) {
    return this.transactionService.deleteTransaction(id, currentUser);
  }
}
