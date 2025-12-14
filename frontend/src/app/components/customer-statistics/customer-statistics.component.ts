import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomerStatisticsService } from '../../services/customer-statistics.service';
import { CustomerService } from '../../services/customer.service';
import { CustomerStatistics, InactiveCustomer } from '../../models/customer.model';

@Component({
  selector: 'app-customer-statistics',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './customer-statistics.component.html',
  styleUrls: ['./customer-statistics.component.css']
})
export class CustomerStatisticsComponent implements OnInit, AfterViewInit {
  @ViewChild('tierChart') tierChartCanvas?: ElementRef<HTMLCanvasElement>;
  @ViewChild('spendingChart') spendingChartCanvas?: ElementRef<HTMLCanvasElement>;

  statistics?: CustomerStatistics;
  inactiveCustomers: InactiveCustomer[] = [];
  loading = false;
  error = '';

  constructor(
    private statsService: CustomerStatisticsService,
    private customerService: CustomerService
  ) {}

  ngOnInit(): void {
    this.loadStatistics();
  }

  ngAfterViewInit(): void {
    if (this.statistics) {
      this.drawCharts();
    }
  }

  loadStatistics(): void {
    this.loading = true;
    this.error = '';

    this.statsService.getStatistics().subscribe({
      next: (stats) => {
        this.statistics = stats;
        setTimeout(() => this.drawCharts(), 0);
      },
      error: (err) => {
        this.error = 'Không thể tải thống kê. Vui lòng thử lại.';
        console.error('Error loading statistics:', err);
      }
    });

    this.statsService.getInactiveCustomers(30).subscribe({
      next: (customers) => {
        this.inactiveCustomers = customers;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading inactive customers:', err);
        this.loading = false;
      }
    });
  }

  drawCharts(): void {
    // Since we don't have Chart.js, we'll show data in tables instead
    // In a real application, you would use ng2-charts or chart.js library
  }

  getTierItems(): Array<{ tier: string; count: number }> {
    if (!this.statistics?.tierDistribution) return [];
    return Object.entries(this.statistics.tierDistribution).map(([tier, count]) => ({
      tier,
      count: count as number
    }));
  }

  getTierColor(tier: string): string {
    const colors: { [key: string]: string } = {
      'Bronze': '#cd7f32',
      'Silver': '#c0c0c0',
      'Gold': '#ffd700',
      'Platinum': '#e5e4e2'
    };
    return colors[tier] || '#999';
  }

  exportData(): void {
    this.customerService.exportCustomersToCSV().subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `customers_${new Date().getTime()}.csv`;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        this.error = 'Không thể xuất dữ liệu. Vui lòng thử lại.';
        console.error('Error exporting data:', err);
      }
    });
  }
}
