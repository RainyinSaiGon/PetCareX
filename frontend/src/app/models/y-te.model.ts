// Y Te (Medical) Models - Matching Backend Entities

import { ThuCung } from './thu-cung.model';
import { NhanVien } from './nhan-vien.model';

// ========================
// GIAY KHAM BENH TONG QUAT - Backend Entity GIAYKHAMBENHTONGQUAT
// ========================
export interface GiayKhamBenhTongQuat {
  maGiayKhamTongQuat: number;  // int - Primary Key (auto-generated)
  nhietDo?: number;            // float
  moTa?: string;               // nvarchar(100)
  maThuCung?: number;          // int
  maPhieuDangKyTiemPhong?: number; // int
  // Relations
  thuCung?: ThuCung;
  phieuDangKy?: PhieuDangKyTiemPhong;
  // Extended for UI
  ngayKham?: Date;
  ketQuaKham?: string;
  trangThai?: 'dang_kham' | 'hoan_thanh' | 'cho_ket_qua';
  bacSi?: NhanVien;
}

// ========================
// GIAY KHAM BENH CHUYEN KHOA - Backend Entity GIAYKHAMBENHCHUYENKHOA
// ========================
export interface GiayKhamBenhChuyenKhoa {
  maGiayKhamChuyenKhoa: number;  // int - Primary Key (auto-generated)
  ngayKham?: Date;               // date
  ngayTaiKham?: Date;            // date
  maBacSi?: string;              // char(5)
  maThuCung?: number;            // int
  maDichVu?: string;             // char(5)
  // Relations
  bacSi?: NhanVien;
  thuCung?: ThuCung;
  dichVuYTe?: DichVuYTe;
  // Extended for UI
  ketQuaKham?: string;
  ghiChu?: string;
}

// ========================
// GIAY TIEM PHONG - Backend Entity GIAYTIEMPHONG
// ========================
export interface GiayTiemPhong {
  maGiayTiem: number;          // int - Primary Key (auto-generated)
  maVaccine?: string;          // char(5)
  maBacSi?: string;            // char(5)
  lieuLuong?: number;          // int
  ngayTiem?: Date;             // datetime
  maGiayKhamTongQuat?: number; // int
  // Relations
  vaccine?: Vaccine;
  bacSi?: NhanVien;
  giayKhamTongQuat?: GiayKhamBenhTongQuat;
  // Extended for UI
  thuCung?: ThuCung;
  ngayTiemTiepTheo?: Date;
  ghiChu?: string;
  trangThai?: 'da_tiem' | 'chua_tiem' | 'huy';
}

// ========================
// VACCINE - Backend Entity VACCINE
// ========================
export interface Vaccine {
  maVaccine: string;           // char(5) - Primary Key
  tenVaccine?: string;         // nvarchar(20)
  loaiVaccine?: string;        // nvarchar(50)
  giaVaccine?: number;         // int
  // Extended for UI
  nhaSanXuat?: string;
  moTa?: string;
  soLuongTon?: number;
}

// ========================
// DICH VU Y TE - Backend Entity DICHVUYTE
// ========================
export interface DichVuYTe {
  maDichVu: string;            // char(5) - Primary Key
  tenDichVu?: string;          // nvarchar(50)
  loaiDichVu?: string;         // nvarchar(10)
  // Extended for UI
  moTa?: string;
  giaDichVu?: number;
  thoiGianThucHien?: number;   // minutes
}

// ========================
// TOA THUOC - Backend Entity TOATHUOC
// ========================
export interface ToaThuoc {
  soToaThuoc: string;          // nvarchar(10) - Primary Key
  maThuCung?: number;          // int
  maBacSi?: string;            // char(5)
  ngayKeDon?: Date;            // date
  // Relations
  thuCung?: ThuCung;
  bacSi?: NhanVien;
  chiTietToaThuoc?: ChiTietToaThuoc[];
  // Extended for UI
  ghiChu?: string;
  trangThai?: 'moi' | 'da_lay_thuoc' | 'hoan_thanh';
}

// CHI TIET TOA THUOC - Backend Entity CHITIETTOATHUOC
export interface ChiTietToaThuoc {
  soToaThuoc: string;          // nvarchar(10) - Composite Primary Key
  maSanPham: string;           // char(5) - Composite Primary Key
  soLuong?: number;            // int
  cachDung?: string;           // nvarchar(100)
  // Extended
  sanPham?: {
    maSanPham: string;
    tenSanPham: string;
    giaTienSanPham: number;
  };
}

