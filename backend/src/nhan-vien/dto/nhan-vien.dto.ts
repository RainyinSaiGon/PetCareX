import { IsString, IsOptional, IsDateString, MaxLength } from 'class-validator';

export class CreateNhanVienDto {
  @IsString()
  @MaxLength(5)
  maNhanVien: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  hoTen?: string;

  @IsDateString()
  @IsOptional()
  ngayVaoLam?: string;

  @IsDateString()
  @IsOptional()
  ngaySinh?: string;

  @IsString()
  @IsOptional()
  @MaxLength(10)
  sdt?: string;

  @IsString()
  @IsOptional()
  @MaxLength(4)
  maChiNhanh?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  loaiNhanVien?: string;

  @IsString()
  @IsOptional()
  @MaxLength(2)
  maKhoa?: string;
}

export class UpdateNhanVienDto {
  @IsString()
  @IsOptional()
  @MaxLength(50)
  hoTen?: string;

  @IsDateString()
  @IsOptional()
  ngayNghiLam?: string;

  @IsDateString()
  @IsOptional()
  ngaySinh?: string;

  @IsString()
  @IsOptional()
  @MaxLength(10)
  sdt?: string;

  @IsString()
  @IsOptional()
  @MaxLength(4)
  maChiNhanh?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  loaiNhanVien?: string;

  @IsString()
  @IsOptional()
  @MaxLength(2)
  maKhoa?: string;
}
