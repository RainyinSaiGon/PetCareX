import { IsString, IsOptional, IsDateString, IsNumber, MaxLength } from 'class-validator';

export class CreateKhachHangDto {
  @IsString()
  @MaxLength(5)
  maKhachHang: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  hoTen?: string;

  @IsString()
  @IsOptional()
  @MaxLength(10)
  sdt?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  diaChi?: string;
}

export class UpdateKhachHangDto {
  @IsString()
  @IsOptional()
  @MaxLength(50)
  hoTen?: string;

  @IsString()
  @IsOptional()
  @MaxLength(10)
  sdt?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  diaChi?: string;
}

export class CreateThuCungDto {
  @IsString()
  @MaxLength(5)
  maThuCung: string;

  @IsString()
  @IsOptional()
  @MaxLength(5)
  maKhachHang?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  tenThuCung?: string;

  @IsNumber()
  @IsOptional()
  canNang?: number;

  @IsString()
  @IsOptional()
  @MaxLength(10)
  gioiTinh?: string;

  @IsDateString()
  @IsOptional()
  ngaySinh?: string;

  @IsString()
  @IsOptional()
  @MaxLength(2)
  maLoai?: string;
}

export class UpdateThuCungDto {
  @IsString()
  @IsOptional()
  @MaxLength(50)
  tenThuCung?: string;

  @IsNumber()
  @IsOptional()
  canNang?: number;

  @IsString()
  @IsOptional()
  @MaxLength(10)
  gioiTinh?: string;

  @IsDateString()
  @IsOptional()
  ngaySinh?: string;

  @IsString()
  @IsOptional()
  @MaxLength(2)
  maLoai?: string;
}
