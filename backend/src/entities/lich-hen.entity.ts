import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { KhachHang } from './khach-hang.entity';
import { ThuCung } from './thu-cung.entity';
import { NhanVien } from './nhan-vien.entity';
import { ChiNhanh } from './chi-nhanh.entity';
import { DichVuYTe } from './dich-vu-y-te.entity';

@Entity('LICHHEN')
export class LichHen {
  @PrimaryColumn({ name: 'MaLichHen', type: 'varchar', length: 6 })
  maLichHen: string;

  @Column({ name: 'MaKhachHang', type: 'int', nullable: true })
  maKhachHang: number;

  @Column({ name: 'MaThuCung', type: 'int', nullable: true })
  maThuCung: number;

  @Column({ name: 'MaBacSi', type: 'char', length: 5, nullable: true })
  maBacSi: string;

  @Column({ name: 'MaChiNhanh', type: 'char', length: 4, nullable: true })
  maChiNhanh: string;

  @Column({ name: 'MaDichVuYTe', type: 'char', length: 5, nullable: true })
  maDichVuYTe: string;

  @Column({ name: 'NgayDat', type: 'datetime', nullable: true })
  ngayDat: Date;

  @Column({ name: 'NgayHen', type: 'date', nullable: true })
  ngayHen: Date;

  @Column({ name: 'GioHen', type: 'varchar', length: 5, nullable: true })
  gioHen: string;

  @Column({ name: 'TrangThai', type: 'nvarchar', length: 20, nullable: true })
  trangThai: string;

  @Column({ name: 'GhiChu', type: 'nvarchar', length: 500, nullable: true })
  ghiChu: string;

  // Relations
  @ManyToOne(() => KhachHang, { nullable: true })
  @JoinColumn({ name: 'MaKhachHang' })
  khachHang: KhachHang;

  @ManyToOne(() => ThuCung, { nullable: true })
  @JoinColumn({ name: 'MaThuCung' })
  thuCung: ThuCung;

  @ManyToOne(() => NhanVien, { nullable: true })
  @JoinColumn({ name: 'MaBacSi' })
  bacSi: NhanVien;

  @ManyToOne(() => ChiNhanh, { nullable: true })
  @JoinColumn({ name: 'MaChiNhanh' })
  chiNhanh: ChiNhanh;

  @ManyToOne(() => DichVuYTe, { nullable: true })
  @JoinColumn({ name: 'MaDichVuYTe' })
  dichVuYTe: DichVuYTe;
}
