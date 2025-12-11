import { Entity, Column, PrimaryColumn, OneToMany } from 'typeorm';
import { ChiTietTonKho } from './chi-tiet-ton-kho.entity';
import { LichSuGiaSanPham } from './lich-su-gia-san-pham.entity';
import { Thuoc } from './thuoc.entity';
import { ThuCan } from './thu-can.entity';
import { PhuKien } from './phu-kien.entity';
import { HoaDonSanPham } from './hoa-don-san-pham.entity';
import { DanhGiaMuaHang } from './danh-gia-mua-hang.entity';

@Entity('SANPHAM')
export class SanPham {
  @PrimaryColumn({ type: 'char', length: 5 })
  MaSanPham: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  TenSanPham: string;

  @Column({ type: 'int', nullable: true })
  GiaTienSanPham: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  LoaiSanPham: string; // Thuốc, Thức ăn, Phụ kiện

  @OneToMany(() => ChiTietTonKho, chitiet => chitiet.SanPham)
  ChiTietTonKhos: ChiTietTonKho[];

  @OneToMany(() => LichSuGiaSanPham, lichSu => lichSu.SanPham)
  LichSuGias: LichSuGiaSanPham[];

  @OneToMany(() => Thuoc, thuoc => thuoc.SanPham)
  Thuocs: Thuoc[];

  @OneToMany(() => ThuCan, thucan => thucan.SanPham)
  ThuCans: ThuCan[];

  @OneToMany(() => PhuKien, phukien => phukien.SanPham)
  PhuKiens: PhuKien[];

  @OneToMany(() => HoaDonSanPham, hdsp => hdsp.SanPham)
  HoaDonSanPhams: HoaDonSanPham[];

  @OneToMany(() => DanhGiaMuaHang, dg => dg.SanPham)
  DanhGias: DanhGiaMuaHang[];
}
