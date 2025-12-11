import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { KhachHang } from './khach-hang.entity';
import { HangThanhVien } from './hang-thanh-vien.entity';

@Entity('KHACHHANGTHANHVIEN')
export class KhachHangThanhVien {
  @PrimaryColumn({ type: 'int' })
  MaKhachHang: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  Email: string;

  @Column({ type: 'varchar', length: 3, nullable: true })
  GioiTinh: string;

  @Column({ type: 'date', nullable: true })
  NgaySinh: Date;

  @Column({ type: 'char', length: 12, nullable: true })
  CCCD: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true, default: 0 })
  TongChiTieu: number;

  @Column({ type: 'varchar', length: 10, nullable: true })
  TenHang: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  DiaChi: string;

  @Column({ type: 'date', nullable: true })
  NgayNangHang: Date;

  @Column({ type: 'varchar', length: 10, nullable: true })
  HangCu: string;

  @ManyToOne(() => KhachHang, khachHang => khachHang.ThanhVien)
  @JoinColumn({ name: 'MaKhachHang' })
  KhachHang: KhachHang;

  @ManyToOne(() => HangThanhVien, hang => hang.KhachHangThanhViens)
  @JoinColumn({ name: 'TenHang' })
  Hang: HangThanhVien;
}
