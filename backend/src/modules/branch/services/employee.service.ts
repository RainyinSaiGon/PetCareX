import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NhanVien } from '../../../entities/nhanvien.entity';
import { ChiNhanh } from '../../../entities/chi-nhanh.entity';
import { HoaDon } from '../../../entities/hoa-don.entity';
import { CreateEmployeeDto, UpdateEmployeeDto, EmployeeResponseDto, EmployeePerformanceDto } from '../dto/employee.dto';

@Injectable()
export class EmployeeService {
  constructor(
    @InjectRepository(NhanVien) private employeeRepo: Repository<NhanVien>,
    @InjectRepository(ChiNhanh) private branchRepo: Repository<ChiNhanh>,
    @InjectRepository(HoaDon) private invoiceRepo: Repository<HoaDon>,
  ) {}

  // FB-01: Create new employee
  async createEmployee(createDto: CreateEmployeeDto): Promise<EmployeeResponseDto> {
    const employee = this.employeeRepo.create(createDto);
    const saved = await this.employeeRepo.save(employee);
    return this.mapToResponseDto(saved);
  }

  // FB-01: Get all employees with pagination
  async getAllEmployees(page: number = 1, limit: number = 10): Promise<any> {
    const skip = (page - 1) * limit;
    const [employees, total] = await this.employeeRepo.findAndCount({
      relations: ['ChiNhanh'],
      skip,
      take: limit,
      order: { MaNhanVien: 'ASC' },
    });

    return {
      data: employees.map(e => this.mapToResponseDto(e)),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  // FB-01: Get employees by branch
  async getEmployeesByBranch(branchId: string, page: number = 1, limit: number = 10): Promise<any> {
    const skip = (page - 1) * limit;
    const [employees, total] = await this.employeeRepo.findAndCount({
      where: { MaChiNhanh: branchId },
      relations: ['ChiNhanh'],
      skip,
      take: limit,
      order: { HoTen: 'ASC' },
    });

    return {
      data: employees.map(e => this.mapToResponseDto(e)),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  // FB-01: Get employee by ID
  async getEmployeeById(id: string): Promise<EmployeeResponseDto> {
    const employee = await this.employeeRepo.findOne({
      where: { MaNhanVien: id },
      relations: ['ChiNhanh'],
    });
    if (!employee) throw new Error('Employee not found');
    return this.mapToResponseDto(employee);
  }

  // FB-01: Update employee
  async updateEmployee(id: string, updateDto: UpdateEmployeeDto): Promise<EmployeeResponseDto> {
    await this.employeeRepo.update(id, updateDto);
    const updated = await this.employeeRepo.findOne({
      where: { MaNhanVien: id },
      relations: ['ChiNhanh'],
    });
    if (!updated) throw new Error('Employee not found');
    return this.mapToResponseDto(updated);
  }

  // FB-01: Delete employee
  async deleteEmployee(id: string): Promise<void> {
    const result = await this.employeeRepo.delete(id);
    if (result.affected === 0) throw new Error('Employee not found');
  }

  // FB-05: Get employee performance metrics
  async getEmployeePerformance(employeeId: string): Promise<EmployeePerformanceDto> {
    const employee = await this.employeeRepo.findOne({
      where: { MaNhanVien: employeeId },
    });
    if (!employee) throw new Error('Employee not found');

    // Get total transactions
    const invoices = await this.invoiceRepo.find({
      where: { MaNhanVien: employeeId },
    });

    const totalTransactions = invoices.length;
    const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.TongTien || 0), 0);
    const lastMonthDate = new Date();
    lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);

    const lastMonthInvoices = invoices.filter(inv => new Date(inv.NgayLap) >= lastMonthDate);
    const lastMonthRevenue = lastMonthInvoices.reduce((sum, inv) => sum + (inv.TongTien || 0), 0);

    return {
      MaNhanVien: employee.MaNhanVien,
      HoTen: employee.HoTen,
      LoaiNhanVien: employee.LoaiNhanVien,
      TotalTransactions: totalTransactions,
      TotalRevenue: totalRevenue,
      AverageServiceRating: 0,
      TotalPatientsServed: totalTransactions,
      LastMonthRevenue: lastMonthRevenue,
      PerformanceRating: this.calculatePerformanceRating(totalRevenue, totalTransactions),
    };
  }

  // FB-05: Get all employees performance metrics
  async getAllEmployeesPerformance(page: number = 1, limit: number = 10): Promise<any> {
    const skip = (page - 1) * limit;
    const [employees, total] = await this.employeeRepo.findAndCount({
      skip,
      take: limit,
      order: { HoTen: 'ASC' },
    });

    const performanceData = await Promise.all(
      employees.map(emp => this.getEmployeePerformance(emp.MaNhanVien)),
    );

    // Sort by revenue descending
    performanceData.sort((a, b) => b.TotalRevenue - a.TotalRevenue);

    return {
      data: performanceData,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  // Helper methods
  private mapToResponseDto(employee: NhanVien): EmployeeResponseDto {
    return {
      MaNhanVien: employee.MaNhanVien,
      HoTen: employee.HoTen,
      NgayVaoLam: employee.NgayVaoLam,
      NgayNghiLam: employee.NgayNghiLam,
      NgaySinh: employee.NgaySinh,
      SDT: employee.SDT,
      MaChiNhanh: employee.MaChiNhanh,
      LoaiNhanVien: employee.LoaiNhanVien,
      MaKhoa: employee.MaKhoa,
      ChiNhanhName: employee.ChiNhanh?.TenChiNhanh,
    };
  }

  private calculatePerformanceRating(totalRevenue: number, transactionCount: number): string {
    const avgRevenue = transactionCount > 0 ? totalRevenue / transactionCount : 0;

    if (totalRevenue >= 1000000) return 'Excellent';
    if (totalRevenue >= 500000) return 'Very Good';
    if (totalRevenue >= 200000) return 'Good';
    if (totalRevenue >= 50000) return 'Fair';
    return 'Below Average';
  }
}
