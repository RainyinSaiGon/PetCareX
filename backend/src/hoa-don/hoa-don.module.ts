import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HoaDon } from '../entities/hoa-don.entity';
import { CtSanPham } from '../entities/ct-san-pham.entity';
import { CtDichVuYTe } from '../entities/ct-dich-vu-y-te.entity';
import { SanPham } from '../entities/san-pham.entity';
import { KhoSanPham } from '../entities/kho-san-pham.entity';
import { KhachHangThanhVien } from '../entities/khach-hang-thanh-vien.entity';
import { HangThanhVien } from '../entities/hang-thanh-vien.entity';
import { DanhGiaMuaHang } from '../entities/danh-gia-mua-hang.entity';
import { HoaDonService } from './hoa-don.service';
import { HoaDonController, SanPhamController } from './hoa-don.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      HoaDon,
      CtSanPham,
      CtDichVuYTe,
      SanPham,
      KhoSanPham,
      KhachHangThanhVien,
      HangThanhVien,
      DanhGiaMuaHang,
    ]),
  ],
  controllers: [HoaDonController, SanPhamController],
  providers: [HoaDonService],
  exports: [HoaDonService],
})
export class HoaDonModule {}
