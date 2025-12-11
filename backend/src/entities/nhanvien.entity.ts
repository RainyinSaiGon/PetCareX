import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { ChiNhanh } from './chi-nhanh.entity';
import { LoaiNhanVienLuong } from './loai-nhan-vien-luong.entity';
import { Khoa } from './khoa.entity';
import { LichLamViecBacSi } from './lich-lam-viec-bac-si.entity';
import { HoaDon } from './hoa-don.entity';
import { LichHen } from './lich-hen.entity';
import { GiayTiemPhong } from './giay-tiem-phong.entity';
import { GiayKhamBenhChuyenKhoa } from './giay-kham-benh-chuyen-khoa.entity';
import { ToaThuoc } from './toa-thuoc.entity';

@Entity('NHANVIEN')
export class NhanVien {
  @PrimaryColumn({ type: 'char', length: 5 })
  MaNhanVien: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  HoTen: string;

  @Column({ type: 'date', nullable: true })
  NgayVaoLam: Date;

  @Column({ type: 'date', nullable: true })
  NgayNghiLam: Date;

  @Column({ type: 'date', nullable: true })
  NgaySinh: Date;

  @Column({ type: 'char', length: 10, nullable: true })
  SDT: string;

  @Column({ type: 'char', length: 4, nullable: true })
  MaChiNhanh: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  LoaiNhanVien: string;

  @Column({ type: 'char', length: 2, nullable: true })
  MaKhoa: string;

  @ManyToOne(() => ChiNhanh, chiNhanh => chiNhanh.NhanViens, { nullable: true })
  @JoinColumn({ name: 'MaChiNhanh' })
  ChiNhanh: ChiNhanh;

  @ManyToOne(() => LoaiNhanVienLuong, loaiNV => loaiNV.NhanViens, { nullable: true })
  @JoinColumn({ name: 'LoaiNhanVien' })
  LoaiNV: LoaiNhanVienLuong;

  @ManyToOne(() => Khoa, khoa => khoa.NhanViens, { nullable: true })
  @JoinColumn({ name: 'MaKhoa' })
  Khoa: Khoa;

  @OneToMany(() => LichLamViecBacSi, lich => lich.BacSi)
  LichLamViecs: LichLamViecBacSi[];

  @OneToMany(() => HoaDon, hoaDon => hoaDon.NhanVien)
  HoaDons: HoaDon[];

  @OneToMany(() => LichHen, lichhen => lichhen.BacSi)
  LichHens: LichHen[];

  @OneToMany(() => GiayTiemPhong, giay => giay.BacSi)
  GiayTiemPhongs: GiayTiemPhong[];

  @OneToMany(() => GiayKhamBenhChuyenKhoa, gkbck => gkbck.BacSi)
  GiayKhamBenhChuyenKhoas: GiayKhamBenhChuyenKhoa[];

  @OneToMany(() => ToaThuoc, toathuoc => toathuoc.BacSi)
  ToaThuocs: ToaThuoc[];
}
