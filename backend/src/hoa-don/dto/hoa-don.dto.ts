import { IsString, IsOptional, IsNumber, IsArray, MaxLength, ValidateNested, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

// Chi tiết sản phẩm
export class AddSanPhamDto {
  @IsString()
  @MaxLength(5)
  maSanPham: string;

  @IsNumber()
  @Min(1)
  soLuong: number;

  @IsNumber()
  @IsOptional()
  donGia?: number;
}

// Chi tiết dịch vụ y tế
export class AddDichVuYTeDto {
  @IsString()
  @MaxLength(5)
  maDichVu: string;

  @IsNumber()
  @IsOptional()
  @Min(1)
  soLuong?: number;

  @IsNumber()
  @IsOptional()
  donGia?: number;
}

// Tạo hóa đơn (maHoaDon is auto-generated, maKhachHang is number)
export class CreateHoaDonDto {
  @IsNumber()
  @IsOptional()
  maKhachHang?: number;

  @IsString()
  @MaxLength(5)
  maNhanVien: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AddSanPhamDto)
  @IsOptional()
  sanPhams?: AddSanPhamDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AddDichVuYTeDto)
  @IsOptional()
  dichVuYTes?: AddDichVuYTeDto[];
}

// Đánh giá mua hàng (maDanhGia is auto-generated, maHoaDon is number)
export class CreateDanhGiaMuaHangDto {
  @IsNumber()
  @IsOptional()
  maHoaDon?: number;

  @IsNumber()
  @Min(1)
  @Max(5)
  mucDoHaiLong: number;

  @IsNumber()
  @Min(1)
  @Max(5)
  @IsOptional()
  thaiDoNhanVien?: number;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  binhLuan?: string;
}
