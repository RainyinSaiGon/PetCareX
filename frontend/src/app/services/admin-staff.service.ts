import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Employee {
  MaNhanVien: string;
  HoTen: string;
  SDT: string;
  NgaySinh: Date;
  NgayVaoLam: Date;
  MaChiNhanh: string;
  LoaiNhanVien: string;
  MaKhoa?: string;
  luongHienTai?: number;
  tenLoaiNhanVien?: string;
  tenChiNhanh?: string;
  tenKhoa?: string;
  statistics?: {
    totalAppointments: number;
    completedAppointments: number;
    pendingAppointments: number;
    yearsOfService: number;
  };
}

export interface EmployeeListResponse {
  data: Employee[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface EmployeeFilter {
  search?: string;
  maChiNhanh?: string;
  loaiNhanVien?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface CreateEmployeeDto {
  maNhanVien: string;
  hoTen: string;
  sdt: string;
  ngaySinh?: Date;
  ngayVaoLam?: Date;
  maChiNhanh: string;
  loaiNhanVien: string;
  maKhoa?: string;
}

export interface UpdateEmployeeDto {
  hoTen?: string;
  sdt?: string;
  ngaySinh?: Date;
  maChiNhanh?: string;
  loaiNhanVien?: string;
  maKhoa?: string;
}

export interface EmployeeType {
  loaiNhanVien: string;
  luong: number;
}

export interface Branch {
  maChiNhanh: string;
  tenChiNhanh: string;
  diaChi: string;
  sdt: string;
}

export interface Department {
  maKhoa: string;
  tenKhoa: string;
  truongKhoa?: string;
}

export interface EmployeeStats {
  totalEmployees: number;
  byBranch: {
    maChiNhanh: string;
    tenChiNhanh: string;
    count: number;
  }[];
  byType: {
    loaiNhanVien: string;
    count: number;
    avgSalary: number;
  }[];
  totalPayroll: number;
}

export interface SalaryStatistics {
  totalEmployees: number;
  totalSalaryExpense: number;
  averageSalary: number;
  medianSalary: number;
  minSalary: number;
  maxSalary: number;
  byEmployeeType: SalaryByType[];
  byBranch: SalaryByBranch[];
  byDepartment: SalaryByDepartment[];
  salaryDistribution: SalaryDistribution[];
  salaryTrends: SalaryTrend[];
  topEarners: TopEarner[];
}

export interface SalaryByType {
  loaiNhanVien: string;
  count: number;
  totalSalary: number;
  averageSalary: number;
  minSalary: number;
  maxSalary: number;
  percentageOfTotal: number;
}

export interface SalaryByBranch {
  maChiNhanh: string;
  tenChiNhanh: string;
  totalEmployees: number;
  totalSalary: number;
  averageSalary: number;
  byType: {
    loaiNhanVien: string;
    count: number;
    totalSalary: number;
  }[];
}

export interface SalaryByDepartment {
  maKhoa: string;
  tenKhoa: string;
  doctorCount: number;
  totalSalary: number;
  averageSalary: number;
}

export interface SalaryDistribution {
  range: string;
  minSalary: number;
  maxSalary: number;
  count: number;
  percentage: number;
}

export interface SalaryTrend {
  month: string;
  totalSalary: number;
  employeeCount: number;
  averageSalary: number;
}

export interface TopEarner {
  maNhanVien: string;
  hoTen: string;
  loaiNhanVien: string;
  salary: number;
  branch: string;
  department?: string;
}

export interface SalaryComparison {
  employeeType: string;
  currentSalary: number;
  industryAverage: number;
  comparison: 'above' | 'below' | 'equal';
  percentageDifference: number;
}

export interface SalaryForecast {
  month: string;
  predictedTotalSalary: number;
  predictedEmployeeCount: number;
  confidence: number;
}

@Injectable({
  providedIn: 'root'
})
export class AdminStaffService {
  private apiUrl = `${environment.apiUrl}/admin/staff`;

  constructor(private http: HttpClient) {}

  /**
   * Get all employees with filters
   */
  getEmployees(filter: EmployeeFilter = {}): Observable<EmployeeListResponse> {
    let params = new HttpParams();
    
    if (filter.search) params = params.set('search', filter.search);
    if (filter.maChiNhanh) params = params.set('maChiNhanh', filter.maChiNhanh);
    if (filter.loaiNhanVien) params = params.set('loaiNhanVien', filter.loaiNhanVien);
    if (filter.page) params = params.set('page', filter.page.toString());
    if (filter.limit) params = params.set('limit', filter.limit.toString());
    if (filter.sortBy) params = params.set('sortBy', filter.sortBy);
    if (filter.sortOrder) params = params.set('sortOrder', filter.sortOrder);

    return this.http.get<EmployeeListResponse>(`${this.apiUrl}/employees`, { params });
  }

  /**
   * Get employee by ID
   */
  getEmployeeById(maNhanVien: string): Observable<Employee> {
    return this.http.get<Employee>(`${this.apiUrl}/employees/${maNhanVien}`);
  }

  /**
   * Create new employee
   */
  createEmployee(data: CreateEmployeeDto): Observable<Employee> {
    return this.http.post<Employee>(`${this.apiUrl}/employees`, data);
  }

  /**
   * Update employee
   */
  updateEmployee(maNhanVien: string, data: UpdateEmployeeDto): Observable<Employee> {
    return this.http.put<Employee>(`${this.apiUrl}/employees/${maNhanVien}`, data);
  }

  /**
   * Delete employee
   */
  deleteEmployee(maNhanVien: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/employees/${maNhanVien}`);
  }

  /**
   * Update salary for employee type
   */
  updateEmployeeSalary(loaiNhanVien: string, newSalary: number, reason?: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/employees/${loaiNhanVien}/salary`, {
      newSalary,
      reason
    });
  }

  /**
   * Get all employee types
   */
  getEmployeeTypes(): Observable<EmployeeType[]> {
    return this.http.get<EmployeeType[]>(`${this.apiUrl}/employee-types`);
  }

  /**
   * Get all branches
   */
  getBranches(): Observable<Branch[]> {
    return this.http.get<Branch[]>(`${this.apiUrl}/branches`);
  }

  /**
   * Get all departments
   */
  getDepartments(): Observable<Department[]> {
    return this.http.get<Department[]>(`${this.apiUrl}/departments`);
  }

  /**
   * Get employee statistics
   */
  getStatistics(): Observable<EmployeeStats> {
    return this.http.get<EmployeeStats>(`${this.apiUrl}/statistics/by-branch`);
  }

  /**
   * Bulk assign branch
   */
  bulkAssignBranch(maNhanVienList: string[], maChiNhanh: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/bulk-assign-branch`, {
      maNhanVienList,
      maChiNhanh
    });
  }

  /**
   * Bulk update salary
   */
  bulkUpdateSalary(loaiNhanVien: string, percentageIncrease: number, reason?: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/salary/bulk-update`, {
      loaiNhanVien,
      percentageIncrease,
      reason
    });
  }

  /**
   * Get comprehensive salary statistics
   */
  getSalaryStatistics(): Observable<SalaryStatistics> {
    return this.http.get<SalaryStatistics>(`${this.apiUrl}/salary/statistics`);
  }

  /**
   * Get salary comparison with industry average
   */
  getSalaryComparison(employeeType: string): Observable<SalaryComparison> {
    return this.http.get<SalaryComparison>(`${this.apiUrl}/salary/comparison/${employeeType}`);
  }

  /**
   * Get salary forecast
   */
  getSalaryForecast(months: number = 6): Observable<SalaryForecast[]> {
    return this.http.get<SalaryForecast[]>(`${this.apiUrl}/salary/forecast`, {
      params: { months: months.toString() }
    });
  }
}

