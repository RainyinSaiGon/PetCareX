import { Entity, PrimaryColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { SanPham } from './san-pham.entity';
import { ChiTietToaThuoc } from './chi-tiet-toa-thuoc.entity';

@Entity('THUOC')
export class Thuoc {
  @PrimaryColumn({ type: 'char', length: 5 })
  MaSanPham: string;

  @ManyToOne(() => SanPham, sanpham => sanpham.Thuocs)
  @JoinColumn({ name: 'MaSanPham' })
  SanPham: SanPham;

  @OneToMany(() => ChiTietToaThuoc, chitiet => chitiet.Thuoc)
  ChiTiets: ChiTietToaThuoc[];
}
