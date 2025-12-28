import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { SanPham } from './san-pham.entity';
import { ThanhPhanThuCan } from './thanh-phan-thu-can.entity';

@Entity('THUCAN')
export class ThuCan {
  @PrimaryGeneratedColumn({ name: 'MATHUCAN' })
  MaThuCan: number;

  @Column({ name: 'MASANPHAM', type: 'char', length: 5 })
  MaSanPham: string;

  @ManyToOne(() => SanPham, sanpham => sanpham.ThuCans)
  @JoinColumn({ name: 'MASANPHAM' })
  SanPham: SanPham;

  @Column({ name: 'THUONGHIEU', type: 'nvarchar', length: 100 })
  ThuongHieu: string;

  @Column({ name: 'DOITUONGTHUCUNG', type: 'nvarchar', length: 100 })
  DoiTuongThuCung: string;

  @Column({ name: 'TRONGLUONG', type: 'decimal', precision: 10, scale: 2 })
  TrongLuong: number;

  @Column({ name: 'DONVITINH', type: 'nvarchar', length: 20 })
  DonViTinh: string;

  @OneToMany(() => ThanhPhanThuCan, tptc => tptc.ThuCan)
  ThanhPhans: ThanhPhanThuCan[];
}

