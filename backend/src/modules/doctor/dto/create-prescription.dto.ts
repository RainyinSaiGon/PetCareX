import { IsNumber, IsString, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class PrescriptionDetailDto {
  @IsString()
  maThuoc: string;

  @Type(() => Number)
  @IsNumber()
  soLuong: number;

  @IsOptional()
  @IsString()
  ghiChu?: string;
}

export class CreatePrescriptionDto {
  @Type(() => Number)
  @IsNumber()
  maThuCung: number;

  @Type(() => Number)
  @IsNumber()
  maGiayKhamTongQuat: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PrescriptionDetailDto)
  chiTiets: PrescriptionDetailDto[];
}

