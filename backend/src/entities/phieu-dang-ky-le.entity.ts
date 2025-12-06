import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { PhieuDangKyTiemPhong } from './phieu-dang-ky-tiem-phong.entity';
import { Vaccine } from './vaccine.entity';

@Entity('PHIEUDANGKYLE')
export class PhieuDangKyLe {
  @PrimaryColumn({ name: 'MaDangKy', type: 'int' })
  maDangKy: number;

  @Column({ name: 'MaVaccine', type: 'char', length: 5, nullable: true })
  maVaccine: string;

  // Relations
  @ManyToOne(() => PhieuDangKyTiemPhong, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'MaDangKy' })
  phieuDangKy: PhieuDangKyTiemPhong;

  @ManyToOne(() => Vaccine, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'MaVaccine' })
  vaccine: Vaccine;
}
