import { IsNotEmpty, IsString, IsOptional, IsDateString, IsInt } from 'class-validator';

// FB-01: Employee Management DTOs
export class CreateEmployeeDto {
  @IsNotEmpty({ message: 'Mã nhân viên là bắt buộc' })
  @IsString()
  MaNhanVien: string;

  @IsNotEmpty({ message: 'Họ tên là bắt buộc' })
  @IsString()
  HoTen: string;

  @IsOptional()
  @IsDateString()
  NgayVaoLam?: Date;

  @IsOptional()
  @IsDateString()
  NgaySinh?: Date;

  @IsOptional()
  @IsString()
  SDT?: string;

  @IsNotEmpty({ message: 'Chi nhánh là bắt buộc' })
  @IsString()
  MaChiNhanh: string;

  @IsNotEmpty({ message: 'Loại nhân viên là bắt buộc' })
  @IsString()
  LoaiNhanVien: string;

  @IsOptional()
  @IsString()
  MaKhoa?: string;
}

export class UpdateEmployeeDto {
  @IsOptional()
  @IsString()
  HoTen?: string;

  @IsOptional()
  @IsDateString()
  NgayVaoLam?: Date;

  @IsOptional()
  @IsDateString()
  NgayNghiLam?: Date;

  @IsOptional()
  @IsDateString()
  NgaySinh?: Date;

  @IsOptional()
  @IsString()
  SDT?: string;

  @IsOptional()
  @IsString()
  MaChiNhanh?: string;

  @IsOptional()
  @IsString()
  LoaiNhanVien?: string;

  @IsOptional()
  @IsString()
  MaKhoa?: string;
}

export class EmployeeResponseDto {
  MaNhanVien: string;
  HoTen: string;
  NgayVaoLam: Date;
  NgayNghiLam: Date;
  NgaySinh: Date;
  SDT: string;
  MaChiNhanh: string;
  LoaiNhanVien: string;
  MaKhoa: string;
  ChiNhanhName?: string;
  KhoaName?: string;
  LoaiNhanVienName?: string;
}

export class EmployeeListResponseDto {
  data: EmployeeResponseDto[];
  total: number;
  page: number;
  totalPages: number;
}

export class EmployeePerformanceDto {
  MaNhanVien: string;
  HoTen: string;
  LoaiNhanVien: string;
  TotalTransactions: number;
  TotalRevenue: number;
  AverageServiceRating: number;
  TotalPatientsServed: number;
  LastMonthRevenue: number;
  PerformanceRating: string;
}

export class EmployeePerformanceListDto {
  data: EmployeePerformanceDto[];
  total: number;
  page: number;
  totalPages: number;
}
