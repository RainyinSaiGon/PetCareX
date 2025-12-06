import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import {
  KhachHang,
  KhachHangThanhVien,
  HangThanhVien,
  CreateKhachHangDto,
  UpdateKhachHangDto,
} from '../models/khach-hang.model';
import { ThuCung, CreateThuCungDto, UpdateThuCungDto } from '../models/thu-cung.model';

@Injectable({
  providedIn: 'root',
})
export class KhachHangService {
  private endpoint = 'khach-hang';

  constructor(private api: ApiService) {}

  // Customer CRUD
  getAll(): Observable<KhachHang[]> {
    return this.api.get<KhachHang[]>(this.endpoint);
  }

  getById(maKhachHang: number): Observable<KhachHang> {
    return this.api.get<KhachHang>(`${this.endpoint}/${maKhachHang}`);
  }

  create(dto: CreateKhachHangDto): Observable<KhachHang> {
    return this.api.post<KhachHang>(this.endpoint, dto);
  }

  update(maKhachHang: number, dto: UpdateKhachHangDto): Observable<KhachHang> {
    return this.api.patch<KhachHang>(`${this.endpoint}/${maKhachHang}`, dto);
  }

  delete(maKhachHang: number): Observable<void> {
    return this.api.delete<void>(`${this.endpoint}/${maKhachHang}`);
  }

  // Search by phone
  searchByPhone(soDienThoai: string): Observable<KhachHang[]> {
    return this.api.get<KhachHang[]>(`${this.endpoint}/search/phone/${soDienThoai}`);
  }

  // Customer pets
  getPets(maKhachHang: number): Observable<ThuCung[]> {
    return this.api.get<ThuCung[]>(`${this.endpoint}/${maKhachHang}/thu-cung`);
  }

  addPet(maKhachHang: number, dto: CreateThuCungDto): Observable<ThuCung> {
    return this.api.post<ThuCung>(`${this.endpoint}/${maKhachHang}/thu-cung`, dto);
  }

  updatePet(maKhachHang: number, maThuCung: number, dto: UpdateThuCungDto): Observable<ThuCung> {
    return this.api.patch<ThuCung>(`${this.endpoint}/${maKhachHang}/thu-cung/${maThuCung}`, dto);
  }

  // Membership
  getThanhVien(): Observable<KhachHangThanhVien[]> {
    return this.api.get<KhachHangThanhVien[]>(`${this.endpoint}/thanh-vien`);
  }

  registerThanhVien(maKhachHang: number): Observable<KhachHangThanhVien> {
    return this.api.post<KhachHangThanhVien>(`${this.endpoint}/${maKhachHang}/thanh-vien`, {});
  }

  // Membership tiers
  getAllHangThanhVien(): Observable<HangThanhVien[]> {
    return this.api.get<HangThanhVien[]>(`${this.endpoint}/hang-thanh-vien`);
  }

  // Purchase history
  getLichSuMuaHang(maKhachHang: number): Observable<any[]> {
    return this.api.get<any[]>(`${this.endpoint}/${maKhachHang}/lich-su-mua-hang`);
  }

  // Service history
  getLichSuDichVu(maKhachHang: number): Observable<any[]> {
    return this.api.get<any[]>(`${this.endpoint}/${maKhachHang}/lich-su-dich-vu`);
  }
}
