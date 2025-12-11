import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { SanPham } from './san-pham.entity';

@Entity('LICHSUGIASANPHAM')
export class LichSuGiaSanPham {
  @PrimaryColumn({ type: 'char', length: 5 })
  MaSanPham: string;

  @PrimaryColumn({ type: 'date' })
  NgayBatDau: Date;

  @Column({ type: 'date', nullable: true })
  NgayKetThuc: Date;

  @Column({ type: 'int', nullable: true })
  Gia: number;

  @ManyToOne(() => SanPham, sanPham => sanPham.LichSuGias)
  @JoinColumn({ name: 'MaSanPham' })
  SanPham: SanPham;
}
