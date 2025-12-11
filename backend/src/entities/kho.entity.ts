import { Entity, Column, PrimaryColumn, OneToMany } from 'typeorm';
import { NhanVien } from './nhanvien.entity';
import { ChiTietTonKho } from './chi-tiet-ton-kho.entity';
import { KhoVaccine } from './kho-vaccine.entity';

@Entity('KHO')
export class Kho {
  @PrimaryColumn({ type: 'char', length: 4 })
  MaKho: string;

  @Column({ type: 'char', length: 5, nullable: true })
  NhanVienPhuTrach: string;

  @OneToMany(() => ChiTietTonKho, chitiet => chitiet.Kho)
  ChiTietTonKhos: ChiTietTonKho[];

  @OneToMany(() => KhoVaccine, kv => kv.Kho)
  KhoVaccines: KhoVaccine[];
}
