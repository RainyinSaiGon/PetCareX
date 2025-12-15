import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ServiceOffering {
  MaChiNhanh: string;
  MaDichVu: string;
  TenChiNhanh: string;
  TenDichVu: string;
  Gia: number;
  MoTa: string;
  TrangThai: string;
}

export interface CreateServiceOfferingDto {
  MaChiNhanh: string;
  MaDichVu: string;
  Gia: number;
  MoTa?: string;
  TrangThai: string;
}

export interface UpdateServiceOfferingDto {
  Gia?: number;
  MoTa?: string;
  TrangThai?: string;
}

export interface BranchServiceMenu {
  MaChiNhanh: string;
  TenChiNhanh: string;
  Services: ServiceOffering[];
  TotalRevenue: number;
}

export interface ServiceOfferingResponse {
  data: ServiceOffering[];
  total: number;
  page: number;
  totalPages: number;
}

@Injectable({
  providedIn: 'root',
})
export class ServiceOfferingService {
  private apiUrl = `${environment.apiUrl}/branch/services`;

  constructor(private http: HttpClient) {}

  createServiceOffering(dto: CreateServiceOfferingDto): Observable<ServiceOffering> {
    return this.http.post<ServiceOffering>(this.apiUrl, dto);
  }

  getAllServiceOfferings(page: number = 1, limit: number = 10): Observable<ServiceOfferingResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    return this.http.get<ServiceOfferingResponse>(this.apiUrl, { params });
  }

  getServiceOfferingsByBranch(
    branchId: string,
    page: number = 1,
    limit: number = 10,
  ): Observable<ServiceOfferingResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    return this.http.get<ServiceOfferingResponse>(`${this.apiUrl}/branch/${branchId}`, { params });
  }

  getBranchServiceMenu(branchId: string): Observable<BranchServiceMenu> {
    return this.http.get<BranchServiceMenu>(`${this.apiUrl}/menu/${branchId}`);
  }

  updateServiceOffering(
    maChiNhanh: string,
    maDichVu: string,
    dto: UpdateServiceOfferingDto,
  ): Observable<ServiceOffering> {
    return this.http.put<ServiceOffering>(`${this.apiUrl}/${maChiNhanh}/${maDichVu}`, dto);
  }

  deleteServiceOffering(maChiNhanh: string, maDichVu: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${maChiNhanh}/${maDichVu}`);
  }

  getServicePopularity(limit: number = 10): Observable<any> {
    const params = new HttpParams().set('limit', limit.toString());
    return this.http.get<any>(`${this.apiUrl}/popularity/analysis`, { params });
  }
}
