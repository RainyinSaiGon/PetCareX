import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { HoaDon } from './hoa-don.entity';
import { SanPham } from './san-pham.entity';

@Entity('HOADON_SANPHAM')
export class HoaDonSanPham {
  @PrimaryColumn({ type: 'int' })
  MaHoaDon: number;

  @PrimaryColumn({ type: 'char', length: 5 })
  MaSanPham: string;

  @Column({ type: 'int', nullable: true })
  SoLuong: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  DonGia: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  ThanhTien: number;

  @ManyToOne(() => HoaDon, hoaDon => hoaDon.SanPhams)
  @JoinColumn({ name: 'MaHoaDon' })
  HoaDon: HoaDon;

  @ManyToOne(() => SanPham, sanpham => sanpham.HoaDonSanPhams)
  @JoinColumn({ name: 'MaSanPham' })
  SanPham: SanPham;
}
