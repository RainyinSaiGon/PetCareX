export interface ThuCung {
  MaThuCung: number;
  MaKhachHang: number;
  TenThuCung: string;
  MaChungLoai: number;
  NgaySinh?: Date;
  GioiTinh?: string;
  CanNang?: number;
  MauSac?: string;
  DacDiem?: string;
  NgayTao?: Date;
  ChungLoai?: {
    MaChungLoai: number;
    TenChungLoai: string;
  };
}

export interface CreateThuCungDto {
  MaKhachHang: number;
  TenThuCung: string;
  MaChungLoai: number;
  NgaySinh?: string;
  GioiTinh?: string;
  CanNang?: number;
  MauSac?: string;
  DacDiem?: string;
}

export interface UpdateThuCungDto {
  TenThuCung?: string;
  MaChungLoai?: number;
  NgaySinh?: string;
  GioiTinh?: string;
  CanNang?: number;
  MauSac?: string;
  DacDiem?: string;
}

export interface ChungLoaiThuCung {
  MaChungLoai: number;
  TenChungLoai: string;
  MaLoai: number;
}
