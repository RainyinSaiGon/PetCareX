import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import {
  ChiNhanh,
  Kho,
  KhoSanPham,
  KhoVaccine,
  DoanhThuReport,
  DashboardSummary,
} from '../models/chi-nhanh.model';

@Injectable({
  providedIn: 'root',
})
export class ChiNhanhService {
  private endpoint = 'chi-nhanh';

  constructor(private api: ApiService) {}

  // Branch CRUD
  getAll(): Observable<ChiNhanh[]> {
    return this.api.get<ChiNhanh[]>(this.endpoint);
  }

  getById(maChiNhanh: string): Observable<ChiNhanh> {
    return this.api.get<ChiNhanh>(`${this.endpoint}/${maChiNhanh}`);
  }

  create(data: Partial<ChiNhanh>): Observable<ChiNhanh> {
    return this.api.post<ChiNhanh>(this.endpoint, data);
  }

  update(maChiNhanh: string, data: Partial<ChiNhanh>): Observable<ChiNhanh> {
    return this.api.patch<ChiNhanh>(`${this.endpoint}/${maChiNhanh}`, data);
  }

  delete(maChiNhanh: string): Observable<void> {
    return this.api.delete<void>(`${this.endpoint}/${maChiNhanh}`);
  }

  // Dashboard summary
  getDashboardSummary(maChiNhanh: string): Observable<DashboardSummary> {
    return this.api.get<DashboardSummary>(`${this.endpoint}/${maChiNhanh}/dashboard`);
  }

  // Revenue reports
  getDoanhThu(maChiNhanh: string, startDate: string, endDate: string): Observable<DoanhThuReport[]> {
    return this.api.get<DoanhThuReport[]>(
      `${this.endpoint}/${maChiNhanh}/doanh-thu?startDate=${startDate}&endDate=${endDate}`
    );
  }

  getDoanhThuToanHeThong(startDate: string, endDate: string): Observable<any[]> {
    return this.api.get<any[]>(
      `${this.endpoint}/doanh-thu/tong?startDate=${startDate}&endDate=${endDate}`
    );
  }

  // Service statistics
  getDichVuThongKe(startDate: string, endDate: string): Observable<any[]> {
    return this.api.get<any[]>(
      `${this.endpoint}/thong-ke/dich-vu?startDate=${startDate}&endDate=${endDate}`
    );
  }

  getDichVuYTeThongKe(maChiNhanh: string, startDate: string, endDate: string): Observable<any[]> {
    return this.api.get<any[]>(
      `${this.endpoint}/${maChiNhanh}/thong-ke/y-te?startDate=${startDate}&endDate=${endDate}`
    );
  }

  getMuaHangThongKe(maChiNhanh: string, startDate: string, endDate: string): Observable<any[]> {
    return this.api.get<any[]>(
      `${this.endpoint}/${maChiNhanh}/thong-ke/mua-hang?startDate=${startDate}&endDate=${endDate}`
    );
  }

  // Inventory management
  getKhoSanPham(maChiNhanh: string): Observable<KhoSanPham[]> {
    return this.api.get<KhoSanPham[]>(`${this.endpoint}/${maChiNhanh}/kho-san-pham`);
  }

  getKhoVaccine(maKho: string): Observable<KhoVaccine[]> {
    return this.api.get<KhoVaccine[]>(`${this.endpoint}/kho/${maKho}/vaccine`);
  }

  getSanPhamSapHetHang(maChiNhanh: string, threshold: number = 10): Observable<KhoSanPham[]> {
    return this.api.get<KhoSanPham[]>(
      `${this.endpoint}/${maChiNhanh}/kho-san-pham/sap-het-hang?threshold=${threshold}`
    );
  }

  getSanPhamSapHetHan(maChiNhanh: string, days: number = 30): Observable<KhoSanPham[]> {
    return this.api.get<KhoSanPham[]>(
      `${this.endpoint}/${maChiNhanh}/kho-san-pham/sap-het-han?days=${days}`
    );
  }

  // All warehouses
  getAllKho(): Observable<Kho[]> {
    return this.api.get<Kho[]>(`${this.endpoint}/kho`);
  }

  // Branch staff
  getNhanVien(maChiNhanh: string): Observable<any[]> {
    return this.api.get<any[]>(`${this.endpoint}/${maChiNhanh}/nhan-vien`);
  }
}
