import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CustomerModule } from './modules/customer/customer.module';
import { AdminModule } from './modules/admin/admin.module';
import { SalesModule } from './modules/sales/sales.module';

// Import entities
import { User } from './entities/user.entity';
import { ChiNhanh } from './entities/chi-nhanh.entity';
import { Khoa } from './entities/khoa.entity';
import { LoaiNhanVienLuong } from './entities/loai-nhan-vien-luong.entity';
import { NhanVien } from './entities/nhanvien.entity';
import { LichLamViecBacSi } from './entities/lich-lam-viec-bac-si.entity';
import { KhachHang } from './entities/khach-hang.entity';
import { HangThanhVien } from './entities/hang-thanh-vien.entity';
import { KhachHangThanhVien } from './entities/khach-hang-thanh-vien.entity';
import { LoaiThuCung } from './entities/loai-thu-cung.entity';
import { ChungLoaiThuCung } from './entities/chung-loai-thu-cung.entity';
import { ThuCung } from './entities/thu-cung.entity';
import { LichHen } from './entities/lich-hen.entity';
import { SanPham } from './entities/san-pham.entity';
import { LichSuGiaSanPham } from './entities/lich-su-gia-san-pham.entity';
import { Thuoc } from './entities/thuoc.entity';
import { Kho } from './entities/kho.entity';
import { ChiTietTonKho } from './entities/chi-tiet-ton-kho.entity';
import { Vaccine } from './entities/vaccine.entity';
import { DichVuYTe } from './entities/dich-vu-y-te.entity';
import { CungCapDichVu } from './entities/cung-cap-dich-vu.entity';
import { PhieuDangKyTiemPhong } from './entities/phieu-dang-ky-tiem-phong.entity';
import { GiayKhamBenhTongQuat } from './entities/giay-kham-benh-tong-quat.entity';
import { GiayKhamBenhChuyenKhoa } from './entities/giay-kham-benh-chuyen-khoa.entity';
import { ToaThuoc } from './entities/toa-thuoc.entity';
import { ChiTietToaThuoc } from './entities/chi-tiet-toa-thuoc.entity';
import { GiayTiemPhong } from './entities/giay-tiem-phong.entity';
import { HoaDon } from './entities/hoa-don.entity';
import { HoaDonSanPham } from './entities/hoa-don-san-pham.entity';
import { ThanhToanDichVuYTe } from './entities/thanh-toan-dich-vu-y-te.entity';
import { ThuCan } from './entities/thu-can.entity';
import { ThanhPhanThuCan } from './entities/thanh-phan-thu-can.entity';
import { PhuKien } from './entities/phu-kien.entity';
import { KhoVaccine } from './entities/kho-vaccine.entity';
import { GoiTiemPhong } from './entities/goi-tiem-phong.entity';
import { ChiTietGoiTiemPhong } from './entities/chi-tiet-goi-tiem-phong.entity';
import { PhieuDangKyGoi } from './entities/phieu-dang-ky-goi.entity';
import { PhieuDangKyLe } from './entities/phieu-dang-ky-le.entity';
import { ChiTietKhamBenhTrieuChung } from './entities/chi-tiet-kham-benh-trieu-chung.entity';
import { ChiTietKhamBenhChuanDoan } from './entities/chi-tiet-kham-benh-chuan-doan.entity';
import { DanhGiaYTe } from './entities/danh-gia-y-te.entity';
import { DanhGiaMuaHang } from './entities/danh-gia-mua-hang.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
     useFactory: (configService: ConfigService) => ({
    type: 'postgres',
    host: configService.get('DATABASE_HOST'),
    port: parseInt(configService.get('DATABASE_PORT', '5432')),
    username: configService.get('DATABASE_USERNAME'),
    password: configService.get('DATABASE_PASSWORD'),
    database: configService.get('DATABASE_NAME', 'postgres'),

    entities: [
      User,
      ChiNhanh,
      Khoa,
      LoaiNhanVienLuong,
      NhanVien,
      LichLamViecBacSi,
      KhachHang,
      HangThanhVien,
      KhachHangThanhVien,
      LoaiThuCung,
      ChungLoaiThuCung,
      ThuCung,
      LichHen,
      SanPham,
      LichSuGiaSanPham,
      Thuoc,
      Kho,
      ChiTietTonKho,
      Vaccine,
      DichVuYTe,
      CungCapDichVu,
      PhieuDangKyTiemPhong,
      GiayKhamBenhTongQuat,
      GiayKhamBenhChuyenKhoa,
      ToaThuoc,
      ChiTietToaThuoc,
      GiayTiemPhong,
      HoaDon,
      HoaDonSanPham,
      ThanhToanDichVuYTe,
      ThuCan,
      ThanhPhanThuCan,
      PhuKien,
      KhoVaccine,
      GoiTiemPhong,
      ChiTietGoiTiemPhong,
      PhieuDangKyGoi,
      PhieuDangKyLe,
      ChiTietKhamBenhTrieuChung,
      ChiTietKhamBenhChuanDoan,
      DanhGiaYTe,
      DanhGiaMuaHang,
    ],

    synchronize: configService.get('NODE_ENV') === 'development',
    logging: configService.get('NODE_ENV') === 'development',

    ssl:
      configService.get('DATABASE_SSL') === 'true'
        ? { rejectUnauthorized: false }
        : false,

    // ✅ REQUIRED for Supabase Pooler stability
    extra: {
      keepAlive: true,
    },
  }),

      inject: [ConfigService],
    }),
    AuthModule,
    CustomerModule,
    AdminModule,
    SalesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
