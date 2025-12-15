import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BranchService } from '../../services/branch.service';

@Component({
  selector: 'app-branch-revenue-report',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './branch-revenue-report.component.html',
  styleUrls: ['./branch-revenue-report.component.css'],
})
export class BranchRevenueReportComponent implements OnInit {
  revenueReports: any[] = [];
  monthlyChartData: any[] = [];
  topProducts: any[] = [];
  systemRevenue: any = null;
  loading = true;
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;
  totalPages = 0;

  selectedBranch = '';
  selectedYear = new Date().getFullYear();
  startDate = '';
  endDate = '';

  branches: any[] = [];

  constructor(private branchService: BranchService) {}

  ngOnInit(): void {
    this.loadInitialData();
  }

  loadInitialData(): void {
    this.loading = true;

    // Load revenue reports
    this.branchService.getBranchRevenueReport(this.selectedBranch, this.currentPage, this.itemsPerPage).subscribe({
      next: (response) => {
        this.revenueReports = response.data || [];
        this.totalItems = response.total || 0;
        this.totalPages = response.totalPages || 1;
      },
      error: (err) => console.error('Failed to load revenue reports:', err),
    });

    // Load monthly chart data
    this.branchService.getMonthlyRevenueChart(this.selectedYear, this.selectedBranch).subscribe({
      next: (data) => {
        this.monthlyChartData = data;
      },
      error: (err) => console.error('Failed to load monthly data:', err),
    });

    // Load top products
    this.branchService.getTopProducts(this.selectedBranch, 10).subscribe({
      next: (data) => {
        this.topProducts = data || [];
      },
      error: (err) => console.error('Failed to load top products:', err),
    });

    // Load system revenue
    this.branchService.getTotalSystemRevenue().subscribe({
      next: (data) => {
        this.systemRevenue = data;
        this.loading = false;
      },
      error: (err) => console.error('Failed to load system revenue:', err),
    });
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.loadInitialData();
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);
  }

  getMonthName(month: number): string {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];
    return months[month - 1] || '';
  }

  onPageChange(page: number): void {
    if (page > 0 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadInitialData();
    }
  }
}
