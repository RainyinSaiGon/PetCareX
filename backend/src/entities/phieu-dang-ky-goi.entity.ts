import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { PhieuDangKyTiemPhong } from './phieu-dang-ky-tiem-phong.entity';
import { GoiTiemPhong } from './goi-tiem-phong.entity';

@Entity('PHIEUDANGKYGOI')
export class PhieuDangKyGoi {
  @PrimaryColumn({ name: 'MaDangKy', type: 'int' })
  maDangKy: number;

  @Column({ name: 'MaGoiVaccine', type: 'char', length: 3, nullable: true })
  maGoiVaccine: string;

  // Relations
  @ManyToOne(() => PhieuDangKyTiemPhong, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'MaDangKy' })
  phieuDangKy: PhieuDangKyTiemPhong;

  @ManyToOne(() => GoiTiemPhong, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'MaGoiVaccine' })
  goiVaccine: GoiTiemPhong;
}
