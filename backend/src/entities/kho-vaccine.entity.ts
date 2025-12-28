import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Vaccine } from './vaccine.entity';
import { Kho } from './kho.entity';

@Entity('KHOVACCINE')
export class KhoVaccine {
  @PrimaryGeneratedColumn({ name: 'MAKHOVACCINE' })
  MaKhoVaccine: number;

  @Column({ name: 'MAVACCINE', type: 'char', length: 5 })
  MaVaccine: string;

  @ManyToOne(() => Vaccine, vaccine => vaccine.KhoVaccines)
  @JoinColumn({ name: 'MAVACCINE' })
  Vaccine: Vaccine;

  @Column({ name: 'MAKHO', type: 'char', length: 4 })
  MaKho: string;

  @ManyToOne(() => Kho, kho => kho.KhoVaccines)
  @JoinColumn({ name: 'MAKHO' })
  Kho: Kho;

  @Column({ name: 'SOLUONG', type: 'int' })
  SoLuong: number;

  @Column({ name: 'HANSUDUNG', type: 'date' })
  HanSuDung: Date;

  @Column({ name: 'NGAYNHAP', type: 'datetime2', default: () => 'GETDATE()' })
  NgayNhap: Date;

  @Column({ name: 'GHICHU', type: 'text', nullable: true })
  GhiChu: string;
}

