import { IsString, IsOptional, IsDateString, IsNumber, IsArray, MaxLength, ValidateNested, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

// KHÁM BỆNH TỔNG QUÁT
// Entity: maGiayKhamTongQuat (auto), nhietDo, moTa, maThuCung, maPhieuDangKyTiemPhong
export class CreateKhamBenhTongQuatDto {
  @IsNumber()
  maThuCung: number;

  @IsNumber()
  @IsOptional()
  nhietDo?: number;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  moTa?: string;

  @IsNumber()
  @IsOptional()
  maPhieuDangKyTiemPhong?: number;
}

// KHÁM BỆNH CHUYÊN KHOA
// Entity: maGiayKhamChuyenKhoa (auto), ngayKham, ngayTaiKham, maBacSi, maThuCung, maDichVu
export class CreateKhamBenhChuyenKhoaDto {
  @IsNumber()
  maThuCung: number;

  @IsString()
  @MaxLength(5)
  maBacSi: string;

  @IsString()
  @MaxLength(5)
  @IsOptional()
  maDichVu?: string;

  @IsDateString()
  @IsOptional()
  ngayKham?: string;

  @IsDateString()
  @IsOptional()
  ngayTaiKham?: string;
}

// CHI TIẾT TOA THUỐC
export class ChiTietToaThuocDto {
  @IsString()
  @MaxLength(4)
  maThuoc: string;

  @IsNumber()
  @Min(1)
  soLuong: number;

  @IsString()
  @IsOptional()
  lieuDung?: string;
}

// TOA THUỐC
// Entity: soToaThuoc (PK), ngayKeDon, ghiChu, maThuCung (varchar), maBacSi
export class CreateToaThuocDto {
  @IsString()
  @MaxLength(6)
  soToaThuoc: string;

  @IsString()
  @MaxLength(5)
  maThuCung: string;  // Note: ToaThuoc entity uses varchar for maThuCung

  @IsString()
  @MaxLength(5)
  maBacSi: string;

  @IsDateString()
  @IsOptional()
  ngayKeDon?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  ghiChu?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChiTietToaThuocDto)
  @IsOptional()
  chiTiet?: ChiTietToaThuocDto[];
}

// ĐĂNG KÝ TIÊM PHÒNG
// Entity: maDangKy (auto), maKhachHang, maThuCung, ngayDangKy, maDichVu
export class CreatePhieuDangKyTiemPhongDto {
  @IsNumber()
  maKhachHang: number;

  @IsNumber()
  maThuCung: number;

  @IsString()
  @MaxLength(5)
  @IsOptional()
  maDichVu?: string;

  @IsString()
  loaiDangKy: 'Gói' | 'Lẻ';

  @IsString()
  @MaxLength(3)
  @IsOptional()
  maGoiVaccine?: string;

  @IsString()
  @MaxLength(5)
  @IsOptional()
  maVaccine?: string;
}

// GIẤY TIÊM PHÒNG
// Entity: maGiayTiem (auto), maVaccine, maBacSi, lieuLuong, ngayTiem, maGiayKhamTongQuat
export class CreateGiayTiemPhongDto {
  @IsString()
  @MaxLength(5)
  maVaccine: string;

  @IsString()
  @MaxLength(5)
  maBacSi: string;

  @IsString()
  @MaxLength(4)
  maKho: string;  // For checking vaccine inventory

  @IsNumber()
  @IsOptional()
  lieuLuong?: number;

  @IsDateString()
  @IsOptional()
  ngayTiem?: string;

  @IsNumber()
  @IsOptional()
  maGiayKhamTongQuat?: number;
}

// ĐÁNH GIÁ Y TẾ
// Entity: maDanhGia (auto), binhLuan, mucDoHaiLong, thaiDoNhanVien, diemChatLuongDichVu, maHoaDon
export class CreateDanhGiaYTeDto {
  @IsNumber()
  maHoaDon: number;

  @IsNumber()
  @Min(1)
  @Max(5)
  mucDoHaiLong: number;

  @IsNumber()
  @Min(1)
  @Max(5)
  @IsOptional()
  thaiDoNhanVien?: number;

  @IsNumber()
  @Min(1)
  @Max(5)
  @IsOptional()
  diemChatLuongDichVu?: number;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  binhLuan?: string;
}
