import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface RevenueReport {
  MaChiNhanh: string;
  TenChiNhanh: string;
  TotalRevenue: number;
  TransactionCount: number;
  AverageTransactionValue: number;
  TopProductsCount: number;
  TopServicesCount: number;
  ReportDate: Date;
}

export interface RevenueDetail {
  MaHoaDon: string;
  KhachHang: string;
  NhanVien: string;
  TongTien: number;
  NgayLap: Date;
  MoTa?: string;
}

export interface MonthlyRevenue {
  month: string;
  revenue: number;
}

export interface ServiceRevenue {
  TenDichVu: string;
  TotalRevenue: number;
  TransactionCount: number;
}

export interface ProductRevenue {
  TenSanPham: string;
  TotalRevenue: number;
  QuantitySold: number;
}

export interface RevenueReportResponse {
  data: RevenueReport[];
  total: number;
  page: number;
  totalPages: number;
}

export interface RevenueDetailResponse {
  data: RevenueDetail[];
  total: number;
  page: number;
  totalPages: number;
  totalRevenue: number;
}

export interface SystemRevenue {
  branches: RevenueReport[];
  topBranch: RevenueReport;
  totalSystemRevenue: number;
}

@Injectable({
  providedIn: 'root',
})
export class RevenueService {
  private apiUrl = `${environment.apiUrl}/branch/revenue`;

  constructor(private http: HttpClient) {}

  getBranchRevenueReport(
    branchId?: string,
    page: number = 1,
    limit: number = 10,
  ): Observable<RevenueReportResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (branchId) {
      params = params.set('branchId', branchId);
    }

    return this.http.get<RevenueReportResponse>(`${this.apiUrl}/report`, { params });
  }

  getRevenueDetailsByDateRange(
    startDate: Date,
    endDate: Date,
    branchId?: string,
    page: number = 1,
    limit: number = 10,
  ): Observable<RevenueDetailResponse> {
    const body: any = {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    };

    if (branchId) {
      body.branchId = branchId;
    }

    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.post<RevenueDetailResponse>(`${this.apiUrl}/details`, body, { params });
  }

  getMonthlyRevenueChart(year: number, branchId?: string): Observable<MonthlyRevenue[]> {
    let params = new HttpParams().set('year', year.toString());

    if (branchId) {
      params = params.set('branchId', branchId);
    }

    return this.http.get<MonthlyRevenue[]>(`${this.apiUrl}/monthly-chart`, { params });
  }

  getTopServicesByRevenue(branchId?: string, limit: number = 10): Observable<ServiceRevenue[]> {
    let params = new HttpParams().set('limit', limit.toString());

    if (branchId) {
      params = params.set('branchId', branchId);
    }

    return this.http.get<ServiceRevenue[]>(`${this.apiUrl}/top-services`, { params });
  }

  getTopProductsByRevenue(branchId?: string, limit: number = 10): Observable<ProductRevenue[]> {
    let params = new HttpParams().set('limit', limit.toString());

    if (branchId) {
      params = params.set('branchId', branchId);
    }

    return this.http.get<ProductRevenue[]>(`${this.apiUrl}/top-products`, { params });
  }

  getTotalSystemRevenue(startDate?: Date, endDate?: Date): Observable<SystemRevenue> {
    let params = new HttpParams();

    if (startDate) {
      params = params.set('startDate', startDate.toISOString());
    }

    if (endDate) {
      params = params.set('endDate', endDate.toISOString());
    }

    return this.http.get<SystemRevenue>(`${this.apiUrl}/total-system`, { params });
  }
}
