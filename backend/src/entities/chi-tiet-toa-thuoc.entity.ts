import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ToaThuoc } from './toa-thuoc.entity';
import { Thuoc } from './thuoc.entity';

@Entity('CHITIETTOATHUOC')
export class ChiTietToaThuoc {
  @PrimaryColumn({ type: 'int' })
  MaToaThuoc: number;

  @PrimaryColumn({ type: 'char', length: 5 })
  MaThuoc: string;

  @Column({ type: 'int', nullable: true })
  SoLuong: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  GhiChu: string;

  @ManyToOne(() => ToaThuoc, toaThuoc => toaThuoc.ChiTiets)
  @JoinColumn({ name: 'MaToaThuoc' })
  ToaThuoc: ToaThuoc;

  @ManyToOne(() => Thuoc, thuoc => thuoc.ChiTiets)
  @JoinColumn({ name: 'MaThuoc' })
  Thuoc: Thuoc;
}
