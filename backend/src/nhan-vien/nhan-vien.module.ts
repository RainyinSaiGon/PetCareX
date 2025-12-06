import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NhanVien } from '../entities/nhan-vien.entity';
import { ChiNhanh } from '../entities/chi-nhanh.entity';
import { LoaiNhanVienLuong } from '../entities/loai-nhan-vien-luong.entity';
import { LichLamViecBacSi } from '../entities/lich-lam-viec-bac-si.entity';
import { NhanVienService } from './nhan-vien.service';
import { NhanVienController } from './nhan-vien.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([NhanVien, ChiNhanh, LoaiNhanVienLuong, LichLamViecBacSi]),
  ],
  controllers: [NhanVienController],
  providers: [NhanVienService],
  exports: [NhanVienService],
})
export class NhanVienModule {}
