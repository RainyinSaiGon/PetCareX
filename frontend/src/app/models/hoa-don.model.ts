import { KhachHang } from './khach-hang.model';
import { NhanVien } from './nhan-vien.model';

export interface HoaDon {
  maHoaDon: number;
  ngayLap: Date;
  giamGia?: number;
  tongTien: number;
  maNhanVien: string;
  maKhachHang: number;
  nhanVien?: NhanVien;
  khachHang?: KhachHang;
  ctSanPhams?: CtSanPham[];
  ctDichVuYTes?: CtDichVuYTe[];
}

export interface CtSanPham {
  maHoaDon: number;
  maSanPham: string;
  soLuong: number;
  donGia: number;
  sanPham?: {
    maSanPham: string;
    tenSanPham: string;
  };
}

export interface CtDichVuYTe {
  maHoaDon: number;
  maDichVuYTe: string;
  soLuong: number;
  donGia: number;
  dichVuYTe?: {
    maDichVuYTe: string;
    tenDichVuYTe: string;
  };
}

export interface CreateHoaDonDto {
  ngayLap?: string;
  giamGia?: number;
  maNhanVien: string;
  maKhachHang: number;
  sanPhams?: {
    maSanPham: string;
    soLuong: number;
    donGia: number;
  }[];
  dichVuYTes?: {
    maDichVuYTe: string;
    soLuong: number;
    donGia: number;
  }[];
}

export interface DanhGiaMuaHang {
  maDanhGia: number;
  binhLuan?: string;
  mucDoHaiLong?: number;
  chatLuongSanPham?: number;
  thoiGianGiaoHang?: number;
  maHoaDon: number;
}
