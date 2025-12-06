import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ToaThuoc } from './toa-thuoc.entity';
import { SanPham } from './san-pham.entity';

@Entity('CT_TOATHUOC')
export class CtToaThuoc {
  @PrimaryColumn({ name: 'SoToaThuoc', type: 'varchar', length: 6 })
  soToaThuoc: string;

  @PrimaryColumn({ name: 'MaThuoc', type: 'varchar', length: 4 })
  maThuoc: string;

  @Column({ name: 'SoLuong', type: 'int', nullable: true })
  soLuong: number;

  @Column({ name: 'LieuDung', type: 'nvarchar', length: 255, nullable: true })
  lieuDung: string;

  // Relations
  @ManyToOne(() => ToaThuoc, t => t.chiTietToaThuocs, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'SoToaThuoc' })
  toaThuoc: ToaThuoc;

  @ManyToOne(() => SanPham, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'MaThuoc' })
  thuoc: SanPham;
}
