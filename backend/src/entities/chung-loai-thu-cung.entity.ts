import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { LoaiThuCung } from './loai-thu-cung.entity';

@Entity('CHUNGLOAITHUCUNG')
export class ChungLoaiThuCung {
  @PrimaryColumn({ type: 'char', length: 2 })
  MaChungLoaiThuCung: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  TenChungLoaiThuCung: string;

  @Column({ type: 'char', length: 2, nullable: true })
  MaLoaiThuCung: string;

  @ManyToOne(() => LoaiThuCung, loai => loai.ChungLoaiThuCungs)
  @JoinColumn({ name: 'MaLoaiThuCung' })
  LoaiThuCung: LoaiThuCung;
}
