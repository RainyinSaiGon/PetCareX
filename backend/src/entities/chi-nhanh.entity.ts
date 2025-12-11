import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { NhanVien } from './nhanvien.entity';
import { LichLamViecBacSi } from './lich-lam-viec-bac-si.entity';
import { CungCapDichVu } from './cung-cap-dich-vu.entity';
import { ThanhToanDichVuYTe } from './thanh-toan-dich-vu-y-te.entity';
import { HoaDon } from './hoa-don.entity';

@Entity('CHINHANH')
export class ChiNhanh {
  @PrimaryColumn({ type: 'char', length: 4 })
  MaChiNhanh: string;

  @Column({ type: 'varchar', length: 70, nullable: true })
  TenChiNhanh: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  DiaChi: string;

  @Column({ type: 'char', length: 10, nullable: true })
  SDT: string;

  @Column({ type: 'char', length: 5, nullable: true })
  MaQuanLy: string;

  @Column({ type: 'time', nullable: true })
  ThoiGianMoCua: string;

  @Column({ type: 'time', nullable: true })
  ThoiGianDongCua: string;

  @ManyToOne(() => NhanVien, { nullable: true })
  @JoinColumn({ name: 'MaQuanLy' })
  QuanLy: NhanVien;

  @OneToMany(() => NhanVien, nhanVien => nhanVien.ChiNhanh)
  NhanViens: NhanVien[];

  @OneToMany(() => LichLamViecBacSi, lich => lich.ChiNhanh)
  LichLamViecs: LichLamViecBacSi[];

  @OneToMany(() => CungCapDichVu, ccdv => ccdv.ChiNhanh)
  CungCapDichVus: CungCapDichVu[];

  @OneToMany(() => ThanhToanDichVuYTe, ttdv => ttdv.ChiNhanh)
  ThanhToans: ThanhToanDichVuYTe[];

  @OneToMany(() => HoaDon, hoadon => hoadon.ChiNhanh)
  HoaDons: HoaDon[];
}
