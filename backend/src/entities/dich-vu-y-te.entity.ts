import { Entity, Column, PrimaryColumn, OneToMany } from 'typeorm';
import { ThanhToanDichVuYTe } from './thanh-toan-dich-vu-y-te.entity';
import { PhieuDangKyTiemPhong } from './phieu-dang-ky-tiem-phong.entity';
import { GiayKhamBenhChuyenKhoa } from './giay-kham-benh-chuyen-khoa.entity';
import { DanhGiaYTe } from './danh-gia-y-te.entity';
import { CungCapDichVu } from './cung-cap-dich-vu.entity';

@Entity('DICHVUYTE')
export class DichVuYTe {
  @PrimaryColumn({ type: 'char', length: 5 })
  MaDichVu: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  TenDichVu: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  LoaiDichVu: string;

  @OneToMany(() => ThanhToanDichVuYTe, ttdv => ttdv.DichVu)
  ThanhToans: ThanhToanDichVuYTe[];

  @OneToMany(() => PhieuDangKyTiemPhong, pdktp => pdktp.DichVu)
  PhieuDangKys: PhieuDangKyTiemPhong[];

  @OneToMany(() => GiayKhamBenhChuyenKhoa, gkbck => gkbck.DichVu)
  GiayKhamBenhs: GiayKhamBenhChuyenKhoa[];

  @OneToMany(() => DanhGiaYTe, dgy => dgy.DichVu)
  DanhGias: DanhGiaYTe[];

  @OneToMany(() => CungCapDichVu, ccdv => ccdv.DichVu)
  CungCaps: CungCapDichVu[];
}
