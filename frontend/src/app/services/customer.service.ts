import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { KhachHang, CreateKhachHangDto, UpdateKhachHangDto, PaginatedResponse } from '../models/customer.model';
import { ThuCung, CreateThuCungDto, UpdateThuCungDto, ChungLoaiThuCung, LoaiThuCung } from '../models/pet.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private apiUrl = `${environment.apiUrl}/customer`;

  constructor(private http: HttpClient) {}

  // Customer endpoints
  getCustomers(page: number = 1, limit: number = 10, keyword?: string): Observable<PaginatedResponse<KhachHang>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    
    if (keyword) {
      params = params.set('keyword', keyword);
    }

    return this.http.get<PaginatedResponse<KhachHang>>(`${this.apiUrl}/khach-hang`, { params });
  }

  getCustomerById(id: number): Observable<KhachHang> {
    return this.http.get<KhachHang>(`${this.apiUrl}/khach-hang/${id}`);
  }

  createCustomer(data: CreateKhachHangDto): Observable<KhachHang> {
    return this.http.post<KhachHang>(`${this.apiUrl}/khach-hang`, data);
  }

  updateCustomer(id: number, data: UpdateKhachHangDto): Observable<KhachHang> {
    return this.http.put<KhachHang>(`${this.apiUrl}/khach-hang/${id}`, data);
  }

  deleteCustomer(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/khach-hang/${id}`);
  }

  searchCustomers(keyword: string, page: number = 1, limit: number = 10): Observable<PaginatedResponse<KhachHang>> {
    const params = new HttpParams()
      .set('keyword', keyword)
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<PaginatedResponse<KhachHang>>(`${this.apiUrl}/khach-hang/search`, { params });
  }

  // Pet endpoints
  getPets(customerId: number, page: number = 1, limit: number = 10): Observable<PaginatedResponse<ThuCung>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<PaginatedResponse<ThuCung>>(`${environment.apiUrl}/api/pets/customer/${customerId}`, { params });
  }

  getPetById(customerId: number, petId: number): Observable<ThuCung> {
    return this.http.get<ThuCung>(`${environment.apiUrl}/api/pets/${petId}`);
  }

  createPet(customerId: number, data: any): Observable<ThuCung> {
    const params = new HttpParams().set('customerId', customerId.toString());
    return this.http.post<ThuCung>(`${environment.apiUrl}/api/pets`, data, { params });
  }

  updatePet(customerId: number, petId: number, data: any): Observable<ThuCung> {
    return this.http.put<ThuCung>(`${environment.apiUrl}/api/pets/${petId}`, data);
  }

  deletePet(customerId: number, petId: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${environment.apiUrl}/api/pets/${petId}`);
  }

  searchPets(keyword: string, page: number = 1, limit: number = 10): Observable<PaginatedResponse<ThuCung>> {
    const params = new HttpParams()
      .set('keyword', keyword)
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<PaginatedResponse<ThuCung>>(`${environment.apiUrl}/api/pets/search`, { params });
  }

  // Customer Statistics & Export
  getCustomerStatistics(): Observable<any> {
    return this.http.get(`${this.apiUrl}/statistics`);
  }

  getInactiveCustomers(days: number = 30): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/inactive?days=${days}`);
  }

  getSpendingTrends(months: number = 12): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/spending-trends?months=${months}`);
  }

  exportCustomersToCSV(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/export-csv`, { responseType: 'blob' });
  }

  // Pet Type & Breed endpoints
  getPetTypes(): Observable<any> {
    return this.http.get(`${this.apiUrl}/loai-thu-cung`);
  }

  getBreeds(): Observable<any> {
    return this.http.get(`${this.apiUrl}/chung-loai`);
  }

  getBreedsByType(petTypeId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/chung-loai/${petTypeId}`);
  }

  // Legacy endpoint for backward compatibility
  getSpecies(): Observable<ChungLoaiThuCung[]> {
    return this.http.get<ChungLoaiThuCung[]>(`${this.apiUrl}/chung-loai`);
  }
}
