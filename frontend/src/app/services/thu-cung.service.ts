import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ThuCung, CreateThuCungDto } from '../models/thu-cung.model';

@Injectable({
  providedIn: 'root'
})
export class ThuCungService {
  private endpoint = 'thu-cung';

  constructor(private api: ApiService) {}

  // Get all pets
  getAll(): Observable<ThuCung[]> {
    return this.api.get<ThuCung[]>(this.endpoint);
  }

  // Get paginated pets
  getPaginated(params?: Record<string, unknown>): Observable<{ data: ThuCung[]; total: number }> {
    return this.api.get<{ data: ThuCung[]; total: number }>(this.endpoint, params);
  }

  // Get pet by ID
  getById(maThuCung: number): Observable<ThuCung> {
    return this.api.get<ThuCung>(`${this.endpoint}/${maThuCung}`);
  }

  // Get pets by customer
  getByKhachHang(maKhachHang: number): Observable<ThuCung[]> {
    return this.api.get<ThuCung[]>(`${this.endpoint}/khach-hang/${maKhachHang}`);
  }

  // Create new pet
  create(dto: CreateThuCungDto): Observable<ThuCung> {
    return this.api.post<ThuCung>(this.endpoint, dto);
  }

  // Update pet
  update(maThuCung: number, dto: Partial<CreateThuCungDto>): Observable<ThuCung> {
    return this.api.patch<ThuCung>(`${this.endpoint}/${maThuCung}`, dto);
  }

  // Delete pet
  delete(maThuCung: number): Observable<void> {
    return this.api.delete<void>(`${this.endpoint}/${maThuCung}`);
  }

  // Search pets
  search(term: string): Observable<ThuCung[]> {
    return this.api.get<ThuCung[]>(`${this.endpoint}/search`, { q: term });
  }

  // Get pet medical history
  getMedicalHistory(maThuCung: number): Observable<any> {
    return this.api.get(`${this.endpoint}/${maThuCung}/lich-su-benh-an`);
  }
}
