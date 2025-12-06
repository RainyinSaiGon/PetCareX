import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Kho } from './kho.entity';
import { Vaccine } from './vaccine.entity';

@Entity('KHO_VACCINE')
export class KhoVaccine {
  @PrimaryColumn({ name: 'MaKho', type: 'char', length: 4 })
  maKho: string;

  @PrimaryColumn({ name: 'MaVaccine', type: 'char', length: 5 })
  maVaccine: string;

  @Column({ name: 'SoLuong', type: 'int', nullable: true, default: 0 })
  soLuong: number;

  @ManyToOne(() => Kho)
  @JoinColumn({ name: 'MaKho' })
  kho: Kho;

  @ManyToOne(() => Vaccine)
  @JoinColumn({ name: 'MaVaccine' })
  vaccine: Vaccine;
}
