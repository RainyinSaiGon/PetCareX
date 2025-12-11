import { IsOptional, IsDateString, IsEnum, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export enum RevenueTimeFrame {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
}

export class RevenueReportDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsEnum(RevenueTimeFrame)
  timeFrame?: RevenueTimeFrame;

  @IsOptional()
  maChiNhanh?: string;
}

export class TopServicesDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  months?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number;
}

export class RevenueReportResponse {
  totalRevenue: number;
  productRevenue: number;
  serviceRevenue: number;
  revenueByPeriod: {
    period: string;
    revenue: number;
    productRevenue: number;
    serviceRevenue: number;
  }[];
  revenueByBranch?: {
    maChiNhanh: string;
    tenChiNhanh: string;
    revenue: number;
  }[];
  comparison?: {
    previousPeriod: number;
    changePercentage: number;
  };
}

export class TopServiceResponse {
  maDichVu: string;
  tenDichVu: string;
  soLanSuDung: number;
  tongDoanhThu: number;
  trungBinhGia: number;
}

export class MemberTierStatisticsResponse {
  totalMembers: number;
  tierDistribution: {
    maHang: string;
    tenHang: string;
    soLuongThanhVien: number;
    tyLe: number;
    tongChiTieu: number;
    trungBinhChiTieu: number;
  }[];
  recentUpgrades: {
    maKhachHang: number;
    tenKhachHang: string;
    hangCu: string;
    hangMoi: string;
    ngayNangHang: Date;
  }[];
  tierRevenue: {
    maHang: string;
    tenHang: string;
    doanhThu: number;
  }[];
}

export class DashboardSummaryResponse {
  revenue: {
    today: number;
    thisWeek: number;
    thisMonth: number;
    thisYear: number;
  };
  customers: {
    total: number;
    new: number;
    active: number;
    members: number;
  };
  appointments: {
    today: number;
    thisWeek: number;
    pending: number;
    completed: number;
  };
  employees: {
    total: number;
    active: number;
    byType: {
      loaiNhanVien: string;
      soLuong: number;
    }[];
  };
  topProducts: {
    maSanPham: string;
    tenSanPham: string;
    soLuongBan: number;
    doanhThu: number;
  }[];
  topServices: TopServiceResponse[];
  revenueChart: {
    labels: string[];
    data: number[];
  };
}
