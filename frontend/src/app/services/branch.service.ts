import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class BranchService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Employee Management (FB-01)
  getAllEmployees(page: number = 1, limit: number = 10): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    return this.http.get(`${this.apiUrl}/branch/employees`, { params });
  }

  getEmployeesByBranch(branchId: string, page: number = 1, limit: number = 10): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    return this.http.get(`${this.apiUrl}/branch/employees/branch/${branchId}`, { params });
  }

  getEmployeeById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/branch/employees/${id}`);
  }

  createEmployee(employeeData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/branch/employees`, employeeData);
  }

  updateEmployee(id: string, employeeData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/branch/employees/${id}`, employeeData);
  }

  deleteEmployee(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/branch/employees/${id}`);
  }

  // Employee Performance (FB-05)
  getEmployeePerformance(employeeId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/branch/employees/performance/${employeeId}`);
  }

  getAllEmployeesPerformance(page: number = 1, limit: number = 10): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    return this.http.get(`${this.apiUrl}/branch/employees/performance-metrics/all`, { params });
  }

  // Revenue Reports (FB-02)
  getBranchRevenueReport(branchId?: string, page: number = 1, limit: number = 10): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    if (branchId) {
      params = params.set('branchId', branchId);
    }
    return this.http.get(`${this.apiUrl}/branch/revenue/report`, { params });
  }

  getRevenueDetailsByDateRange(startDate: Date, endDate: Date, branchId?: string, page: number = 1, limit: number = 10): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    const body = {
      startDate,
      endDate,
      branchId,
    };
    return this.http.post(`${this.apiUrl}/branch/revenue/details`, body, { params });
  }

  getMonthlyRevenueChart(year: number, branchId?: string): Observable<any> {
    let params = new HttpParams()
      .set('year', year.toString());
    if (branchId) {
      params = params.set('branchId', branchId);
    }
    return this.http.get(`${this.apiUrl}/branch/revenue/monthly-chart`, { params });
  }

  getTopServices(branchId?: string, limit: number = 10): Observable<any> {
    let params = new HttpParams()
      .set('limit', limit.toString());
    if (branchId) {
      params = params.set('branchId', branchId);
    }
    return this.http.get(`${this.apiUrl}/branch/revenue/top-services`, { params });
  }

  getTopProducts(branchId?: string, limit: number = 10): Observable<any> {
    let params = new HttpParams()
      .set('limit', limit.toString());
    if (branchId) {
      params = params.set('branchId', branchId);
    }
    return this.http.get(`${this.apiUrl}/branch/revenue/top-products`, { params });
  }

  getTotalSystemRevenue(startDate?: Date, endDate?: Date): Observable<any> {
    let params = new HttpParams();
    if (startDate) params = params.set('startDate', startDate.toISOString());
    if (endDate) params = params.set('endDate', endDate.toISOString());
    return this.http.get(`${this.apiUrl}/branch/revenue/total-system`, { params });
  }

  // Inventory Management (FB-03)
  createInventoryImport(importData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/branch/inventory/import`, importData);
  }

  createInventoryExport(exportData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/branch/inventory/export`, exportData);
  }

  getInventoryLevelsByBranch(branchId: string, page: number = 1, limit: number = 10): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    return this.http.get(`${this.apiUrl}/branch/inventory/branch/${branchId}`, { params });
  }

  getAllInventoryLevels(page: number = 1, limit: number = 10): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    return this.http.get(`${this.apiUrl}/branch/inventory`, { params });
  }

  getLowStockAlerts(threshold: number = 10): Observable<any> {
    const params = new HttpParams().set('threshold', threshold.toString());
    return this.http.get(`${this.apiUrl}/branch/inventory/alerts/low-stock`, { params });
  }

  getInventorySummary(): Observable<any> {
    return this.http.get(`${this.apiUrl}/branch/inventory/summary/all`);
  }

  // Service Offering Management (FB-07)
  getAllServiceOfferings(page: number = 1, limit: number = 10): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    return this.http.get(`${this.apiUrl}/branch/services`, { params });
  }

  getServiceOfferingsByBranch(branchId: string, page: number = 1, limit: number = 10): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    return this.http.get(`${this.apiUrl}/branch/services/branch/${branchId}`, { params });
  }

  getBranchServiceMenu(branchId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/branch/services/menu/${branchId}`);
  }

  createServiceOffering(serviceData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/branch/services`, serviceData);
  }

  updateServiceOffering(maCungCap: number, serviceData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/branch/services/${maCungCap}`, serviceData);
  }

  deleteServiceOffering(maCungCap: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/branch/services/${maCungCap}`);
  }

  getServicePopularity(limit: number = 10): Observable<any> {
    const params = new HttpParams().set('limit', limit.toString());
    return this.http.get(`${this.apiUrl}/branch/services/popularity/analysis`, { params });
  }
}
