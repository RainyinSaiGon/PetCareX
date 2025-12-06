export interface KhachHang {
  maKhachHang: number;
  hoTen: string;
  soDienThoai: string;
  email?: string;
  diaChi?: string;
  ngaySinh?: Date;
  gioiTinh?: string;
}

export interface KhachHangThanhVien extends KhachHang {
  maHangThanhVien?: string;
  diemTichLuy?: number;
  ngayDangKy?: Date;
}

export interface HangThanhVien {
  maHang: string;
  tenHang: string;
  diemToiThieu: number;
  phanTramGiamGia: number;
  moTa?: string;
}

export interface CreateKhachHangDto {
  hoTen: string;
  soDienThoai: string;
  email?: string;
  diaChi?: string;
  ngaySinh?: string;
  gioiTinh?: string;
}

export interface UpdateKhachHangDto extends Partial<CreateKhachHangDto> {}
