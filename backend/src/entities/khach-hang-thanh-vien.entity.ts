import { Entity, PrimaryColumn, Column, OneToOne, ManyToOne, JoinColumn } from 'typeorm';
import { KhachHang } from './khach-hang.entity';
import { HangThanhVien } from './hang-thanh-vien.entity';

@Entity('KHACHHANGTHANHVIEN')
export class KhachHangThanhVien {
  @PrimaryColumn({ name: 'MaKhachHang' })
  maKhachHang: number;

  @Column({ name: 'Email', type: 'varchar', length: 50, nullable: true })
  email: string;

  @Column({ name: 'GioiTinh', type: 'nvarchar', length: 3, nullable: true })
  gioiTinh: string;

  @Column({ name: 'NgaySinh', type: 'date', nullable: true })
  ngaySinh: Date;

  @Column({ name: 'CCCD', type: 'char', length: 12, nullable: true })
  cccd: string;

  @Column({ name: 'TongChiTieu', type: 'decimal', precision: 12, scale: 2, nullable: true, default: 0 })
  tongChiTieu: number;

  @Column({ name: 'TenHang', type: 'nvarchar', length: 10, nullable: true })
  tenHang: string;

  @Column({ name: 'DiaChi', type: 'nvarchar', length: 150, nullable: true })
  diaChi: string;

  @OneToOne(() => KhachHang, khachHang => khachHang.thanhVien)
  @JoinColumn({ name: 'MaKhachHang' })
  khachHang: KhachHang;

  @ManyToOne(() => HangThanhVien, { nullable: true })
  @JoinColumn({ name: 'TenHang' })
  hangThanhVien: HangThanhVien;
}
