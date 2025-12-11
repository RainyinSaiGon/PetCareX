import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NhanVien } from '../../entities/nhanvien.entity';
import { LoaiNhanVienLuong } from '../../entities/loai-nhan-vien-luong.entity';
import { ChiNhanh } from '../../entities/chi-nhanh.entity';
import { Khoa } from '../../entities/khoa.entity';
import {
  SalaryStatisticsDto,
  SalaryByType,
  SalaryByBranch,
  SalaryByDepartment,
  SalaryDistribution,
  SalaryTrend,
  TopEarner,
} from './salary-statistics.dto';

@Injectable()
export class SalaryStatisticsService {
  constructor(
    @InjectRepository(NhanVien)
    private nhanVienRepository: Repository<NhanVien>,
    @InjectRepository(LoaiNhanVienLuong)
    private loaiNhanVienRepository: Repository<LoaiNhanVienLuong>,
    @InjectRepository(ChiNhanh)
    private chiNhanhRepository: Repository<ChiNhanh>,
    @InjectRepository(Khoa)
    private khoaRepository: Repository<Khoa>,
  ) {}

  async getSalaryStatistics(): Promise<SalaryStatisticsDto> {
    // Get all active employees with their salary info
    const employees = await this.nhanVienRepository
      .createQueryBuilder('nv')
      .leftJoinAndSelect('nv.LoaiNV', 'loai')
      .leftJoinAndSelect('nv.ChiNhanh', 'cn')
      .leftJoinAndSelect('nv.Khoa', 'khoa')
      .where('nv.NgayNghiLam IS NULL')
      .getMany();

    const salaries = employees
      .map(e => e.LoaiNV?.Luong || 0)
      .filter(s => s > 0)
      .sort((a, b) => a - b);

    // Calculate overall statistics
    const totalEmployees = employees.length;
    const totalSalaryExpense = salaries.reduce((sum, s) => sum + s, 0);
    const averageSalary = totalEmployees > 0 ? totalSalaryExpense / totalEmployees : 0;
    const medianSalary = this.calculateMedian(salaries);
    const minSalary = salaries.length > 0 ? salaries[0] : 0;
    const maxSalary = salaries.length > 0 ? salaries[salaries.length - 1] : 0;

    // Calculate by employee type
    const byEmployeeType = await this.calculateByEmployeeType(employees, totalSalaryExpense);

    // Calculate by branch
    const byBranch = await this.calculateByBranch(employees);

    // Calculate by department (for doctors)
    const byDepartment = await this.calculateByDepartment(employees);

    // Calculate salary distribution
    const salaryDistribution = this.calculateSalaryDistribution(salaries, totalEmployees);

    // Calculate salary trends (last 12 months)
    const salaryTrends = await this.calculateSalaryTrends();

    // Get top earners
    const topEarners = await this.getTopEarners(employees, 10);

    return {
      totalEmployees,
      totalSalaryExpense,
      averageSalary,
      medianSalary,
      minSalary,
      maxSalary,
      byEmployeeType,
      byBranch,
      byDepartment,
      salaryDistribution,
      salaryTrends,
      topEarners,
    };
  }

  private calculateMedian(sortedSalaries: number[]): number {
    if (sortedSalaries.length === 0) return 0;
    const mid = Math.floor(sortedSalaries.length / 2);
    if (sortedSalaries.length % 2 === 0) {
      return (sortedSalaries[mid - 1] + sortedSalaries[mid]) / 2;
    }
    return sortedSalaries[mid];
  }

  private async calculateByEmployeeType(
    employees: NhanVien[],
    totalSalaryExpense: number,
  ): Promise<SalaryByType[]> {
    const typeMap = new Map<string, {
      count: number;
      salaries: number[];
      totalSalary: number;
    }>();

    employees.forEach(emp => {
      const type = emp.LoaiNhanVien || 'Không xác định';
      const salary = emp.LoaiNV?.Luong || 0;

      if (!typeMap.has(type)) {
        typeMap.set(type, { count: 0, salaries: [], totalSalary: 0 });
      }

      const data = typeMap.get(type)!;
      data.count++;
      data.salaries.push(salary);
      data.totalSalary += salary;
    });

    return Array.from(typeMap.entries()).map(([type, data]) => ({
      loaiNhanVien: type,
      count: data.count,
      totalSalary: data.totalSalary,
      averageSalary: data.totalSalary / data.count,
      minSalary: Math.min(...data.salaries),
      maxSalary: Math.max(...data.salaries),
      percentageOfTotal: totalSalaryExpense > 0 ? (data.totalSalary / totalSalaryExpense) * 100 : 0,
    })).sort((a, b) => b.totalSalary - a.totalSalary);
  }

