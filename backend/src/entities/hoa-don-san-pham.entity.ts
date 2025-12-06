import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { HoaDon } from './hoa-don.entity';
import { SanPham } from './san-pham.entity';

@Entity('HOADON_SANPHAM')
export class HoaDonSanPham {
  @PrimaryColumn({ name: 'MaHoaDon' })
  maHoaDon: number;

  @PrimaryColumn({ name: 'MaSanPham', type: 'char', length: 5 })
  maSanPham: string;

  @Column({ name: 'SoLuong', type: 'int', nullable: true })
  soLuong: number;

  @ManyToOne(() => HoaDon)
  @JoinColumn({ name: 'MaHoaDon' })
  hoaDon: HoaDon;

  @ManyToOne(() => SanPham)
  @JoinColumn({ name: 'MaSanPham' })
  sanPham: SanPham;
}
