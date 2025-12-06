import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { NhanVien } from './nhan-vien.entity';

@Entity('KHOA')
export class Khoa {
  @PrimaryColumn({ name: 'MaKhoa', type: 'char', length: 2 })
  maKhoa: string;

  @Column({ name: 'TenKhoa', type: 'nvarchar', length: 50, nullable: true })
  tenKhoa: string;

  @Column({ name: 'TruongKhoa', type: 'char', length: 5, nullable: true })
  truongKhoa: string;

  @ManyToOne(() => NhanVien, { nullable: true })
  @JoinColumn({ name: 'TruongKhoa' })
  truongKhoaNhanVien: NhanVien;
}
