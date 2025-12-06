import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LichHen } from '../entities/lich-hen.entity';
import { LichLamViecBacSi } from '../entities/lich-lam-viec-bac-si.entity';
import { NhanVien } from '../entities/nhan-vien.entity';
import { ChiNhanh } from '../entities/chi-nhanh.entity';
import { KhachHang } from '../entities/khach-hang.entity';
import { ThuCung } from '../entities/thu-cung.entity';
import { LichHenService } from './lich-hen.service';
import { LichHenController } from './lich-hen.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([LichHen, LichLamViecBacSi, NhanVien, ChiNhanh, KhachHang, ThuCung]),
  ],
  controllers: [LichHenController],
  providers: [LichHenService],
  exports: [LichHenService],
})
export class LichHenModule {}
