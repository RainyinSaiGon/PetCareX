import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { HoaDon } from './hoa-don.entity';
import { SanPham } from './san-pham.entity';

@Entity('CT_SANPHAM')
export class CtSanPham {
  @PrimaryColumn({ name: 'MaHoaDon' })
  maHoaDon: number;

  @PrimaryColumn({ name: 'MaSanPham', type: 'char', length: 5 })
  maSanPham: string;

  @Column({ name: 'SoLuong', type: 'int', nullable: true })
  soLuong: number;

  @Column({ name: 'DonGia', type: 'decimal', precision: 15, scale: 2, nullable: true })
  donGia: number;

  // Relations
  @ManyToOne(() => HoaDon, hd => hd.ctSanPhams, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'MaHoaDon' })
  hoaDon: HoaDon;

  @ManyToOne(() => SanPham, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'MaSanPham' })
  sanPham: SanPham;
}
