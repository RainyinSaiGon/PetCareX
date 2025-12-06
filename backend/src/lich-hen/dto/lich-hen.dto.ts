import { IsString, IsOptional, IsDateString, MaxLength, IsNumber } from 'class-validator';

export class CreateLichHenDto {
  @IsString()
  @MaxLength(6)
  maLichHen: string;

  @IsNumber()
  maKhachHang: number;

  @IsNumber()
  @IsOptional()
  maThuCung?: number;

  @IsString()
  @MaxLength(5)
  @IsOptional()
  maBacSi?: string;

  @IsString()
  @MaxLength(4)
  maChiNhanh: string;

  @IsString()
  @MaxLength(5)
  @IsOptional()
  maDichVuYTe?: string;

  @IsDateString()
  ngayHen: string;

  @IsString()
  @MaxLength(5)
  gioHen: string; // Format: "HH:mm"

  @IsString()
  @MaxLength(20)
  @IsOptional()
  trangThai?: string; // "Đã đặt", "Hoàn thành", "Đã hủy"

  @IsString()
  @IsOptional()
  ghiChu?: string;
}

export class UpdateLichHenDto {
  @IsNumber()
  @IsOptional()
  maKhachHang?: number;

  @IsNumber()
  @IsOptional()
  maThuCung?: number;

  @IsString()
  @MaxLength(5)
  @IsOptional()
  maBacSi?: string;

  @IsString()
  @MaxLength(5)
  @IsOptional()
  maDichVuYTe?: string;

  @IsDateString()
  @IsOptional()
  ngayHen?: string;

  @IsString()
  @MaxLength(5)
  @IsOptional()
  gioHen?: string;

  @IsString()
  @MaxLength(20)
  @IsOptional()
  trangThai?: string;

  @IsString()
  @IsOptional()
  ghiChu?: string;
}
