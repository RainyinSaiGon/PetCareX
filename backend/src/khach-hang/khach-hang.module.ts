import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KhachHang } from '../entities/khach-hang.entity';
import { KhachHangThanhVien } from '../entities/khach-hang-thanh-vien.entity';
import { HangThanhVien } from '../entities/hang-thanh-vien.entity';
import { ThuCung } from '../entities/thu-cung.entity';
import { LoaiThuCung } from '../entities/loai-thu-cung.entity';
import { KhachHangService } from './khach-hang.service';
import { KhachHangController, ThuCungController } from './khach-hang.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([KhachHang, KhachHangThanhVien, HangThanhVien, ThuCung, LoaiThuCung]),
  ],
  controllers: [KhachHangController, ThuCungController],
  providers: [KhachHangService],
  exports: [KhachHangService],
})
export class KhachHangModule {}
