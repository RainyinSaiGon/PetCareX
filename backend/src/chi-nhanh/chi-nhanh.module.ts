import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChiNhanh } from '../entities/chi-nhanh.entity';
import { NhanVien } from '../entities/nhan-vien.entity';
import { KhoSanPham } from '../entities/kho-san-pham.entity';
import { KhoVaccine } from '../entities/kho-vaccine.entity';
import { HoaDon } from '../entities/hoa-don.entity';
import { Kho } from '../entities/kho.entity';
import { ChiNhanhService } from './chi-nhanh.service';
import { ChiNhanhController } from './chi-nhanh.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([ChiNhanh, NhanVien, KhoSanPham, KhoVaccine, HoaDon, Kho]),
  ],
  controllers: [ChiNhanhController],
  providers: [ChiNhanhService],
  exports: [ChiNhanhService],
})
export class ChiNhanhModule {}
