// Example service for managing pets
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface Pet {
  id?: number;
  userId: number;
  name: string;
  species: string;
  breed?: string;
  dateOfBirth?: string;
  gender?: string;
  imageUrl?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PetService {
  private endpoint = 'pets';

  constructor(private apiService: ApiService) {}

  // Get all pets
  getAllPets(): Observable<Pet[]> {
    return this.apiService.get<Pet[]>(this.endpoint);
  }

  // Get pet by ID
  getPetById(id: number): Observable<Pet> {
    return this.apiService.get<Pet>(`${this.endpoint}/${id}`);
  }

  // Create new pet
  createPet(pet: Pet): Observable<Pet> {
    return this.apiService.post<Pet>(this.endpoint, pet);
  }

  // Update pet
  updatePet(id: number, pet: Partial<Pet>): Observable<Pet> {
    return this.apiService.put<Pet>(`${this.endpoint}/${id}`, pet);
  }

  // Delete pet
  deletePet(id: number): Observable<void> {
    return this.apiService.delete<void>(`${this.endpoint}/${id}`);
  }
}
