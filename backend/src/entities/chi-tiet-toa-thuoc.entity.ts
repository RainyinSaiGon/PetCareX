import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ToaThuoc } from './toa-thuoc.entity';

@Entity('CHITIETTOATHUOC')
export class ChiTietToaThuoc {
  @PrimaryColumn({ name: 'MaToaThuoc' })
  maToaThuoc: number;

  @PrimaryColumn({ name: 'MaThuoc', type: 'char', length: 5 })
  maThuoc: string;

  @Column({ name: 'SoLuong', type: 'int', nullable: true })
  soLuong: number;

  @Column({ name: 'GhiChu', type: 'nvarchar', length: 100, nullable: true })
  ghiChu: string;

  @ManyToOne(() => ToaThuoc)
  @JoinColumn({ name: 'MaToaThuoc' })
  toaThuoc: ToaThuoc;
}
