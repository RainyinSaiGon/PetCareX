import { IsNotEmpty, IsString, IsOptional, IsInt, IsDecimal } from 'class-validator';

// FB-02: Branch Revenue Reports DTOs
export class RevenueReportDto {
  MaChiNhanh: string;
  TenChiNhanh: string;
  TotalRevenue: number;
  TransactionCount: number;
  AverageTransactionValue: number;
  TopProductsCount: number;
  TopServicesCount: number;
  ReportDate: Date;
}

export class BranchRevenueListDto {
  data: RevenueReportDto[];
  total: number;
  page: number;
  totalPages: number;
}

export class DateRangeReportDto {
  startDate: Date;
  endDate: Date;
  branchId?: string;
}

export class RevenueDetailDto {
  MaHoaDon: number;
  NgayLap: Date;
  TongTien: number;
  GiamGia: number;
  NhanVienName: string;
  KhachHangName: string;
  ItemCount: number;
}

export class RevenueDetailListDto {
  data: RevenueDetailDto[];
  total: number;
  totalRevenue: number;
  page: number;
  totalPages: number;
}

export class MonthlyRevenueChartDto {
  month: number;
  year: number;
  totalRevenue: number;
  transactionCount: number;
}

export class ServiceRevenueDto {
  MaDichVu: number;
  TenDichVu: string;
  TotalRevenue: number;
  UsageCount: number;
  AveragePrice: number;
  PercentageOfTotal: number;
}

export class ProductRevenueDto {
  MaSanPham: number;
  TenSanPham: string;
  TotalRevenue: number;
  UnitsSold: number;
  AveragePrice: number;
  PercentageOfTotal: number;
}

export class BranchComparisonDto {
  branches: RevenueReportDto[];
  topBranch: RevenueReportDto;
  totalSystemRevenue: number;
  reportPeriod: string;
}
