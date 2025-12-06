import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GiayKhamBenhTongQuat } from '../entities/giay-kham-benh-tong-quat.entity';
import { GiayKhamBenhChuyenKhoa } from '../entities/giay-kham-benh-chuyen-khoa.entity';
import { ToaThuoc } from '../entities/toa-thuoc.entity';
import { CtToaThuoc } from '../entities/ct-toa-thuoc.entity';
import { GiayTiemPhong } from '../entities/giay-tiem-phong.entity';
import { PhieuDangKyTiemPhong } from '../entities/phieu-dang-ky-tiem-phong.entity';
import { PhieuDangKyGoi } from '../entities/phieu-dang-ky-goi.entity';
import { PhieuDangKyLe } from '../entities/phieu-dang-ky-le.entity';
import { DichVuYTe } from '../entities/dich-vu-y-te.entity';
import { ThuCung } from '../entities/thu-cung.entity';
import { NhanVien } from '../entities/nhan-vien.entity';
import { Vaccine } from '../entities/vaccine.entity';
import { KhoVaccine } from '../entities/kho-vaccine.entity';
import { DanhGiaYTe } from '../entities/danh-gia-y-te.entity';
import { YTeService } from './y-te.service';
import { YTeController } from './y-te.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      GiayKhamBenhTongQuat,
      GiayKhamBenhChuyenKhoa,
      ToaThuoc,
      CtToaThuoc,
      GiayTiemPhong,
      PhieuDangKyTiemPhong,
      PhieuDangKyGoi,
      PhieuDangKyLe,
      DichVuYTe,
      ThuCung,
      NhanVien,
      Vaccine,
      KhoVaccine,
      DanhGiaYTe,
    ]),
  ],
  controllers: [YTeController],
  providers: [YTeService],
  exports: [YTeService],
})
export class YTeModule {}
