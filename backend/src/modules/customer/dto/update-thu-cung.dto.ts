import { IsString, IsOptional, IsDateString, Length } from 'class-validator';

export class UpdateThuCungDto {
  @IsOptional()
  @IsString()
  @Length(1, 20)
  TenThuCung?: string;

  @IsOptional()
  @IsDateString()
  NgaySinhThuCung?: string;

  @IsOptional()
  @IsString()
  @Length(2, 2)
  MaChungLoai?: string;
}
