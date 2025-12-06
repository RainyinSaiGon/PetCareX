import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { SanPham, CreateSanPhamDto, UpdateSanPhamDto, Loai } from '../models/san-pham.model';

@Injectable({
  providedIn: 'root',
})
export class SanPhamService {
  private endpoint = 'san-pham';

  constructor(private api: ApiService) {}

  // Product CRUD
  getAll(): Observable<SanPham[]> {
    return this.api.get<SanPham[]>(this.endpoint);
  }

  getSanPhams(params?: Record<string, unknown>): Observable<{ data: SanPham[]; total: number; totalPages: number }> {
    return this.api.get<{ data: SanPham[]; total: number; totalPages: number }>(this.endpoint, params);
  }

  getById(maSanPham: string): Observable<SanPham> {
    return this.api.get<SanPham>(`${this.endpoint}/${maSanPham}`);
  }

  create(dto: CreateSanPhamDto): Observable<SanPham> {
    return this.api.post<SanPham>(this.endpoint, dto);
  }

  createSanPham(dto: CreateSanPhamDto): Observable<SanPham> {
    return this.api.post<SanPham>(this.endpoint, dto);
  }

  update(maSanPham: string, dto: UpdateSanPhamDto): Observable<SanPham> {
    return this.api.patch<SanPham>(`${this.endpoint}/${maSanPham}`, dto);
  }

  updateSanPham(maSanPham: string, dto: UpdateSanPhamDto): Observable<SanPham> {
    return this.api.patch<SanPham>(`${this.endpoint}/${maSanPham}`, dto);
  }

  delete(maSanPham: string): Observable<void> {
    return this.api.delete<void>(`${this.endpoint}/${maSanPham}`);
  }

  deleteSanPham(maSanPham: string): Observable<void> {
    return this.api.delete<void>(`${this.endpoint}/${maSanPham}`);
  }

  // Filter by type
  getByLoai(loaiSanPham: string): Observable<SanPham[]> {
    return this.api.get<SanPham[]>(`${this.endpoint}/loai/${loaiSanPham}`);
  }

  // Get all product categories
  getLoais(): Observable<Loai[]> {
    return this.api.get<Loai[]>(`${this.endpoint}/loai`);
  }

  // Search by name
  search(keyword: string): Observable<SanPham[]> {
    return this.api.get<SanPham[]>(`${this.endpoint}/search/${keyword}`);
  }
}
