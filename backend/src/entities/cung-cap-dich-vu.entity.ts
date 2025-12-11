import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ChiNhanh } from './chi-nhanh.entity';
import { DichVuYTe } from './dich-vu-y-te.entity';

@Entity('CUNGCAPDICHVU')
export class CungCapDichVu {
  @PrimaryColumn({ type: 'char', length: 4 })
  MaChiNhanh: string;

  @PrimaryColumn({ type: 'char', length: 5 })
  MaDichVu: string;

  @ManyToOne(() => ChiNhanh, chiNhanh => chiNhanh.CungCapDichVus)
  @JoinColumn({ name: 'MaChiNhanh' })
  ChiNhanh: ChiNhanh;

  @ManyToOne(() => DichVuYTe, dichVu => dichVu.CungCaps)
  @JoinColumn({ name: 'MaDichVu' })
  DichVu: DichVuYTe;
}
