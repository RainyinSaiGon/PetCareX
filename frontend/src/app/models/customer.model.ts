export interface KhachHang {
  MaKhachHang: number;
  HoTen: string;
  SoDienThoai: string;
  DiaChi?: string;
  Email?: string;
  NgayTao?: Date;
}

export interface CreateKhachHangDto {
  HoTen: string;
  SoDienThoai: string;
  DiaChi?: string;
  Email?: string;
}

export interface UpdateKhachHangDto {
  HoTen?: string;
  SoDienThoai?: string;
  DiaChi?: string;
  Email?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
