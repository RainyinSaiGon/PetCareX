import { IsNumber, IsOptional, IsString, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateExaminationDto {
  @Type(() => Number)
  @IsNumber()
  maThuCung: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  nhietDo?: number;

  @IsOptional()
  @IsString()
  moTa?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  trieuChung?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  chuanDoan?: string[];
}
