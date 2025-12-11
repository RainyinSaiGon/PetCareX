import { IsString, IsOptional, Length, Matches } from 'class-validator';

export class CreateKhachHangDto {
  @IsString()
  @Length(1, 50)
  HoTen: string;

  @IsString()
  @Length(10, 10)
  @Matches(/^0[0-9]{9}$/, { message: 'Số điện thoại phải bắt đầu bằng 0 và có 10 chữ số' })
  SoDienThoai: string;
}
