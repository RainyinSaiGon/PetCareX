import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { SanPham } from './san-pham.entity';

@Entity('PHUKIEN')
export class PhuKien {
  @PrimaryGeneratedColumn({ name: 'MAPHUKIEN' })
  MaPhuKien: number;

  @Column({ name: 'MASANPHAM' })
  MaSanPham: number;

  @ManyToOne(() => SanPham, sanpham => sanpham.PhuKiens)
  @JoinColumn({ name: 'MASANPHAM' })
  SanPham: SanPham;

  @Column({ name: 'LOAIPHUKIEN', type: 'varchar', length: 100 })
  LoaiPhuKien: string;

  @Column({ name: 'CHATLIEU', type: 'varchar', length: 100, nullable: true })
  ChatLieu: string;

  @Column({ name: 'KICHTHUOC', type: 'varchar', length: 50, nullable: true })
  KichThuoc: string;

  @Column({ name: 'MAUSAC', type: 'varchar', length: 50, nullable: true })
  MauSac: string;
}
