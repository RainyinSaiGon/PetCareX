export interface KhachHang {
  MaKhachHang: number;
  HoTen: string;
  SoDienThoai: string;
  Email?: string;
  CCCD?: string;
  DiaChi?: string;
  NgaySinh?: Date;
  GioiTinh?: string;
  TongChiTieu?: number;
  TenHang?: string;
  NgayNangHang?: Date;
  HangCu?: string;
  NgayTao?: Date;
}

export interface CreateKhachHangDto {
  HoTen: string;
  SoDienThoai: string;
  Email?: string;
  CCCD?: string;
  DiaChi?: string;
  NgaySinh?: Date;
  GioiTinh?: string;
}

export interface UpdateKhachHangDto {
  HoTen?: string;
  SoDienThoai?: string;
  Email?: string;
  CCCD?: string;
  DiaChi?: string;
  NgaySinh?: Date;
  GioiTinh?: string;
}

export interface CustomerStatistics {
  totalCustomers: number;
  totalSpending: number;
  tierDistribution: { [tier: string]: number };
  topSpenders?: KhachHang[];
}

export interface InactiveCustomer {
  MaKhachHang: number;
  HoTen: string;
  SoDienThoai: string;
  LastPurchaseDate?: Date;
  DaysSinceLastPurchase: number;
}

export interface SpendingTrend {
  month: string;
  totalSpending: number;
  invoiceCount: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
