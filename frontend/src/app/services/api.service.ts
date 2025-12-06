import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json'
    });
  }

  // Generic GET request with optional params
  get<T>(endpoint: string, params?: Record<string, unknown>): Observable<T> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null) {
          httpParams = httpParams.set(key, String(params[key]));
        }
      });
    }
    return this.http.get<T>(`${this.apiUrl}/${endpoint}`, {
      headers: this.getHeaders(),
      params: httpParams
    });
  }

  // Generic POST request
  post<T>(endpoint: string, data: unknown): Observable<T> {
    return this.http.post<T>(`${this.apiUrl}/${endpoint}`, data, {
      headers: this.getHeaders()
    });
  }

  // Generic PUT request
  put<T>(endpoint: string, data: unknown): Observable<T> {
    return this.http.put<T>(`${this.apiUrl}/${endpoint}`, data, {
      headers: this.getHeaders()
    });
  }

  // Generic DELETE request
  delete<T>(endpoint: string): Observable<T> {
    return this.http.delete<T>(`${this.apiUrl}/${endpoint}`, {
      headers: this.getHeaders()
    });
  }

  // Generic PATCH request
  patch<T>(endpoint: string, data: unknown): Observable<T> {
    return this.http.patch<T>(`${this.apiUrl}/${endpoint}`, data, {
      headers: this.getHeaders()
    });
  }
}
