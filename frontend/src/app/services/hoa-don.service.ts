import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import {
  HoaDon,
  CreateHoaDonDto,
  DanhGiaMuaHang,
} from '../models/hoa-don.model';

@Injectable({
  providedIn: 'root',
})
export class HoaDonService {
  private endpoint = 'hoa-don';

  constructor(private api: ApiService) {}

  // Invoice CRUD
  getAll(): Observable<HoaDon[]> {
    return this.api.get<HoaDon[]>(this.endpoint);
  }

  getById(maHoaDon: number): Observable<HoaDon> {
    return this.api.get<HoaDon>(`${this.endpoint}/${maHoaDon}`);
  }

  create(dto: CreateHoaDonDto): Observable<HoaDon> {
    return this.api.post<HoaDon>(this.endpoint, dto);
  }

  // Get invoice with details
  getWithDetails(maHoaDon: number): Observable<HoaDon> {
    return this.api.get<HoaDon>(`${this.endpoint}/${maHoaDon}/chi-tiet`);
  }

  // Filter by customer
  getByKhachHang(maKhachHang: number): Observable<HoaDon[]> {
    return this.api.get<HoaDon[]>(`${this.endpoint}/khach-hang/${maKhachHang}`);
  }

  // Filter by date range
  getByDateRange(startDate: string, endDate: string): Observable<HoaDon[]> {
    return this.api.get<HoaDon[]>(
      `${this.endpoint}/ngay?startDate=${startDate}&endDate=${endDate}`
    );
  }

  // Add product to invoice
  addSanPham(maHoaDon: number, data: { maSanPham: string; soLuong: number; donGia: number }): Observable<any> {
    return this.api.post(`${this.endpoint}/${maHoaDon}/san-pham`, data);
  }

  // Add service to invoice
  addDichVuYTe(maHoaDon: number, data: { maDichVuYTe: string; soLuong: number; donGia: number }): Observable<any> {
    return this.api.post(`${this.endpoint}/${maHoaDon}/dich-vu-y-te`, data);
  }

  // Product reviews
  createDanhGiaMuaHang(data: Partial<DanhGiaMuaHang>): Observable<DanhGiaMuaHang> {
    return this.api.post<DanhGiaMuaHang>(`${this.endpoint}/danh-gia-mua-hang`, data);
  }

  getDanhGiaMuaHang(maHoaDon: number): Observable<DanhGiaMuaHang> {
    return this.api.get<DanhGiaMuaHang>(`${this.endpoint}/${maHoaDon}/danh-gia-mua-hang`);
  }

  getAllDanhGiaMuaHang(): Observable<DanhGiaMuaHang[]> {
    return this.api.get<DanhGiaMuaHang[]>(`${this.endpoint}/danh-gia-mua-hang`);
  }

  // Calculate totals
  calculateTotal(maHoaDon: number): Observable<{ tongTien: number; giamGia: number; thanhToan: number }> {
    return this.api.get(`${this.endpoint}/${maHoaDon}/tinh-tong`);
  }
}
