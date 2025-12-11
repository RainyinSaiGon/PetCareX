import { 
  IsNotEmpty, 
  IsString, 
  IsNumber, 
  IsOptional, 
  IsEnum, 
  IsDate, 
  Min, 
  Max,
  Length,
  Matches
} from 'class-validator';
import { Type } from 'class-transformer';

// ===========================
// EMPLOYEE CRUD DTOs
// ===========================

export class CreateEmployeeDto {
  @IsString()
  @IsNotEmpty({ message: 'Mã nhân viên không được để trống' })
  @Length(5, 5, { message: 'Mã nhân viên phải có đúng 5 ký tự' })
  maNhanVien: string;

  @IsString()
  @IsNotEmpty({ message: 'Họ tên không được để trống' })
  @Length(2, 100, { message: 'Họ tên phải từ 2-100 ký tự' })
  hoTen: string;

  @IsString()
  @IsNotEmpty({ message: 'Số điện thoại không được để trống' })
  @Matches(/^[0-9]{10}$/, { message: 'Số điện thoại phải có đúng 10 chữ số' })
  sdt: string;

  @IsDate({ message: 'Ngày sinh không hợp lệ' })
  @Type(() => Date)
  @IsOptional()
  ngaySinh?: Date;

  @IsDate({ message: 'Ngày vào làm không hợp lệ' })
  @Type(() => Date)
  @IsOptional()
  ngayVaoLam?: Date;

  @IsString()
  @IsNotEmpty({ message: 'Chi nhánh không được để trống' })
  maChiNhanh: string;

  @IsString()
  @IsNotEmpty({ message: 'Loại nhân viên không được để trống' })
  loaiNhanVien: string;

  @IsString()
  @IsOptional()
  @Length(2, 2, { message: 'Mã khoa phải có đúng 2 ký tự' })
  maKhoa?: string;
}

export class UpdateEmployeeDto {
  @IsString()
  @IsOptional()
  @Length(2, 100, { message: 'Họ tên phải từ 2-100 ký tự' })
  hoTen?: string;

  @IsString()
  @IsOptional()
  @Matches(/^[0-9]{10}$/, { message: 'Số điện thoại phải có đúng 10 chữ số' })
  sdt?: string;

  @IsDate({ message: 'Ngày sinh không hợp lệ' })
  @Type(() => Date)
  @IsOptional()
  ngaySinh?: Date;

  @IsString()
  @IsOptional()
  maChiNhanh?: string;

  @IsString()
  @IsOptional()
  loaiNhanVien?: string;

  @IsString()
  @IsOptional()
  @Length(2, 2, { message: 'Mã khoa phải có đúng 2 ký tự' })
  maKhoa?: string;
}

// ===========================
// SALARY MANAGEMENT DTOs
// ===========================

export class UpdateSalaryDto {
  @IsNumber({}, { message: 'Lương mới phải là số' })
  @Min(0, { message: 'Lương không được âm' })
  @IsNotEmpty({ message: 'Lương mới không được để trống' })
  newSalary: number;

  @IsString()
  @IsOptional()
  reason?: string;
}

export class SalaryHistoryDto {
  @IsString()
  @IsOptional()
  loaiNhanVien?: string;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  startDate?: Date;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  endDate?: Date;
}

// ===========================
// FILTERING & PAGINATION DTOs
// ===========================

export class EmployeeFilterDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  maChiNhanh?: string;

  @IsOptional()
  @IsString()
  loaiNhanVien?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  @IsEnum(['hoTen', 'ngayVaoLam', 'loaiNhanVien'], { 
    message: 'Trường sắp xếp không hợp lệ' 
  })
  sortBy?: string = 'hoTen';

  @IsOptional()
  @IsString()
  @IsEnum(['ASC', 'DESC'], { message: 'Thứ tự sắp xếp phải là ASC hoặc DESC' })
  sortOrder?: 'ASC' | 'DESC' = 'ASC';
}

// ===========================
// STATISTICS DTOs
// ===========================

export class EmployeeStatsDto {
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

// ===========================
// BULK OPERATIONS DTOs
// ===========================

export class BulkAssignBranchDto {
  @IsString({ each: true })
  @IsNotEmpty({ message: 'Danh sách nhân viên không được để trống' })
  maNhanVienList: string[];

  @IsString()
  @IsNotEmpty({ message: 'Chi nhánh không được để trống' })
  maChiNhanh: string;
}

export class BulkUpdateSalaryDto {
  @IsString()
  @IsNotEmpty({ message: 'Loại nhân viên không được để trống' })
  loaiNhanVien: string;

  @IsNumber({}, { message: 'Phần trăm tăng lương phải là số' })
  @Min(-100, { message: 'Phần trăm tăng lương không được nhỏ hơn -100%' })
  @Max(1000, { message: 'Phần trăm tăng lương không được lớn hơn 1000%' })
  percentageIncrease: number;

  @IsString()
  @IsOptional()
  reason?: string;
}
