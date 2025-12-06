import { Entity, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ChiNhanh } from './chi-nhanh.entity';
import { DichVuYTe } from './dich-vu-y-te.entity';

@Entity('CUNGCAPDICHVU')
export class CungCapDichVu {
  @PrimaryColumn({ name: 'MaChiNhanh', type: 'char', length: 4 })
  maChiNhanh: string;

  @PrimaryColumn({ name: 'MaDichVu', type: 'char', length: 5 })
  maDichVu: string;

  @ManyToOne(() => ChiNhanh)
  @JoinColumn({ name: 'MaChiNhanh' })
  chiNhanh: ChiNhanh;

  @ManyToOne(() => DichVuYTe)
  @JoinColumn({ name: 'MaDichVu' })
  dichVu: DichVuYTe;
}
