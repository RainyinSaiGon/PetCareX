import { IsString, IsOptional, IsInt, IsDateString, Length } from 'class-validator';

export class CreateThuCungDto {
  @IsString()
  @Length(1, 20)
  TenThuCung: string;

  @IsOptional()
  @IsDateString()
  NgaySinhThuCung?: string;

  @IsInt()
  MaKhachHang: number;

  @IsString()
  @Length(2, 2)
  MaChungLoai: string;
}