  private async calculateByBranch(employees: NhanVien[]): Promise<SalaryByBranch[]> {
    const branchMap = new Map<string, {
      tenChiNhanh: string;
      totalEmployees: number;
      totalSalary: number;
      typeMap: Map<string, { count: number; totalSalary: number }>;
    }>();

    employees.forEach(emp => {
      const branchCode = emp.MaChiNhanh || 'N/A';
      const branchName = emp.ChiNhanh?.TenChiNhanh || 'Không xác định';
      const salary = emp.LoaiNV?.Luong || 0;
      const type = emp.LoaiNhanVien || 'Không xác định';

      if (!branchMap.has(branchCode)) {
        branchMap.set(branchCode, {
          tenChiNhanh: branchName,
          totalEmployees: 0,
          totalSalary: 0,
          typeMap: new Map(),
        });
      }

      const branchData = branchMap.get(branchCode)!;
      branchData.totalEmployees++;
      branchData.totalSalary += salary;

      if (!branchData.typeMap.has(type)) {
        branchData.typeMap.set(type, { count: 0, totalSalary: 0 });
      }
      const typeData = branchData.typeMap.get(type)!;
      typeData.count++;
      typeData.totalSalary += salary;
    });

    return Array.from(branchMap.entries()).map(([maChiNhanh, data]) => ({
      maChiNhanh,
      tenChiNhanh: data.tenChiNhanh,
      totalEmployees: data.totalEmployees,
      totalSalary: data.totalSalary,
      averageSalary: data.totalSalary / data.totalEmployees,
      byType: Array.from(data.typeMap.entries()).map(([type, typeData]) => ({
        loaiNhanVien: type,
        count: typeData.count,
        totalSalary: typeData.totalSalary,
      })),
    })).sort((a, b) => b.totalSalary - a.totalSalary);
  }

  private async calculateByDepartment(employees: NhanVien[]): Promise<SalaryByDepartment[]> {
    const deptMap = new Map<string, {
      tenKhoa: string;
      doctorCount: number;
      totalSalary: number;
    }>();

    employees
      .filter(emp => emp.MaKhoa && emp.LoaiNhanVien?.includes('Bác sĩ'))
      .forEach(emp => {
        const deptCode = emp.MaKhoa!;
        const deptName = emp.Khoa?.TenKhoa || 'Không xác định';
        const salary = emp.LoaiNV?.Luong || 0;

        if (!deptMap.has(deptCode)) {
          deptMap.set(deptCode, {
            tenKhoa: deptName,
            doctorCount: 0,
            totalSalary: 0,
          });
        }

        const deptData = deptMap.get(deptCode)!;
        deptData.doctorCount++;
        deptData.totalSalary += salary;
      });

    return Array.from(deptMap.entries()).map(([maKhoa, data]) => ({
      maKhoa,
      tenKhoa: data.tenKhoa,
      doctorCount: data.doctorCount,
      totalSalary: data.totalSalary,
      averageSalary: data.totalSalary / data.doctorCount,
    })).sort((a, b) => b.totalSalary - a.totalSalary);
  }

  private calculateSalaryDistribution(
    salaries: number[],
    totalEmployees: number,
  ): SalaryDistribution[] {
    if (salaries.length === 0) return [];

    const ranges = [
      { range: 'Dưới 5 triệu', min: 0, max: 5000000 },
      { range: '5-10 triệu', min: 5000000, max: 10000000 },
      { range: '10-15 triệu', min: 10000000, max: 15000000 },
      { range: '15-20 triệu', min: 15000000, max: 20000000 },
      { range: '20-30 triệu', min: 20000000, max: 30000000 },
      { range: 'Trên 30 triệu', min: 30000000, max: Infinity },
    ];

    return ranges.map(r => {
      const count = salaries.filter(s => s >= r.min && s < r.max).length;
      return {
        range: r.range,
        minSalary: r.min,
        maxSalary: r.max === Infinity ? salaries[salaries.length - 1] : r.max,
        count,
        percentage: totalEmployees > 0 ? (count / totalEmployees) * 100 : 0,
      };
    });
  }

