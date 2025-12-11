import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ThuCan } from './thu-can.entity';

@Entity('THANHPHANTHUCAN')
export class ThanhPhanThuCan {
  @PrimaryGeneratedColumn({ name: 'MATHANHPHAN' })
  MaThanhPhan: number;

  @Column({ name: 'MATHUCAN' })
  MaThuCan: number;

  @ManyToOne(() => ThuCan, thucan => thucan.ThanhPhans)
  @JoinColumn({ name: 'MATHUCAN' })
  ThuCan: ThuCan;

  @Column({ name: 'TENTHANHPHAN', type: 'varchar', length: 100 })
  TenThanhPhan: string;

  @Column({ name: 'PHANTRAM', type: 'decimal', precision: 5, scale: 2 })
  PhanTram: number;

  @Column({ name: 'MOTA', type: 'text', nullable: true })
  MoTa: string;
}
