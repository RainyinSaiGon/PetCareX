import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  AnalyticsService, 
  DashboardSummary, 
  RevenueReportResponse,
  TopServiceResponse,
  MemberTierStatistics,
  RevenueTimeFrame 
} from '../../services/analytics.service';

@Component({
  selector: 'app-analytics-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './analytics-dashboard.component.html',
  styleUrls: ['./analytics-dashboard.component.css']
})
export class AnalyticsDashboardComponent implements OnInit {
  loading = true;
  error: string | null = null;

  // Dashboard data
  dashboard: DashboardSummary | null = null;
  revenueReport: RevenueReportResponse | null = null;
  topServices: TopServiceResponse[] = [];
  memberTiers: MemberTierStatistics | null = null;

  // Filters
  selectedTimeFrame: RevenueTimeFrame = RevenueTimeFrame.DAILY;
  selectedPeriod: 'week' | 'month' | 'year' = 'month';
  startDate: string = '';
  endDate: string = '';

  // Chart data
  revenueChartLabels: string[] = [];
  revenueChartData: number[] = [];

  RevenueTimeFrame = RevenueTimeFrame;

  constructor(private analyticsService: AnalyticsService) {}

  ngOnInit(): void {
    this.initializeDates();
    this.loadAllData();
  }

  initializeDates(): void {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    this.startDate = monthStart.toISOString().split('T')[0];
    this.endDate = now.toISOString().split('T')[0];
  }

  loadAllData(): void {
    this.loading = true;
    this.error = null;

    // Load dashboard summary
    this.analyticsService.getDashboardSummary().subscribe({
      next: (data) => {
        this.dashboard = data;
        this.revenueChartLabels = data.revenueChart.labels;
        this.revenueChartData = data.revenueChart.data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Dashboard error details:', err);
        
        // Provide more specific error messages
        if (err.status === 401) {
          this.error = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
        } else if (err.status === 403) {
          this.error = 'Bạn không có quyền truy cập trang này.';
        } else if (err.status === 0) {
          this.error = 'Không thể kết nối tới máy chủ. Vui lòng kiểm tra backend đang chạy.';
        } else if (err.error?.message) {
          this.error = `Lỗi: ${err.error.message}`;
        } else {
          this.error = 'Không thể tải dữ liệu dashboard';
        }
        
        this.loading = false;
      }
    });

    // Load revenue report
    this.loadRevenueReport();

    // Load top services
    this.analyticsService.getTopServices(3, 10).subscribe({
      next: (data) => {
        this.topServices = data;
      },
      error: (err) => {
        console.error('Top services error:', err);
      }
    });

    // Load member tier statistics
    this.analyticsService.getMemberTierStatistics().subscribe({
      next: (data) => {
        this.memberTiers = data;
      },
      error: (err) => {
        console.error('Member tiers error:', err);
      }
    });
  }

  loadRevenueReport(): void {
    this.analyticsService.getRevenueReport({
      startDate: this.startDate,
      endDate: this.endDate,
      timeFrame: this.selectedTimeFrame
    }).subscribe({
      next: (data) => {
        this.revenueReport = data;
      },
      error: (err) => {
        console.error('Revenue report error:', err);
      }
    });
  }

  onTimeFrameChange(): void {
    this.loadRevenueReport();
  }

  onPeriodChange(): void {
    const now = new Date();
    switch (this.selectedPeriod) {
      case 'week':
        const weekAgo = new Date(now);
        weekAgo.setDate(weekAgo.getDate() - 7);
        this.startDate = weekAgo.toISOString().split('T')[0];
        this.selectedTimeFrame = RevenueTimeFrame.DAILY;
        break;
      case 'month':
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        this.startDate = monthStart.toISOString().split('T')[0];
        this.selectedTimeFrame = RevenueTimeFrame.DAILY;
        break;
      case 'year':
        const yearStart = new Date(now.getFullYear(), 0, 1);
        this.startDate = yearStart.toISOString().split('T')[0];
        this.selectedTimeFrame = RevenueTimeFrame.MONTHLY;
        break;
    }
    this.endDate = now.toISOString().split('T')[0];
    this.loadRevenueReport();
  }

  formatCurrency(amount: number): string {
    return this.analyticsService.formatCurrency(amount);
  }

  formatNumber(num: number): string {
    return this.analyticsService.formatNumber(num);
  }

  formatPercentage(value: number): string {
    return this.analyticsService.formatPercentage(value);
  }

  getChangeClass(value: number): string {
    return value >= 0 ? 'positive' : 'negative';
  }

  getChartHeight(value: number, max: number): number {
    return max > 0 ? (value / max) * 100 : 0;
  }

  getMaxRevenue(): number {
    return Math.max(...this.revenueChartData, 0);
  }

  getTierColor(index: number): string {
    const colors = ['#4CAF50', '#2196F3', '#FF9800', '#9C27B0', '#F44336'];
    return colors[index % colors.length];
  }
}
