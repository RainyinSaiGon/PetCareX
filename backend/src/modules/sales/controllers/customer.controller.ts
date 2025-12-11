import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, HttpStatus, HttpCode } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { CustomerService } from '../services/customer.service';
import { CreateCustomerDto, UpdateCustomerDto, CustomerResponseDto, CustomerStatisticsDto, InactiveCustomerDto } from '../dto/customer.dto';

@Controller('api/customers')
@UseGuards(JwtAuthGuard)
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  /**
   * FS-01: Create new customer
   * POST /api/customers
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createCustomer(@Body() createCustomerDto: CreateCustomerDto): Promise<CustomerResponseDto> {
    return this.customerService.createCustomer(createCustomerDto);
  }

  /**
   * FS-01: Get all customers with pagination and filtering
   * GET /api/customers?page=1&limit=10&search=&tier=
   */
  @Get()
  async getAllCustomers(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('search') search?: string,
    @Query('tier') tier?: string,
  ): Promise<{ data: CustomerResponseDto[]; total: number; page: number; totalPages: number }> {
    return this.customerService.getAllCustomers(parseInt(page), parseInt(limit), search, tier);
  }

  /**
   * FS-01: Get customer by ID
   * GET /api/customers/:id
   */
  @Get(':id')
  async getCustomerById(@Param('id') customerId: string): Promise<CustomerResponseDto> {
    return this.customerService.getCustomerById(parseInt(customerId));
  }

  /**
   * FS-01: Update customer
   * PUT /api/customers/:id
   */
  @Put(':id')
  async updateCustomer(
    @Param('id') customerId: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
  ): Promise<CustomerResponseDto> {
    return this.customerService.updateCustomer(parseInt(customerId), updateCustomerDto);
  }

  /**
   * FS-01: Delete customer (soft delete)
   * DELETE /api/customers/:id
   */
  @Delete(':id')
  async deleteCustomer(@Param('id') customerId: string): Promise<{ success: boolean; message: string }> {
    return this.customerService.deleteCustomer(parseInt(customerId));
  }

  /**
   * FS-02: Get customer statistics
   * GET /api/customers/statistics/overview
   */
  @Get('statistics/overview')
  async getCustomerStatistics(): Promise<CustomerStatisticsDto> {
    return this.customerService.getCustomerStatistics();
  }

  /**
   * FS-02: Get inactive customers
   * GET /api/customers/statistics/inactive?days=90
   */
  @Get('statistics/inactive')
  async getInactiveCustomers(
    @Query('days') days: string = '90',
  ): Promise<InactiveCustomerDto[]> {
    return this.customerService.getInactiveCustomers(parseInt(days));
  }

  /**
   * FS-02: Get spending trends
   * GET /api/customers/statistics/trends?months=12
   */
  @Get('statistics/trends')
  async getSpendingTrends(
    @Query('months') months: string = '12',
  ): Promise<{ month: string; totalSpending: number; transactionCount: number }[]> {
    return this.customerService.getSpendingTrends(parseInt(months));
  }

  /**
   * FS-01: Search customers
   * GET /api/customers/search?q=
   */
  @Get('search/query')
  async searchCustomers(@Query('q') query: string): Promise<CustomerResponseDto[]> {
    if (!query || query.length < 2) {
      throw new Error('Search query must be at least 2 characters');
    }
    return this.customerService.searchCustomers(query);
  }

  /**
   * FS-01: Get customers by tier
   * GET /api/customers/tier/:tier
   */
  @Get('tier/:tier')
  async getCustomersByTier(@Param('tier') tier: string): Promise<CustomerResponseDto[]> {
    return this.customerService.getCustomersByTier(tier);
  }

  /**
   * FS-01: Export customers to CSV
   * GET /api/customers/export/csv
   */
  @Get('export/csv')
  async exportCustomersToCsv(): Promise<{ csv: string }> {
    const csv = await this.customerService.exportCustomersToCsv();
    return { csv };
  }

  /**
   * Update customer tier
   * PUT /api/customers/:id/tier
   */
  @Put(':id/tier')
  async updateCustomerTier(
    @Param('id') customerId: string,
    @Body() body: { tier: string; totalSpending: number },
  ): Promise<CustomerResponseDto> {
    return this.customerService.updateCustomerTier(parseInt(customerId), body.tier, body.totalSpending);
  }
}
