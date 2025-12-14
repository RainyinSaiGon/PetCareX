import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CustomerStatistics, InactiveCustomer, SpendingTrend } from '../models/customer.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CustomerStatisticsService {
  private apiUrl = `${environment.apiUrl}/customer`;

  constructor(private http: HttpClient) {}

  getStatistics(): Observable<CustomerStatistics> {
    return this.http.get<CustomerStatistics>(`${this.apiUrl}/statistics`);
  }

  getInactiveCustomers(days: number = 30): Observable<InactiveCustomer[]> {
    return this.http.get<InactiveCustomer[]>(`${this.apiUrl}/inactive?days=${days}`);
  }

  getSpendingTrends(months: number = 12): Observable<SpendingTrend[]> {
    return this.http.get<SpendingTrend[]>(`${this.apiUrl}/spending-trends?months=${months}`);
  }

  getCustomersByTier(tier: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/by-tier/${tier}`);
  }

  updateCustomerTier(customerId: number): Observable<{ success: boolean; newTier: string }> {
    return this.http.post<{ success: boolean; newTier: string }>(`${this.apiUrl}/${customerId}/update-tier`, {});
  }

  exportCustomersToCSV(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/export-csv`, { responseType: 'blob' });
  }
}
