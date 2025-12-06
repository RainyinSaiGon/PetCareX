import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { LichHen, CreateLichHenDto, UpdateLichHenDto } from '../models/lich-hen.model';

@Injectable({
  providedIn: 'root',
})
export class LichHenService {
  private endpoint = 'lich-hen';

  constructor(private api: ApiService) {}

  // Appointment CRUD
  getAll(): Observable<LichHen[]> {
    return this.api.get<LichHen[]>(this.endpoint);
  }

  getById(maLichHen: string): Observable<LichHen> {
    return this.api.get<LichHen>(`${this.endpoint}/${maLichHen}`);
  }

  create(dto: CreateLichHenDto): Observable<LichHen> {
    return this.api.post<LichHen>(this.endpoint, dto);
  }

  update(maLichHen: string, dto: UpdateLichHenDto): Observable<LichHen> {
    return this.api.patch<LichHen>(`${this.endpoint}/${maLichHen}`, dto);
  }

  delete(maLichHen: string): Observable<void> {
    return this.api.delete<void>(`${this.endpoint}/${maLichHen}`);
  }

  // Filter by status
  getByTrangThai(trangThai: string): Observable<LichHen[]> {
    return this.api.get<LichHen[]>(`${this.endpoint}/trang-thai/${trangThai}`);
  }

  // Filter by date
  getByDate(date: string): Observable<LichHen[]> {
    return this.api.get<LichHen[]>(`${this.endpoint}/ngay/${date}`);
  }

  // Filter by customer
  getByKhachHang(maKhachHang: number): Observable<LichHen[]> {
    return this.api.get<LichHen[]>(`${this.endpoint}/khach-hang/${maKhachHang}`);
  }

  // Filter by doctor
  getByBacSi(maBacSi: string): Observable<LichHen[]> {
    return this.api.get<LichHen[]>(`${this.endpoint}/bac-si/${maBacSi}`);
  }

  // Filter by branch
  getByChiNhanh(maChiNhanh: string): Observable<LichHen[]> {
    return this.api.get<LichHen[]>(`${this.endpoint}/chi-nhanh/${maChiNhanh}`);
  }

  // Confirm appointment
  confirm(maLichHen: string): Observable<LichHen> {
    return this.api.patch<LichHen>(`${this.endpoint}/${maLichHen}`, { trangThai: 'Đã xác nhận' });
  }

  // Complete appointment
  complete(maLichHen: string): Observable<LichHen> {
    return this.api.patch<LichHen>(`${this.endpoint}/${maLichHen}`, { trangThai: 'Hoàn thành' });
  }

  // Cancel appointment
  cancel(maLichHen: string): Observable<LichHen> {
    return this.api.patch<LichHen>(`${this.endpoint}/${maLichHen}`, { trangThai: 'Đã hủy' });
  }
}
