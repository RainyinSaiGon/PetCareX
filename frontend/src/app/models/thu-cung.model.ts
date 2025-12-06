export interface ThuCung {
  maThuCung: number;
  tenThuCung: string;
  gioiTinh?: string;
  mauLong?: string;
  canNang?: number;
  ngaySinh?: Date;
  maKhachHang: number;
  maChungLoai?: string;
  // Extended fields for UI
  loaiThuCung?: string; // From chungLoai.loai.tenLoai
  giongLoai?: string;   // From chungLoai.tenChungLoai
  khachHang?: {
    maKhachHang: number;
    hoTen: string;
    soDienThoai: string;
  };
  chungLoai?: ChungLoaiThuCung;
}

export interface ChungLoaiThuCung {
  maChungLoai: string;
  tenChungLoai: string;
  maLoai: string;
  loai?: LoaiThuCung;
}

export interface LoaiThuCung {
  maLoai: string;
  tenLoai: string;
}

export interface CreateThuCungDto {
  tenThuCung: string;
  gioiTinh?: string;
  mauLong?: string;
  canNang?: number;
  ngaySinh?: string;
  maKhachHang: number;
  maChungLoai?: string;
}

export interface UpdateThuCungDto extends Partial<CreateThuCungDto> {}
