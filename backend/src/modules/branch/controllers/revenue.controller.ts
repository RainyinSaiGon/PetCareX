import { Controller, Get, Post, Body, Query, Param } from '@nestjs/common';
import { RevenueService } from '../services/revenue.service';

@Controller('branch/revenue')
export class RevenueController {
  constructor(private revenueService: RevenueService) {}

  // FB-02: Get branch revenue reports
  @Get('report')
  async getBranchRevenueReport(
    @Query('branchId') branchId?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.revenueService.getBranchRevenueReport(branchId, page, limit);
  }

  // FB-02: Get revenue details for date range
  @Post('details')
  async getRevenueDetailsByDateRange(
    @Body() body: any,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    const { startDate, endDate, branchId } = body;
    return this.revenueService.getRevenueDetailsByDateRange(
      new Date(startDate),
      new Date(endDate),
      branchId,
      page,
      limit,
    );
  }

  // FB-02: Get monthly revenue chart
  @Get('monthly-chart')
  async getMonthlyRevenueChart(
    @Query('year') year: number,
    @Query('branchId') branchId?: string,
  ) {
    return this.revenueService.getMonthlyRevenueChart(year, branchId);
  }

  // FB-02: Get top services
  @Get('top-services')
  async getTopServicesByRevenue(
    @Query('branchId') branchId?: string,
    @Query('limit') limit: number = 10,
  ) {
    return this.revenueService.getTopServicesByRevenue(branchId, limit);
  }

  // FB-02: Get top products
  @Get('top-products')
  async getTopProductsByRevenue(
    @Query('branchId') branchId?: string,
    @Query('limit') limit: number = 10,
  ) {
    return this.revenueService.getTopProductsByRevenue(branchId, limit);
  }

  // FB-02: Get total system revenue
  @Get('total-system')
  async getTotalSystemRevenue(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.revenueService.getTotalSystemRevenue(
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }
}
