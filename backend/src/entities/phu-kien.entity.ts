import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { SanPham } from './san-pham.entity';

@Entity('PHUKIEN')
export class PhuKien {
  @PrimaryGeneratedColumn({ name: 'MAPHUKIEN' })
  MaPhuKien: number;

  @Column({ name: 'MASANPHAM', type: 'char', length: 5 })
  MaSanPham: string;

  @ManyToOne(() => SanPham, sanpham => sanpham.PhuKiens)
  @JoinColumn({ name: 'MASANPHAM' })
  SanPham: SanPham;

  @Column({ name: 'LOAIPHUKIEN', type: 'nvarchar', length: 100 })
  LoaiPhuKien: string;

  @Column({ name: 'CHATLIEU', type: 'nvarchar', length: 100, nullable: true })
  ChatLieu: string;

  @Column({ name: 'KICHTHUOC', type: 'nvarchar', length: 50, nullable: true })
  KichThuoc: string;

  @Column({ name: 'MAUSAC', type: 'nvarchar', length: 50, nullable: true })
  MauSac: string;
}

