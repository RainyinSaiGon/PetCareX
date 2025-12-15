import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ThuCung, CreateThuCungDto, UpdateThuCungDto, PetStatistics } from '../models/pet.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PetService {
  private apiUrl = `${environment.apiUrl}/api/pets`;

  constructor(private http: HttpClient) {}

  // Pet endpoints
  getPetsByCustomer(customerId: number): Observable<ThuCung[]> {
    return this.http.get<ThuCung[]>(`${this.apiUrl}/customer/${customerId}`);
  }

  getPetById(petId: number): Observable<ThuCung> {
    return this.http.get<ThuCung>(`${this.apiUrl}/${petId}`);
  }

  createPet(customerId: number, data: CreateThuCungDto): Observable<ThuCung> {
    const params = new HttpParams().set('customerId', customerId.toString());
    return this.http.post<ThuCung>(this.apiUrl, data, { params });
  }

  updatePet(petId: number, data: UpdateThuCungDto): Observable<ThuCung> {
    return this.http.put<ThuCung>(`${this.apiUrl}/${petId}`, data);
  }

  deletePet(petId: number): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/${petId}`);
  }

  getPetMedicalHistory(petId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${petId}/medical-history`);
  }

  getPetStatistics(): Observable<PetStatistics> {
    return this.http.get<PetStatistics>(`${this.apiUrl}/statistics/overview`);
  }

  searchPets(query: string): Observable<ThuCung[]> {
    const params = new HttpParams().set('query', query);
    return this.http.get<ThuCung[]>(`${this.apiUrl}/search`, { params });
  }
}
