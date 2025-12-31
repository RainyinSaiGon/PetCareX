import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerPortalController } from './customer-portal.controller';
import { CustomerPortalService } from './customer-portal.service';
import { SanPham } from '../../entities/san-pham.entity';
import { LichHen } from '../../entities/lich-hen.entity';
import { LichLamViecBacSi } from '../../entities/lich-lam-viec-bac-si.entity';
import { NhanVien } from '../../entities/nhanvien.entity';
import { ThuCung } from '../../entities/thu-cung.entity';
import { KhachHang } from '../../entities/khach-hang.entity';
import { HoaDon } from '../../entities/hoa-don.entity';
import { HoaDonSanPham } from '../../entities/hoa-don-san-pham.entity';
import { GiayKhamBenhTongQuat } from '../../entities/giay-kham-benh-tong-quat.entity';
import { ToaThuoc } from '../../entities/toa-thuoc.entity';
import { ChiTietTonKho } from '../../entities/chi-tiet-ton-kho.entity';
import { ChungLoaiThuCung } from '../../entities/chung-loai-thu-cung.entity';
import { LoaiThuCung } from '../../entities/loai-thu-cung.entity';
import { User } from '../../entities/user.entity';
import { ChiNhanh } from '../../entities/chi-nhanh.entity';
import { CungCapDichVu } from '../../entities/cung-cap-dich-vu.entity';
import { DichVuYTe } from '../../entities/dich-vu-y-te.entity';
import { DanhGiaMuaHang } from '../../entities/danh-gia-mua-hang.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            SanPham,
            LichHen,
            LichLamViecBacSi,
            NhanVien,
            ThuCung,
            KhachHang,
            HoaDon,
            HoaDonSanPham,
            GiayKhamBenhTongQuat,
            ToaThuoc,
            ChiTietTonKho,
            ChungLoaiThuCung,
            LoaiThuCung,
            User,
            ChiNhanh,
            CungCapDichVu,
            DichVuYTe,
            DanhGiaMuaHang,
        ]),
    ],
    controllers: [CustomerPortalController],
    providers: [CustomerPortalService],
    exports: [CustomerPortalService],
})
export class CustomerPortalModule { }
