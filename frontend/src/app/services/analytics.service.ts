import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export enum RevenueTimeFrame {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
}

export interface RevenueReportParams {
  startDate?: string;
  endDate?: string;
  timeFrame?: RevenueTimeFrame;
  maChiNhanh?: string;
}

export interface RevenueReportResponse {
  totalRevenue: number;
  productRevenue: number;
  serviceRevenue: number;
  revenueByPeriod: {
    period: string;
    revenue: number;
    productRevenue: number;
    serviceRevenue: number;
  }[];
  revenueByBranch?: {
    maChiNhanh: string;
    tenChiNhanh: string;
    revenue: number;
  }[];
  comparison?: {
    previousPeriod: number;
    changePercentage: number;
  };
}

export interface TopServiceResponse {
  maDichVu: string;
  tenDichVu: string;
  soLanSuDung: number;
  tongDoanhThu: number;
  trungBinhGia: number;
}

export interface MemberTierStatistics {
  totalMembers: number;
  tierDistribution: {
    maHang: string;
    tenHang: string;
    soLuongThanhVien: number;
    tyLe: number;
    tongChiTieu: number;
    trungBinhChiTieu: number;
  }[];
  recentUpgrades: {
    maKhachHang: number;
    tenKhachHang: string;
    hangCu: string;
    hangMoi: string;
    ngayNangHang: Date;
  }[];
  tierRevenue: {
    maHang: string;
    tenHang: string;
    doanhThu: number;
  }[];
}

export interface DashboardSummary {
  revenue: {
    today: number;
    thisWeek: number;
    thisMonth: number;
    thisYear: number;
  };
  customers: {
    total: number;
    new: number;
    active: number;
    members: number;
  };
  appointments: {
    today: number;
    thisWeek: number;
    pending: number;
    completed: number;
  };
  employees: {
    total: number;
    active: number;
    byType: {
      loaiNhanVien: string;
      soLuong: number;
    }[];
  };
  topProducts: {
    maSanPham: string;
    tenSanPham: string;
    soLuongBan: number;
    doanhThu: number;
  }[];
  topServices: TopServiceResponse[];
  revenueChart: {
    labels: string[];
    data: number[];
  };
}

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private apiUrl = `${environment.apiUrl}/admin/analytics`;

  constructor(private http: HttpClient) {}

  /**
   * FQ-02: Get Revenue Report
   */
  getRevenueReport(params: RevenueReportParams = {}): Observable<RevenueReportResponse> {
    let httpParams = new HttpParams();
    
    if (params.startDate) {
      httpParams = httpParams.set('startDate', params.startDate);
    }
    if (params.endDate) {
      httpParams = httpParams.set('endDate', params.endDate);
    }
    if (params.timeFrame) {
      httpParams = httpParams.set('timeFrame', params.timeFrame);
    }
    if (params.maChiNhanh) {
      httpParams = httpParams.set('maChiNhanh', params.maChiNhanh);
    }

    return this.http.get<RevenueReportResponse>(`${this.apiUrl}/revenue`, { params: httpParams });
  }

  /**
   * FQ-03: Get Top Services
   */
  getTopServices(months: number = 3, limit: number = 10): Observable<TopServiceResponse[]> {
    const params = new HttpParams()
      .set('months', months.toString())
      .set('limit', limit.toString());

    return this.http.get<TopServiceResponse[]>(`${this.apiUrl}/top-services`, { params });
  }

  /**
   * FQ-04: Get Member Tier Statistics
   */
  getMemberTierStatistics(): Observable<MemberTierStatistics> {
    return this.http.get<MemberTierStatistics>(`${this.apiUrl}/member-tiers`);
  }

  /**
   * Get Dashboard Summary
   */
  getDashboardSummary(): Observable<DashboardSummary> {
    console.log('Calling analytics API:', `${this.apiUrl}/dashboard`);
    return this.http.get<DashboardSummary>(`${this.apiUrl}/dashboard`);
  }

  /**
   * Format currency for display
   */
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  }

  /**
   * Format number for display
   */
  formatNumber(num: number): string {
    return new Intl.NumberFormat('vi-VN').format(num);
  }

  /**
   * Format percentage
   */
  formatPercentage(value: number): string {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  }
}
