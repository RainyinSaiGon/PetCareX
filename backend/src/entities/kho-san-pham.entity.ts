import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ChiNhanh } from './chi-nhanh.entity';
import { SanPham } from './san-pham.entity';

@Entity('KHO_SANPHAM')
export class KhoSanPham {
  @PrimaryColumn({ name: 'MaChiNhanh', type: 'varchar', length: 4 })
  maChiNhanh: string;

  @PrimaryColumn({ name: 'MaSanPham', type: 'varchar', length: 4 })
  maSanPham: string;

  @Column({ name: 'SoLuong', type: 'int', nullable: true })
  soLuong: number;

  @Column({ name: 'NgayNhap', type: 'date', nullable: true })
  ngayNhap: Date;

  @Column({ name: 'NgayHetHan', type: 'date', nullable: true })
  ngayHetHan: Date;

  // Relations
  @ManyToOne(() => ChiNhanh, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'MaChiNhanh' })
  chiNhanh: ChiNhanh;

  @ManyToOne(() => SanPham, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'MaSanPham' })
  sanPham: SanPham;
}
