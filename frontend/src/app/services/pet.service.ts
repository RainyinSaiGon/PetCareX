import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ThuCung, CreateThuCungDto, UpdateThuCungDto, PetStatistics } from '../models/pet.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PetService {
  private apiUrl = `${environment.apiUrl}/customer`;

  constructor(private http: HttpClient) {}

  // Pet endpoints
  getPetsByCustomer(customerId: number): Observable<ThuCung[]> {
    return this.http.get<ThuCung[]>(`${this.apiUrl}/${customerId}/pets`);
  }

  getPetById(customerId: number, petId: number): Observable<ThuCung> {
    return this.http.get<ThuCung>(`${this.apiUrl}/${customerId}/pets/${petId}`);
  }

  createPet(customerId: number, data: CreateThuCungDto): Observable<ThuCung> {
    return this.http.post<ThuCung>(`${this.apiUrl}/${customerId}/pets`, data);
  }

  updatePet(customerId: number, petId: number, data: UpdateThuCungDto): Observable<ThuCung> {
    return this.http.put<ThuCung>(`${this.apiUrl}/${customerId}/pets/${petId}`, data);
  }

  deletePet(customerId: number, petId: number): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/${customerId}/pets/${petId}`);
  }

  getPetMedicalHistory(customerId: number, petId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${customerId}/pets/${petId}/medical-history`);
  }

  getPetStatistics(): Observable<PetStatistics> {
    return this.http.get<PetStatistics>(`${this.apiUrl}/pets/statistics`);
  }

  searchPets(query: string): Observable<ThuCung[]> {
    const params = new HttpParams().set('query', query);
    return this.http.get<ThuCung[]>(`${this.apiUrl}/pets/search`, { params });
  }
}
