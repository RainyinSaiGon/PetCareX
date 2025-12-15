import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormsModule } from '@angular/forms';

@Component({
  selector: 'app-revenue-report',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './revenue-report.component.html',
  styleUrls: ['./revenue-report.component.css'],
})
export class RevenueReportComponent implements OnInit {
  activeTab: 'overview' | 'details' | 'monthly' | 'services' = 'overview';

  revenueReports: any[] = [];
  topServices: any[] = [];
  topProducts: any[] = [];
  branches: any[] = [];

  loading = false;
  page = 1;
  limit = 10;
  total = 0;

  selectedBranch = '';
  selectedYear = new Date().getFullYear();
  startDate = new Date(new Date().getFullYear(), 0, 1);
  endDate = new Date();

  dateRangeForm!: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
  ) {
    this.dateRangeForm = this.formBuilder.group({
      startDate: [this.startDate],
      endDate: [this.endDate],
    });
  }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading = true;
    // Mock data for demo
    this.revenueReports = [
      { TenChiNhanh: 'Chi nhánh 1', TotalRevenue: 100000000, TransactionCount: 50, AverageTransactionValue: 2000000 },
      { TenChiNhanh: 'Chi nhánh 2', TotalRevenue: 80000000, TransactionCount: 40, AverageTransactionValue: 2000000 },
    ];
    this.topServices = [
      { TenDichVu: 'Dịch vụ 1', TotalRevenue: 50000000 },
      { TenDichVu: 'Dịch vụ 2', TotalRevenue: 30000000 },
    ];
    this.loading = false;
  }

  switchTab(tab: 'overview' | 'details' | 'monthly' | 'services') {
    this.activeTab = tab;
  }

  onBranchChange() {
    this.loadData();
  }

  onSearchDateRange() {
    this.loadData();
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  }

  onPageChange(newPage: number) {
    this.page = newPage;
    this.loadData();
  }

  get totalPages(): number {
    return Math.ceil(this.total / this.limit);
  }

  // Getter properties for template calculations
  get totalRevenue(): number {
    return this.revenueReports.reduce((sum, r) => sum + (r.TotalRevenue || 0), 0);
  }

  get totalTransactions(): number {
    return this.revenueReports.reduce((sum, r) => sum + (r.TransactionCount || 0), 0);
  }

  get totalBranches(): number {
    return this.revenueReports.length;
  }

  get averageTransaction(): number {
    if (this.revenueReports.length === 0) return 0;
    return this.revenueReports.reduce((sum, r) => sum + (r.AverageTransactionValue || 0), 0) / this.revenueReports.length;
  }

  // Helper method to calculate percentage for a branch
  getRevenuePercentage(branchRevenue: number): number {
    if (this.totalRevenue === 0) return 0;
    return (branchRevenue / this.totalRevenue * 100);
  }

  // Get maximum revenue for progress bar calculation
  getMaxRevenue(): number {
    if (this.revenueReports.length === 0) return 1;
    return Math.max(...this.revenueReports.map(r => r.TotalRevenue || 0));
  }
}
