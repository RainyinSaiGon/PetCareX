import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { NhanVien } from './nhanvien.entity';

@Entity('KHOA')
export class Khoa {
  @PrimaryColumn({ type: 'char', length: 2 })
  MaKhoa: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  TenKhoa: string;

  @Column({ type: 'char', length: 5, nullable: true })
  TruongKhoa: string;

  @ManyToOne(() => NhanVien, { nullable: true })
  @JoinColumn({ name: 'TruongKhoa' })
  TruongKhoaNV: NhanVien;

  @OneToMany(() => NhanVien, nhanvien => nhanvien.Khoa)
  NhanViens: NhanVien[];
}
