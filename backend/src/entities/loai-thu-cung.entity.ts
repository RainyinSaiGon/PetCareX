import { Entity, Column, PrimaryColumn, OneToMany } from 'typeorm';
import { ChungLoaiThuCung } from './chung-loai-thu-cung.entity';

@Entity('LOAITHUCUNG')
export class LoaiThuCung {
  @PrimaryColumn({ type: 'char', length: 2 })
  MaLoaiThuCung: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  TenLoaiThuCung: string;

  @OneToMany(() => ChungLoaiThuCung, cltc => cltc.LoaiThuCung)
  ChungLoaiThuCungs: ChungLoaiThuCung[];
}
