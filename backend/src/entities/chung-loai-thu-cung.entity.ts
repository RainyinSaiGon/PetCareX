import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { LoaiThuCung } from './loai-thu-cung.entity';

@Entity('CHUNGLOAITHUCUNG')
export class ChungLoaiThuCung {
  @PrimaryColumn({ name: 'MaChungLoaiThuCung', type: 'char', length: 2 })
  maChungLoaiThuCung: string;

  @Column({ name: 'TenChungLoaiThuCung', type: 'nvarchar', length: 20, nullable: true })
  tenChungLoaiThuCung: string;

  @Column({ name: 'MaLoaiThuCung', type: 'char', length: 2, nullable: true })
  maLoaiThuCung: string;

  @ManyToOne(() => LoaiThuCung, loaiThuCung => loaiThuCung.chungLoais, { nullable: true })
  @JoinColumn({ name: 'MaLoaiThuCung' })
  loaiThuCung: LoaiThuCung;
}