  private async calculateSalaryTrends(): Promise<SalaryTrend[]> {
    // Calculate salary trends for the last 12 months based on current salary data
    // Since we don't have historical salary data, we use current salary info
    const trends: SalaryTrend[] = [];
    const now = new Date();

    // Get all active employees once
    const allEmployees = await this.nhanVienRepository
      .createQueryBuilder('nv')
      .leftJoinAndSelect('nv.LoaiNV', 'loai')
      .where('nv.NgayNghiLam IS NULL')
      .getMany();

    // Generate trends for last 12 months using current employee data
    for (let i = 11; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthNum = String(month.getMonth() + 1).padStart(2, '0');
      const yearNum = month.getFullYear();
      const monthLabel = `tháng ${monthNum}, ${yearNum}`;

      // Use current employee data (in a real system, you'd filter by hire/end dates)
      const totalSalary = allEmployees.reduce((sum, e) => sum + (e.LoaiNV?.Luong || 0), 0);
      const employeeCount = allEmployees.length;

      trends.push({
        month: monthLabel,
        totalSalary,
        employeeCount,
        averageSalary: employeeCount > 0 ? totalSalary / employeeCount : 0,
      });
    }

    return trends;
  }

  private async getTopEarners(employees: NhanVien[], limit: number): Promise<TopEarner[]> {
    return employees
      .filter(e => e.LoaiNV?.Luong)
      .sort((a, b) => (b.LoaiNV?.Luong || 0) - (a.LoaiNV?.Luong || 0))
      .slice(0, limit)
      .map(e => ({
        maNhanVien: e.MaNhanVien,
        hoTen: e.HoTen || 'N/A',
        loaiNhanVien: e.LoaiNhanVien || 'N/A',
        salary: e.LoaiNV?.Luong || 0,
        branch: e.ChiNhanh?.TenChiNhanh || 'N/A',
        department: e.Khoa?.TenKhoa,
      }));
  }

  async getSalaryComparison(employeeType: string): Promise<any> {
    const typeData = await this.loaiNhanVienRepository.findOne({
      where: { LoaiNhanVien: employeeType },
    });

    if (!typeData) {
      throw new Error('Employee type not found');
    }

    // Mock industry average (in real system, this would come from external data)
    const industryAverages: Record<string, number> = {
      'Bác sĩ': 25000000,
      'Y tá': 12000000,
      'Lễ tân': 8000000,
      'Kế toán': 15000000,
      'Quản lý': 30000000,
    };

    const currentSalary = typeData.Luong;
    const industryAverage = industryAverages[employeeType] || currentSalary;
    const difference = currentSalary - industryAverage;
    const percentageDifference = industryAverage > 0 ? (difference / industryAverage) * 100 : 0;

    let comparison: 'above' | 'below' | 'equal';
    if (Math.abs(percentageDifference) < 5) {
      comparison = 'equal';
    } else if (percentageDifference > 0) {
      comparison = 'above';
    } else {
      comparison = 'below';
    }

    return {
      employeeType,
      currentSalary,
      industryAverage,
      comparison,
      percentageDifference: Math.abs(percentageDifference),
    };
  }

  async getSalaryForecast(months: number = 6): Promise<any[]> {
    const trends = await this.calculateSalaryTrends();
    if (trends.length === 0) {
      return [];
    }

    // Use the latest salary data for forecast
    const forecast: any[] = [];
    const lastTrend = trends[trends.length - 1];
    
    // Calculate growth rate from trends (if we have at least 2 months)
    let growthRate = 0;
    if (trends.length >= 2) {
      const prevTrend = trends[trends.length - 2];
      if (prevTrend.totalSalary > 0) {
        growthRate = (lastTrend.totalSalary - prevTrend.totalSalary) / prevTrend.totalSalary;
      }
    }

    // Generate forecast for next 6 months
    for (let i = 1; i <= months; i++) {
      const futureDate = new Date();
      futureDate.setMonth(futureDate.getMonth() + i);
      const monthNum = String(futureDate.getMonth() + 1).padStart(2, '0');
      const yearNum = futureDate.getFullYear();
      const monthLabel = `tháng ${monthNum}, ${yearNum}`;

      forecast.push({
        month: monthLabel,
        predictedTotalSalary: Math.round(lastTrend.totalSalary * Math.pow(1 + growthRate, i)),
        predictedEmployeeCount: Math.round(lastTrend.employeeCount * Math.pow(1 + growthRate / 2, i)),
        confidence: Math.max(0.5, 1 - (i * 0.1)), // Confidence decreases over time
      });
    }

    return forecast;
  }

  private calculateGrowthRate(trends: SalaryTrend[]): number {
    if (trends.length < 2) return 0;

    const rates: number[] = [];
    for (let i = 1; i < trends.length; i++) {
      if (trends[i - 1].totalSalary > 0) {
        const rate = (trends[i].totalSalary - trends[i - 1].totalSalary) / trends[i - 1].totalSalary;
        rates.push(rate);
      }
    }

    return rates.length > 0 ? rates.reduce((a, b) => a + b, 0) / rates.length : 0;
  }
}