// ========================
// PHIEU DANG KY TIEM PHONG - Backend Entity PHIEUDANGKYTIEMPHONG
// ========================
export interface PhieuDangKyTiemPhong {
  maPhieu: number;             // int - Primary Key (auto-generated)
  ngayDangKy?: Date;           // date
  maKhachHang?: number;        // int
  maThuCung?: number;          // int
  maChiNhanh?: string;         // char(4)
  // Relations
  khachHang?: { maKhachHang: number; hoTen: string; soDienThoai: string };
  thuCung?: ThuCung;
  // Extended for UI
  trangThai?: 'cho_xac_nhan' | 'da_xac_nhan' | 'da_tiem' | 'huy';
  ghiChu?: string;
}

// ========================
// DANH GIA Y TE - Backend Entity DANHGIAYTE
// ========================
export interface DanhGiaYTe {
  maDanhGiaYTe: number;        // int - Primary Key (auto-generated)
  binhLuan?: string;           // nvarchar(200)
  mucDoHaiLong?: number;       // int
  thaiDoNhanVien?: number;     // int
  diemChatLuongDichVu?: number;// int
  maHoaDon?: number;           // int
  // Extended for UI
  hoaDon?: { maHoaDon: number; ngayLap: Date };
  khachHang?: { maKhachHang: number; hoTen: string };
  ngayDanhGia?: Date;
}

// ========================
// LICH SU BENH AN
// ========================
export interface LichSuBenhAn {
  thuCung: ThuCung;
  khamTongQuat: GiayKhamBenhTongQuat[];
  khamChuyenKhoa: GiayKhamBenhChuyenKhoa[];
  tiemPhong: GiayTiemPhong[];
  toaThuoc: ToaThuoc[];
}

// ========================
// DTOs for Creating/Updating
// ========================
export interface CreateKhamTongQuatDto {
  nhietDo?: number;
  moTa?: string;
  maThuCung: number;
  maPhieuDangKyTiemPhong?: number;
}

export interface CreateKhamChuyenKhoaDto {
  ngayKham?: string;
  ngayTaiKham?: string;
  maBacSi: string;
  maThuCung: number;
  maDichVu?: string;
}

export interface CreateToaThuocDto {
  soToaThuoc: string;
  maThuCung: number;
  maBacSi: string;
  ngayKeDon?: string;
  ghiChu?: string;
  chiTiet?: {
    maSanPham: string;
    soLuong: number;
    cachDung?: string;
  }[];
}

export interface CreateGiayTiemPhongDto {
  maVaccine: string;
  maBacSi: string;
  lieuLuong?: number;
  ngayTiem?: string;
  maGiayKhamTongQuat: number;
}

export interface CreatePhieuDangKyDto {
  maKhachHang: number;
  maThuCung: number;
  maChiNhanh?: string;
  ngayDangKy?: string;
}

// ========================
// Filters & Responses
// ========================
export interface YTeFilter {
  search?: string;
  maThuCung?: number;
  maBacSi?: string;
  maChiNhanh?: string;
  fromDate?: string;
  toDate?: string;
  trangThai?: string;
  page?: number;
  limit?: number;
}

export interface YTeStatistics {
  tongKhamTongQuat: number;
  tongKhamChuyenKhoa: number;
  tongTiemPhong: number;
  tongToaThuoc: number;
  doanhThuDichVu: number;
  doanhThuVaccine: number;
}

// ========================
// Constants
// ========================
export const LOAI_DICH_VU = [
  { value: 'Khám', label: 'Khám bệnh', color: '#3b82f6' },
  { value: 'Tiêm', label: 'Tiêm phòng', color: '#10b981' },
  { value: 'Xét nghiệm', label: 'Xét nghiệm', color: '#8b5cf6' },
  { value: 'Phẫu thuật', label: 'Phẫu thuật', color: '#ef4444' },
  { value: 'Khác', label: 'Khác', color: '#6b7280' }
];

export const LOAI_VACCINE = [
  { value: 'Phòng dại', label: 'Phòng dại', color: '#ef4444' },
  { value: 'Tổng hợp', label: 'Tổng hợp', color: '#3b82f6' },
  { value: 'Khác', label: 'Khác', color: '#6b7280' }
];

export const TRANG_THAI_KHAM = [
  { value: 'dang_kham', label: 'Đang khám', color: '#f59e0b' },
  { value: 'hoan_thanh', label: 'Hoàn thành', color: '#10b981' },
  { value: 'cho_ket_qua', label: 'Chờ kết quả', color: '#6b7280' }
];

export function formatTemperature(temp: number): string {
  return temp ? `${temp}°C` : '--';
}
