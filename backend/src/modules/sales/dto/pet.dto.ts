import { IsString, IsOptional, IsDateString, IsNotEmpty } from 'class-validator';

export class CreatePetDto {
  @IsNotEmpty()
  @IsString()
  TenThuCung: string;

  @IsNotEmpty()
  @IsString()
  MaChungLoai: string;

  @IsOptional()
  @IsDateString()
  NgaySinhThuCung?: Date;
}

export class UpdatePetDto {
  @IsOptional()
  @IsString()
  TenThuCung?: string;

  @IsOptional()
  @IsString()
  MaChungLoai?: string;

  @IsOptional()
  @IsDateString()
  NgaySinhThuCung?: Date;
}

export class PetResponseDto {
  MaThuCung: number;
  MaKhachHang: number;
  TenThuCung: string;
  MaChungLoai: string;
  NgaySinhThuCung?: Date;
  ChungLoai?: {
    MaChungLoaiThuCung: string;
    TenChungLoaiThuCung: string;
    MaLoaiThuCung: string;
  };
}
