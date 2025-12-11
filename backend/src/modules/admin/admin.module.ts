import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { SalaryStatisticsService } from './salary-statistics.service';
import { MemberTierService } from './member-tier.service';
import { MemberTierController } from './member-tier.controller';
import { NhanVien } from '../../entities/nhanvien.entity';
import { LoaiNhanVienLuong } from '../../entities/loai-nhan-vien-luong.entity';
import { ChiNhanh } from '../../entities/chi-nhanh.entity';
import { Khoa } from '../../entities/khoa.entity';
import { LichHen } from '../../entities/lich-hen.entity';
import { HoaDon } from '../../entities/hoa-don.entity';
import { HoaDonSanPham } from '../../entities/hoa-don-san-pham.entity';
import { ThanhToanDichVuYTe } from '../../entities/thanh-toan-dich-vu-y-te.entity';
import { KhachHangThanhVien } from '../../entities/khach-hang-thanh-vien.entity';
import { HangThanhVien } from '../../entities/hang-thanh-vien.entity';
import { DichVuYTe } from '../../entities/dich-vu-y-te.entity';
import { SanPham } from '../../entities/san-pham.entity';
import { KhachHang } from '../../entities/khach-hang.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      NhanVien,
      LoaiNhanVienLuong,
      ChiNhanh,
      Khoa,
      LichHen,
      HoaDon,
      HoaDonSanPham,
      ThanhToanDichVuYTe,
      KhachHangThanhVien,
      HangThanhVien,
      DichVuYTe,
      SanPham,
      KhachHang,
    ]),
  ],
  controllers: [AdminController, AnalyticsController, MemberTierController],
  providers: [AdminService, AnalyticsService, SalaryStatisticsService, MemberTierService],
  exports: [AdminService, AnalyticsService, SalaryStatisticsService, MemberTierService],
})
export class AdminModule {}
