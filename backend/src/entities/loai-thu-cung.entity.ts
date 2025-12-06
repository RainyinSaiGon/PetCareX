import { Entity, PrimaryColumn, Column, OneToMany } from 'typeorm';
import { ChungLoaiThuCung } from './chung-loai-thu-cung.entity';

@Entity('LOAITHUCUNG')
export class LoaiThuCung {
  @PrimaryColumn({ name: 'MaLoaiThuCung', type: 'char', length: 2 })
  maLoaiThuCung: string;

  @Column({ name: 'TenLoaiThuCung', type: 'nvarchar', length: 10, nullable: true })
  tenLoaiThuCung: string;

  @OneToMany(() => ChungLoaiThuCung, chungLoai => chungLoai.loaiThuCung)
  chungLoais: ChungLoaiThuCung[];
}
