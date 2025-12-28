import { IsOptional, IsNumber, IsString, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class SearchPetExaminationDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maThuCung?: number;

  @IsOptional()
  @IsString()
  tenThuCung?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maKhachHang?: number;

  @IsOptional()
  @IsDateString()
  fromDate?: Date;

  @IsOptional()
  @IsDateString()
  toDate?: Date;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  skip?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  take?: number;
}
