import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Kho } from './kho.entity';
import { SanPham } from './san-pham.entity';

@Entity('CHITIETTONKHO')
export class ChiTietTonKho {
  @PrimaryColumn({ name: 'MaKho', type: 'char', length: 4 })
  maKho: string;

  @PrimaryColumn({ name: 'MaSanPham', type: 'char', length: 5 })
  maSanPham: string;

  @Column({ name: 'SoLuong', type: 'int', nullable: true })
  soLuong: number;

  @ManyToOne(() => Kho)
  @JoinColumn({ name: 'MaKho' })
  kho: Kho;

  @ManyToOne(() => SanPham)
  @JoinColumn({ name: 'MaSanPham' })
  sanPham: SanPham;
}
