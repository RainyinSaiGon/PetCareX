import { IsNotEmpty, IsString, IsNumber, IsOptional, IsEnum, IsDate, Min, IsArray, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

// ===========================
// EMPLOYEE MANAGEMENT DTOs
// ===========================

export class CreateEmployeeDto {
  @IsString()
  @IsNotEmpty()
  maNhanVien: string;

  @IsString()
  @IsNotEmpty()
  hoTen: string;

  @IsString()
  @IsNotEmpty()
  sdt: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  diaChi?: string;

  @IsString()
  @IsNotEmpty()
  gioiTinh: string;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  ngaySinh?: Date;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  ngayVaoLam?: Date;

  @IsNumber()
  @IsNotEmpty()
  maChiNhanh: number;

  @IsString()
  @IsNotEmpty()
  loaiNhanVien: string;

  @IsNumber()
  @IsOptional()
  maKhoa?: number;

  @IsNumber()
  @IsOptional()
  userId?: number;
}

export class UpdateEmployeeDto {
  @IsString()
  @IsOptional()
  hoTen?: string;

  @IsString()
  @IsOptional()
  sdt?: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  diaChi?: string;

  @IsString()
  @IsOptional()
  gioiTinh?: string;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  ngaySinh?: Date;

  @IsNumber()
  @IsOptional()
  maChiNhanh?: number;

  @IsString()
  @IsOptional()
  loaiNhanVien?: string;

  @IsNumber()
  @IsOptional()
  maKhoa?: number;
}

export class UpdateSalaryDto {
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  newSalary: number;
}

export class EmployeeFilterDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  maChiNhanh?: number;

  @IsOptional()
  @IsString()
  loaiNhanVien?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  limit?: number = 20;

  @IsOptional()
  @IsString()
  sortBy?: string = 'NgayVaoLam';

  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}

// ===========================
// ANALYTICS & REPORTS DTOs
// ===========================

export class RevenueReportDto {
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  startDate?: Date;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  endDate?: Date;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  maChiNhanh?: number;

  @IsOptional()
  @IsBoolean()
  includeDetails?: boolean = false;
}

export class TopServicesQueryDto {
  @IsNumber()
  @IsOptional()
  @Min(1)
  @Type(() => Number)
  months?: number = 3;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Type(() => Number)
  limit?: number = 10;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  maChiNhanh?: number;
}

export class MemberAnalyticsDto {
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  maChiNhanh?: number;

  @IsOptional()
  @IsString()
  tierName?: string;

  @IsOptional()
  @IsBoolean()
  includeInactive?: boolean = false;
}

export class SalesPerformanceDto {
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  startDate?: Date;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  endDate?: Date;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  maChiNhanh?: number;

  @IsOptional()
  @IsString()
  groupBy?: 'day' | 'week' | 'month' = 'day';
}

export class ProductAnalyticsDto {
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  startDate?: Date;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  endDate?: Date;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  sortBy?: 'revenue' | 'quantity' | 'profit' = 'revenue';
}

// ===========================
// MEMBER TIER MANAGEMENT DTOs
// ===========================

export class UpdateMemberTierDto {
  @IsString()
  @IsNotEmpty()
  maKhachHang: string;

  @IsString()
  @IsNotEmpty()
  newTier: string;

  @IsString()
  @IsOptional()
  reason?: string;
}

export class MemberTierHistoryDto {
  @IsString()
  @IsOptional()
  maKhachHang?: string;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  startDate?: Date;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  endDate?: Date;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  limit?: number = 50;
}

// ===========================
// BRANCH COMPARISON DTOs
// ===========================

export class BranchComparisonDto {
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  startDate?: Date;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  endDate?: Date;

  @IsArray()
  @IsOptional()
  @Type(() => Number)
  branchIds?: number[];

  @IsOptional()
  @IsString()
  metrics?: string = 'all'; // 'revenue', 'customers', 'services', 'all'
}

// ===========================
// DASHBOARD DTOs
// ===========================

export class DashboardQueryDto {
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  maChiNhanh?: number;

  @IsOptional()
  @IsString()
  period?: 'today' | 'week' | 'month' | 'year' = 'month';
}

// ===========================
// EXPORT DTOs
// ===========================

export class ExportReportDto {
  @IsString()
  @IsNotEmpty()
  reportType: 'revenue' | 'employees' | 'members' | 'services' | 'products';

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  startDate?: Date;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  endDate?: Date;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  maChiNhanh?: number;

  @IsOptional()
  @IsString()
  format?: 'json' | 'csv' | 'excel' = 'json';
}
