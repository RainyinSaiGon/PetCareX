import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

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
  startDate = '';
  endDate = '';

  dateRangeForm!: FormGroup;
  private apiUrl = environment.apiUrl;

  constructor(
    private formBuilder: FormBuilder,
    private http: HttpClient,
  ) {
    this.dateRangeForm = this.formBuilder.group({
      startDate: [''],
      endDate: [''],
    });
  }

  ngOnInit() {
    this.loadBranches();
    this.loadData();
  }

  loadBranches(): void {
    this.http.get<any>(`${this.apiUrl}/branch/inventory/branches`).subscribe({
      next: (response) => {
        this.branches = response.data || response;
      },
      error: (err) => console.error('Error loading branches:', err)
    });
  }

  loadData() {
    this.loading = true;

    // Build query params
    let params: any = {};
    if (this.startDate) params.startDate = this.startDate;
    if (this.endDate) params.endDate = this.endDate;

    // Call admin analytics API for revenue report
    this.http.get<any>(`${this.apiUrl}/admin/analytics/revenue`, { params }).subscribe({
      next: (response) => {
        // Map the revenueByBranch data to the format we need
        if (response.revenueByBranch) {
          let reports = response.revenueByBranch.map((b: any) => ({
            MaChiNhanh: b.maChiNhanh?.trim(),
            TenChiNhanh: b.tenChiNhanh,
            TotalRevenue: b.revenue || 0,
            TransactionCount: Math.round(b.revenue / 200000) || 0, // Estimate based on avg transaction
            AverageTransactionValue: b.revenue > 0 ? 200000 : 0
          }));

          // Filter by selected branch if one is selected
          if (this.selectedBranch) {
            reports = reports.filter((r: any) => r.MaChiNhanh === this.selectedBranch?.trim());
          }

          this.revenueReports = reports;
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading revenue data:', err);
        this.loading = false;
      }
    });

    // Load top services with same filters
    let serviceParams: any = {};
    if (this.startDate) serviceParams.startDate = this.startDate;
    if (this.endDate) serviceParams.endDate = this.endDate;
    if (this.selectedBranch) serviceParams.maChiNhanh = this.selectedBranch;

    this.http.get<any>(`${this.apiUrl}/admin/analytics/top-services`, { params: serviceParams }).subscribe({
      next: (response) => {
        this.topServices = (response || []).map((s: any) => ({
          TenDichVu: s.tenDichVu,
          TotalRevenue: s.tongDoanhThu,
          SoLanSuDung: s.soLanSuDung
        }));
      },
      error: (err) => console.error('Error loading top services:', err)
    });
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
    if (this.totalTransactions === 0) return 0;
    return this.totalRevenue / this.totalTransactions;
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

