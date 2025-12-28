import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DoctorController } from './doctor.controller';
import { DoctorService } from './doctor.service';
import { GiayKhamBenhTongQuat } from '../../entities/giay-kham-benh-tong-quat.entity';
import { ToaThuoc } from '../../entities/toa-thuoc.entity';
import { ChiTietToaThuoc } from '../../entities/chi-tiet-toa-thuoc.entity';
import { ThuCung } from '../../entities/thu-cung.entity';
import { Thuoc } from '../../entities/thuoc.entity';
import { SanPham } from '../../entities/san-pham.entity';
import { ChiTietKhamBenhTrieuChung } from '../../entities/chi-tiet-kham-benh-trieu-chung.entity';
import { ChiTietKhamBenhChuanDoan } from '../../entities/chi-tiet-kham-benh-chuan-doan.entity';
import { ChiTietTonKho } from '../../entities/chi-tiet-ton-kho.entity';
import { HoaDon } from '../../entities/hoa-don.entity';
import { HoaDonSanPham } from '../../entities/hoa-don-san-pham.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      GiayKhamBenhTongQuat,
      ToaThuoc,
      ChiTietToaThuoc,
      ThuCung,
      Thuoc,
      SanPham,
      ChiTietKhamBenhTrieuChung,
      ChiTietKhamBenhChuanDoan,
      ChiTietTonKho,
      HoaDon,
      HoaDonSanPham,
    ]),
  ],
  controllers: [DoctorController],
  providers: [DoctorService],
  exports: [DoctorService],
})
export class DoctorModule { }
