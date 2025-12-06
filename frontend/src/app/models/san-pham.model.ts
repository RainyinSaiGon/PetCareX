// San Pham (Product) Models - Matching Backend Entity SANPHAM

export interface SanPham {
  maSanPham: string;           // char(5) - Primary Key
  tenSanPham: string;          // nvarchar(50)
  giaTienSanPham: number;      // int
  loaiSanPham: string;         // nvarchar(50)
  // Extended fields for UI
  moTa?: string;
  hinhAnh?: string;
  soLuongTon?: number;
  trangThai?: 'con_hang' | 'het_hang' | 'ngung_kinh_doanh';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateSanPhamDto {
  maSanPham: string;
  tenSanPham: string;
  giaTienSanPham: number;
  loaiSanPham: string;
  moTa?: string;
}

export interface UpdateSanPhamDto {
  tenSanPham?: string;
  giaTienSanPham?: number;
  loaiSanPham?: string;
  moTa?: string;
}

export interface SanPhamFilter {
  search?: string;
  loaiSanPham?: string;
  minGia?: number;
  maxGia?: number;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface SanPhamResponse {
  data: SanPham[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Product categories for filtering
export const LOAI_SAN_PHAM = [
  { value: 'Thức ăn', label: 'Thức ăn', color: '#f59e0b' },
  { value: 'Đồ chơi', label: 'Đồ chơi', color: '#ec4899' },
  { value: 'Phụ kiện', label: 'Phụ kiện', color: '#8b5cf6' },
  { value: 'Vệ sinh', label: 'Vệ sinh', color: '#06b6d4' },
  { value: 'Thuốc', label: 'Thuốc', color: '#10b981' },
  { value: 'Khác', label: 'Khác', color: '#6b7280' }
];

// Helper function to get product color
export function getSanPhamColor(loaiSanPham: string): string {
  const loai = LOAI_SAN_PHAM.find(l => 
    l.value === loaiSanPham || 
    l.label.toLowerCase().includes(loaiSanPham?.toLowerCase() || '')
  );
  return loai?.color || '#6b7280';
}

// Loai San Pham interface
export interface Loai {
  maLoai: string;
  tenLoai: string;
  moTa?: string;
  color?: string;
}

// Format currency
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0);
}

// Format short currency (M for millions, K for thousands)
export function formatShortCurrency(value: number): string {
  if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M';
  if (value >= 1000) return (value / 1000).toFixed(0) + 'K';
  return value.toString();
}
