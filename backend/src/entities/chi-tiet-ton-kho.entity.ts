import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Kho } from './kho.entity';
import { SanPham } from './san-pham.entity';

@Entity('CHITIETTONKHO')
export class ChiTietTonKho {
  @PrimaryColumn({ type: 'char', length: 4 })
  MaKho: string;

  @PrimaryColumn({ type: 'char', length: 5 })
  MaSanPham: string;

  @Column({ type: 'int', nullable: true, default: 0 })
  SoLuong: number;

  @ManyToOne(() => Kho, kho => kho.ChiTietTonKhos)
  @JoinColumn({ name: 'MaKho' })
  Kho: Kho;

  @ManyToOne(() => SanPham, sanPham => sanPham.ChiTietTonKhos)
  @JoinColumn({ name: 'MaSanPham' })
  SanPham: SanPham;
}
