import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Vaccine } from './vaccine.entity';
import { Kho } from './kho.entity';

@Entity('KHOVACCINE')
export class KhoVaccine {
  @PrimaryGeneratedColumn({ name: 'MAKHOVACCINE' })
  MaKhoVaccine: number;

  @Column({ name: 'MAVACCINE' })
  MaVaccine: number;

  @ManyToOne(() => Vaccine, vaccine => vaccine.KhoVaccines)
  @JoinColumn({ name: 'MAVACCINE' })
  Vaccine: Vaccine;

  @Column({ name: 'MAKHO' })
  MaKho: number;

  @ManyToOne(() => Kho, kho => kho.KhoVaccines)
  @JoinColumn({ name: 'MAKHO' })
  Kho: Kho;

  @Column({ name: 'SOLUONG', type: 'int' })
  SoLuong: number;

  @Column({ name: 'HANSUDUNG', type: 'date' })
  HanSuDung: Date;

  @Column({ name: 'NGAYNHAP', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  NgayNhap: Date;

  @Column({ name: 'GHICHU', type: 'text', nullable: true })
  GhiChu: string;
}
