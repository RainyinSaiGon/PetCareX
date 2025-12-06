import { KhachHang } from './khach-hang.model';
import { ThuCung } from './thu-cung.model';
import { NhanVien } from './nhan-vien.model';
import { ChiNhanh } from './chi-nhanh.model';

export interface LichHen {
  maLichHen: string;
  ngayHen: Date;
  trangThai: string;
  ghiChu?: string;
  maKhachHang: number;
  maThuCung: number;
  maBacSi?: string;
  maChiNhanh?: string;
  khachHang?: KhachHang;
  thuCung?: ThuCung;
  bacSi?: NhanVien;
  chiNhanh?: ChiNhanh;
}

export interface CreateLichHenDto {
  maLichHen: string;
  ngayHen: string;
  trangThai?: string;
  ghiChu?: string;
  maKhachHang: number;
  maThuCung: number;
  maBacSi?: string;
  maChiNhanh?: string;
}

export interface UpdateLichHenDto extends Partial<Omit<CreateLichHenDto, 'maLichHen'>> {}

export type TrangThaiLichHen = 'Chờ xác nhận' | 'Đã xác nhận' | 'Hoàn thành' | 'Đã hủy';
