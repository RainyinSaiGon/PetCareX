import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import {
  RevenueReportDto,
  TopServicesDto,
  RevenueReportResponse,
  TopServiceResponse,
  MemberTierStatisticsResponse,
  DashboardSummaryResponse,
} from './dto/analytics.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole } from '../../common/enums/user-role.enum';

@Controller('admin/analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.BRANCH_MANAGER)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  /**
   * FQ-02: Get Revenue Report (Total System)
   * GET /admin/analytics/revenue?startDate=2024-01-01&endDate=2024-12-31&timeFrame=monthly&maChiNhanh=CN001
   * 
   * Query Parameters:
   * - startDate: Start date (optional, defaults to current month start)
   * - endDate: End date (optional, defaults to today)
   * - timeFrame: daily|weekly|monthly|yearly (optional, defaults to daily)
   * - maChiNhanh: Filter by branch (optional)
   * 
   * Returns revenue breakdown by products, services, period, and branch
   */
  @Get('revenue')
  async getRevenueReport(@Query() dto: RevenueReportDto): Promise<RevenueReportResponse> {
    return this.analyticsService.getRevenueReport(dto);
  }

  /**
   * FQ-03: Get Top Services Analysis
   * GET /admin/analytics/top-services?months=3&limit=10
   * 
   * Query Parameters:
   * - months: Number of months to analyze (default: 3)
   * - limit: Number of top services to return (default: 10)
   * 
   * Returns top services by usage frequency and revenue
   */
  @Get('top-services')
  async getTopServices(@Query() dto: TopServicesDto): Promise<TopServiceResponse[]> {
    return this.analyticsService.getTopServices(dto);
  }

  /**
   * FQ-04: Get Member Tier Statistics
   * GET /admin/analytics/member-tiers
   * 
   * Returns member distribution across tiers, recent upgrades, and tier revenue
   */
  @Get('member-tiers')
  async getMemberTierStatistics(): Promise<MemberTierStatisticsResponse> {
    return this.analyticsService.getMemberTierStatistics();
  }

  /**
   * Dashboard Summary
   * GET /admin/analytics/dashboard
   * 
   * Returns comprehensive dashboard data including:
   * - Revenue (today, week, month, year)
   * - Customer statistics
   * - Appointments
   * - Employee counts
   * - Top products and services
   * - Revenue chart data
   */
  @Get('dashboard')
  async getDashboardSummary(): Promise<DashboardSummaryResponse> {
    return this.analyticsService.getDashboardSummary();
  }
}
