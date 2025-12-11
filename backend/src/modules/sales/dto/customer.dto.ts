import { IsString, IsOptional, IsEmail, IsPhoneNumber, IsDate, MinLength, MaxLength, Matches } from 'class-validator';

export class CreateCustomerDto {
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  HoTen: string;

  @IsString()
  @Matches(/^[0-9]{10}$/, { message: 'Phone number must be 10 digits' })
  SoDienThoai: string;

  @IsOptional()
  @IsEmail()
  Email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(12)
  CCCD?: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  DiaChi?: string;

  @IsOptional()
  @IsDate()
  NgaySinh?: Date;

  @IsOptional()
  @Matches(/^(Nam|Nữ|Khác)$/)
  GioiTinh?: string; // Nam, Nữ, Khác
}

export class UpdateCustomerDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  HoTen?: string;

  @IsOptional()
  @IsEmail()
  Email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  DiaChi?: string;

  @IsOptional()
  @IsDate()
  NgaySinh?: Date;

  @IsOptional()
  @Matches(/^(Nam|Nữ|Khác)$/)
  GioiTinh?: string;
}

export class CustomerResponseDto {
  MaKhachHang: number;
  HoTen: string;
  SoDienThoai: string;
  Email?: string;
  CCCD?: string;
  DiaChi?: string;
  NgaySinh?: Date;
  GioiTinh?: string;
  TongChiTieu: number;
  TenHang: string;
  CreatedAt?: Date;
  IsActive: boolean;
}

export class CustomerStatisticsDto {
  totalCustomers: number;
  activeCustomers: number;
  inactiveCustomers: number;
  totalSpending: number;
  averageSpending: number;
  tierDistribution: {
    bronze: number;
    silver: number;
    gold: number;
    platinum: number;
  };
  topSpenders: {
    MaKhachHang: number;
    HoTen: string;
    SoDienThoai: string;
    TongChiTieu: number;
    TenHang: string;
  }[];
}

export class InactiveCustomerDto {
  MaKhachHang: number;
  HoTen: string;
  SoDienThoai: string;
  Email?: string;
  TongChiTieu: number;
  TenHang: string;
  lastPurchaseDate?: Date;
  daysSinceLastPurchase: number;
}
