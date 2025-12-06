import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import {
  NhanVien,
  LoaiNhanVien,
  LichLamViecBacSi,
  CreateNhanVienDto,
  UpdateNhanVienDto,
} from '../models/nhan-vien.model';

@Injectable({
  providedIn: 'root',
})
export class NhanVienService {
  private endpoint = 'nhan-vien';

  constructor(private api: ApiService) {}

  // Staff CRUD
  getAll(): Observable<NhanVien[]> {
    return this.api.get<NhanVien[]>(this.endpoint);
  }

  getNhanViens(params?: Record<string, unknown>): Observable<{ data: NhanVien[]; total: number; totalPages: number }> {
    return this.api.get<{ data: NhanVien[]; total: number; totalPages: number }>(this.endpoint, params);
  }

  getById(maNhanVien: string): Observable<NhanVien> {
    return this.api.get<NhanVien>(`${this.endpoint}/${maNhanVien}`);
  }

  create(dto: CreateNhanVienDto): Observable<NhanVien> {
    return this.api.post<NhanVien>(this.endpoint, dto);
  }

  createNhanVien(dto: CreateNhanVienDto): Observable<NhanVien> {
    return this.api.post<NhanVien>(this.endpoint, dto);
  }

  update(maNhanVien: string, dto: UpdateNhanVienDto): Observable<NhanVien> {
    return this.api.patch<NhanVien>(`${this.endpoint}/${maNhanVien}`, dto);
  }

  updateNhanVien(maNhanVien: string, dto: UpdateNhanVienDto): Observable<NhanVien> {
    return this.api.patch<NhanVien>(`${this.endpoint}/${maNhanVien}`, dto);
  }

  delete(maNhanVien: string): Observable<void> {
    return this.api.delete<void>(`${this.endpoint}/${maNhanVien}`);
  }

  deleteNhanVien(maNhanVien: string): Observable<void> {
    return this.api.delete<void>(`${this.endpoint}/${maNhanVien}`);
  }

  // Search
  search(keyword: string): Observable<NhanVien[]> {
    return this.api.get<NhanVien[]>(`${this.endpoint}/search/${keyword}`);
  }

  // Get by branch
  getByChiNhanh(maChiNhanh: string): Observable<NhanVien[]> {
    return this.api.get<NhanVien[]>(`${this.endpoint}/chi-nhanh/${maChiNhanh}`);
  }

  // Staff types
  getAllLoaiNhanVien(): Observable<LoaiNhanVien[]> {
    return this.api.get<LoaiNhanVien[]>(`${this.endpoint}/loai`);
  }

  getLoaiNhanViens(): Observable<LoaiNhanVien[]> {
    return this.api.get<LoaiNhanVien[]>(`${this.endpoint}/loai`);
  }

  // Doctors
  getAllBacSi(): Observable<NhanVien[]> {
    return this.api.get<NhanVien[]>(`${this.endpoint}/bac-si`);
  }

  // Doctor schedules
  getLichLamViec(maBacSi: string): Observable<LichLamViecBacSi[]> {
    return this.api.get<LichLamViecBacSi[]>(`${this.endpoint}/${maBacSi}/lich-lam-viec`);
  }

  getLichLamViecByDate(date: string): Observable<LichLamViecBacSi[]> {
    return this.api.get<LichLamViecBacSi[]>(`${this.endpoint}/lich-lam-viec/ngay/${date}`);
  }

  getAvailableBacSi(date: string): Observable<LichLamViecBacSi[]> {
    return this.api.get<LichLamViecBacSi[]>(`${this.endpoint}/lich-lam-viec/available/${date}`);
  }
}
