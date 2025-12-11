import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { HoaDon } from './hoa-don.entity';
import { DichVuYTe } from './dich-vu-y-te.entity';
import { ChiNhanh } from './chi-nhanh.entity';

@Entity('THANHTOANDICHVUYTE')
export class ThanhToanDichVuYTe {
  @PrimaryColumn({ type: 'int' })
  MaHoaDon: number;

  @PrimaryColumn({ type: 'char', length: 5 })
  MaDichVu: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true, default: 0 })
  SoTien: number;

  @Column({ type: 'timestamp', nullable: true, default: () => 'CURRENT_TIMESTAMP' })
  NgayThanhToan: Date;

  @Column({ type: 'char', length: 5, nullable: true })
  MaChiNhanh: string;

  @ManyToOne(() => HoaDon, hoaDon => hoaDon.DichVus)
  @JoinColumn({ name: 'MaHoaDon' })
  HoaDon: HoaDon;

  @ManyToOne(() => DichVuYTe, dichVu => dichVu.ThanhToans)
  @JoinColumn({ name: 'MaDichVu' })
  DichVu: DichVuYTe;

  @ManyToOne(() => ChiNhanh, chinhanh => chinhanh.ThanhToans)
  @JoinColumn({ name: 'MaChiNhanh' })
  ChiNhanh: ChiNhanh;
}
