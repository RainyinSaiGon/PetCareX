import { IsOptional, IsString, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class SearchMedicineDto {
  @IsOptional()
  @IsString()
  maSanPham?: string;

  @IsOptional()
  @IsString()
  tenSanPham?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  skip?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  take?: number;
}
