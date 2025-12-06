// Chi Nhanh (Branch) Models - Matching Backend Entity CHINHANH

import { NhanVien } from './nhan-vien.model';

export interface ChiNhanh {
  maChiNhanh: string;          // char(4) - Primary Key
  tenChiNhanh: string;         // nvarchar(70)
  diaChi?: string;             // nvarchar(150)
  sdt?: string;                // char(10)
  maQuanLy?: string;           // char(5)
  thoiGianMoCua?: string;      // time
  thoiGianDongCua?: string;    // time
  // Relations
  quanLy?: NhanVien;
  nhanViens?: NhanVien[];
  // Extended for UI
  email?: string;
  hinhAnh?: string;
  trangThai?: 'hoat_dong' | 'tam_ngung' | 'dong_cua';
  tongNhanVien?: number;
  tongKho?: number;
}

export interface CreateChiNhanhDto {
  maChiNhanh: string;
  tenChiNhanh: string;
  diaChi?: string;
  sdt?: string;
  maQuanLy?: string;
  thoiGianMoCua?: string;
  thoiGianDongCua?: string;
  email?: string;
}

export interface UpdateChiNhanhDto extends Partial<Omit<CreateChiNhanhDto, 'maChiNhanh'>> {}

export interface ChiNhanhFilter {
  search?: string;
  trangThai?: string;
  page?: number;
  limit?: number;
}

export interface ChiNhanhResponse {
  data: ChiNhanh[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Kho (Warehouse) - Backend Entity KHO
export interface Kho {
  maKho: string;               // char(4) - Primary Key
  nhanVienPhuTrach?: string;   // char(5)
  nhanVien?: NhanVien;
  // Extended for UI
  tenKho?: string;
  maChiNhanh?: string;
  chiNhanh?: ChiNhanh;
  tongSanPham?: number;
  tongVaccine?: number;
}

// Kho San Pham - Backend Entity KHOSANPHAM
export interface KhoSanPham {
  maChiNhanh: string;          // char(4) - Composite Primary Key
  maSanPham: string;           // char(5) - Composite Primary Key
  soLuong: number;             // int
  sanPham?: {
    maSanPham: string;
    tenSanPham: string;
    giaTienSanPham: number;
    loaiSanPham: string;
  };
  chiNhanh?: ChiNhanh;
}

// Kho Vaccine - Backend Entity KHOVACCINE  
export interface KhoVaccine {
  maKho: string;               // char(4) - Composite Primary Key
  maVaccine: string;           // char(5) - Composite Primary Key
  ngaySanXuat?: Date;          // date
  hanSuDung?: Date;            // date
  soLuong: number;             // int
  vaccine?: {
    maVaccine: string;
    tenVaccine: string;
    loaiVaccine: string;
    giaVaccine: number;
  };
  kho?: Kho;
}

// Dashboard & Reports
export interface DoanhThuReport {
  ngay: string;
  soHoaDon: number;
  tongDoanhThu: number;
  tongGiamGia: number;
  doanhThuTrungBinh: number;
}

export interface DashboardSummary {
  totalStaff: number;
  totalProducts: number;
  totalCustomers: number;
  totalPets: number;
  totalAppointments: number;
  monthlyRevenue: number;
  monthlyOrders: number;
  monthlyGrowth: number;
}

export interface BranchStatistics {
  maChiNhanh: string;
  tenChiNhanh: string;
  tongNhanVien: number;
  tongDoanhThu: number;
  tongHoaDon: number;
  tongLichHen: number;
}

// Branch status options
export const TRANG_THAI_CHI_NHANH = [
  { value: 'hoat_dong', label: 'Đang hoạt động', icon: '🟢', color: '#10b981' },
  { value: 'tam_ngung', label: 'Tạm ngừng', icon: '🟡', color: '#f59e0b' },
  { value: 'dong_cua', label: 'Đóng cửa', icon: '🔴', color: '#ef4444' }
];

// Helper functions
export function formatTime(time: string): string {
  if (!time) return '--:--';
  return time.substring(0, 5);
}

export function isOpenNow(moCua: string, dongCua: string): boolean {
  if (!moCua || !dongCua) return false;
  const now = new Date();
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  return currentTime >= moCua.substring(0, 5) && currentTime <= dongCua.substring(0, 5);
}
