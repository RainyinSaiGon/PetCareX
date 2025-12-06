// Nhan Vien (Staff) Models - Matching Backend Entity NHANVIEN

export interface NhanVien {
  maNhanVien: string;          // char(5) - Primary Key
  hoTen: string;               // nvarchar(50)
  ngayVaoLam?: Date;           // date
  ngayNghiLam?: Date | null;   // date
  ngaySinh?: Date;             // date
  sdt?: string;                // char(10)
  maChiNhanh?: string;         // char(4)
  loaiNhanVien?: string;       // nvarchar(20)
  maKhoa?: string;             // char(2)
  // Relations
  chiNhanh?: ChiNhanhRef;
  khoa?: Khoa;
  loaiNhanVienLuong?: LoaiNhanVienLuong;
  // Extended fields for UI
  email?: string;
  diaChi?: string;
  gioiTinh?: 'Nam' | 'Nữ' | 'Khác';
  avatar?: string;
  trangThai?: 'dang_lam_viec' | 'nghi_phep' | 'da_nghi_viec';
}

// Chi nhánh reference (simplified)
export interface ChiNhanhRef {
  maChiNhanh: string;
  tenChiNhanh: string;
  diaChi?: string;
}

// Khoa (Department) - Backend Entity KHOA
export interface Khoa {
  maKhoa: string;              // char(2) - Primary Key
  tenKhoa: string;             // nvarchar(50)
  truongKhoa?: string;         // char(5)
  truongKhoaNhanVien?: NhanVien;
}

// Loại Nhân Viên Lương - Backend Entity LOAINHANVIEN_LUONG
export interface LoaiNhanVienLuong {
  loaiNhanVien: string;        // nvarchar(20) - Primary Key
  luong: number;               // decimal(9,0)
}

// Loai Nhan Vien for dropdowns/filters
export interface LoaiNhanVien {
  maLoaiNhanVien: number;
  tenLoai: string;
  moTa?: string;
}

export interface CreateNhanVienDto {
  maNhanVien: string;
  hoTen: string;
  sdt?: string;
  ngayVaoLam?: string;
  ngaySinh?: string;
  maChiNhanh?: string;
  loaiNhanVien?: string;
  maKhoa?: string;
  // Extended
  email?: string;
  diaChi?: string;
  gioiTinh?: 'Nam' | 'Nữ' | 'Khác';
  tenTaiKhoan?: string;
  matKhau?: string;
}

export interface UpdateNhanVienDto extends Partial<Omit<CreateNhanVienDto, 'maNhanVien'>> {}

export interface NhanVienFilter {
  search?: string;
  loaiNhanVien?: string;
  maChiNhanh?: string;
  maKhoa?: string;
  trangThai?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface NhanVienResponse {
  data: NhanVien[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Lich Lam Viec Bac Si - Backend Entity LICHLAMVIECBACSI
export interface LichLamViecBacSi {
  maNhanVien: string;          // char(5) - Primary Key
  ngayLamViec: Date;           // date - Primary Key
  gioiHanKham: number;         // int
  bacSi?: NhanVien;
}

// Staff types for filtering
export const LOAI_NHAN_VIEN = [
  { value: 'Bác sĩ', label: 'Bác sĩ', color: '#10b981' },
  { value: 'Y tá', label: 'Y tá', color: '#06b6d4' },
  { value: 'Lễ tân', label: 'Lễ tân', color: '#8b5cf6' },
  { value: 'Nhân viên kho', label: 'Nhân viên kho', color: '#f59e0b' },
  { value: 'Quản lý', label: 'Quản lý', color: '#ec4899' },
  { value: 'Khác', label: 'Khác', color: '#6b7280' }
];

// Helper functions
export function getNhanVienColor(loaiNhanVien: string): string {
  const loai = LOAI_NHAN_VIEN.find(l => 
    l.value === loaiNhanVien || 
    loaiNhanVien?.toLowerCase().includes(l.value.toLowerCase())
  );
  return loai?.color || '#6b7280';
}

export function getInitials(name: string): string {
  if (!name) return '??';
  return name.split(' ').map(n => n[0]).slice(-2).join('').toUpperCase();
}

export function calculateAge(birthDate: Date | string): number {
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

export function getWorkDuration(startDate: Date | string): string {
  const start = new Date(startDate);
  const today = new Date();
  const years = today.getFullYear() - start.getFullYear();
  const months = today.getMonth() - start.getMonth();
  
  const totalMonths = years * 12 + months;
  if (totalMonths < 12) {
    return `${totalMonths} tháng`;
  }
  const y = Math.floor(totalMonths / 12);
  const m = totalMonths % 12;
  return m > 0 ? `${y} năm ${m} tháng` : `${y} năm`;
}
