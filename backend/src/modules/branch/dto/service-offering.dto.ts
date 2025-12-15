import { IsNotEmpty, IsString, IsOptional, IsInt, IsDecimal } from 'class-validator';

// FB-07: Service Offering Management DTOs
export class CreateServiceOfferingDto {
  @IsNotEmpty({ message: 'Chi nhánh là bắt buộc' })
  @IsString()
  MaChiNhanh: string;

  @IsNotEmpty({ message: 'Dịch vụ là bắt buộc' })
  @IsString()
  MaDichVu: string;

  @IsOptional()
  @IsDecimal()
  GiaThanhLe?: number;

  @IsOptional()
  @IsString()
  GhiChu?: string;
}

export class UpdateServiceOfferingDto {
  @IsOptional()
  @IsDecimal()
  GiaThanhLe?: number;

  @IsOptional()
  @IsString()
  GhiChu?: string;
}

export class ServiceOfferingDto {
  MaChiNhanh: string;
  TenChiNhanh: string;
  MaDichVu: string;
  TenDichVu: string;
  GiaThanhLe: number;
  GhiChu: string;
  NgayTao: Date;
  IsActive: boolean;
}

export class ServiceOfferingListDto {
  data: ServiceOfferingDto[];
  total: number;
  page: number;
  totalPages: number;
}

export class BranchServiceMenuDto {
  MaChiNhanh: string;
  TenChiNhanh: string;
  Services: ServiceOfferingDto[];
  TotalServices: number;
}

export class ServicePopularityDto {
  MaDichVu: number;
  TenDichVu: string;
  UsageCount: number;
  TotalRevenue: number;
  AverageRating: number;
  IsOfferedByAll: boolean;
  OfferedByBranchCount: number;
}

export class ServicePopularityListDto {
  data: ServicePopularityDto[];
  total: number;
}
