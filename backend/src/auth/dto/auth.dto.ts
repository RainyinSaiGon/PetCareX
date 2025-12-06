import { IsString, IsEmail, MinLength, IsOptional, IsEnum } from 'class-validator';
import { Role } from '../roles';

export class RegisterDto {
  @IsString()
  @MinLength(3)
  username: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsOptional()
  @IsEnum(Role)
  role?: Role; // Only admin can set roles other than KHACH_HANG
}

export class LoginDto {
  @IsString()
  username: string;

  @IsString()
  password: string;
}

export class CreateStaffAccountDto {
  @IsString()
  @MinLength(3)
  username: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsEnum(Role)
  role: Role;

  @IsOptional()
  @IsString()
  maNhanVien?: string; // Link to NHANVIEN table
}

export class UpdateRoleDto {
  @IsEnum(Role)
  role: Role;

  @IsOptional()
  @IsString()
  maNhanVien?: string;
}

export class ChangePasswordDto {
  @IsString()
  currentPassword: string;

  @IsString()
  @MinLength(6)
  newPassword: string;
}
