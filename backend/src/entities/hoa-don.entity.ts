import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { NhanVien } from './nhanvien.entity';
import { KhachHang } from './khach-hang.entity';
import { ChiNhanh } from './chi-nhanh.entity';
import { HoaDonSanPham } from './hoa-don-san-pham.entity';
import { ThanhToanDichVuYTe } from './thanh-toan-dich-vu-y-te.entity';

@Entity('HOADON')
export class HoaDon {
  @PrimaryGeneratedColumn()
  MaHoaDon: number;

  @Column({ type: 'timestamp', nullable: true, default: () => 'CURRENT_TIMESTAMP' })
  NgayLap: Date;

  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true, default: 0 })
  GiamGia: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true, default: 0 })
  TongTien: number;

  @Column({ type: 'char', length: 5, nullable: true })
  MaNhanVien: string;

  @Column({ type: 'int', nullable: true })
  MaKhachHang: number;

  @Column({ type: 'char', length: 5, nullable: true })
  MaChiNhanh: string;

  @ManyToOne(() => NhanVien, nhanVien => nhanVien.HoaDons)
  @JoinColumn({ name: 'MaNhanVien' })
  NhanVien: NhanVien;

  @ManyToOne(() => KhachHang, khachHang => khachHang.HoaDons)
  @JoinColumn({ name: 'MaKhachHang' })
  KhachHang: KhachHang;

  @ManyToOne(() => ChiNhanh, chiNhanh => chiNhanh.HoaDons)
  @JoinColumn({ name: 'MaChiNhanh' })
  ChiNhanh: ChiNhanh;

  @OneToMany(() => HoaDonSanPham, hdsp => hdsp.HoaDon)
  SanPhams: HoaDonSanPham[];

  @OneToMany(() => ThanhToanDichVuYTe, tt => tt.HoaDon)
  DichVus: ThanhToanDichVuYTe[];
}
