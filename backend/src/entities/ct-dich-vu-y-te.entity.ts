import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { HoaDon } from './hoa-don.entity';
import { DichVuYTe } from './dich-vu-y-te.entity';

@Entity('CT_DICHVUYTE')
export class CtDichVuYTe {
  @PrimaryColumn({ name: 'MaHoaDon' })
  maHoaDon: number;

  @PrimaryColumn({ name: 'MaDichVu', type: 'char', length: 5 })
  maDichVu: string;

  @Column({ name: 'SoLuong', type: 'int', nullable: true })
  soLuong: number;

  @Column({ name: 'DonGia', type: 'decimal', precision: 15, scale: 2, nullable: true })
  donGia: number;

  // Relations
  @ManyToOne(() => HoaDon, hd => hd.ctDichVuYTes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'MaHoaDon' })
  hoaDon: HoaDon;

  @ManyToOne(() => DichVuYTe, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'MaDichVu' })
  dichVuYTe: DichVuYTe;
}
