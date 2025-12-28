import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { KhachHang } from './khach-hang.entity';
import { ThuCung } from './thu-cung.entity';
import { NhanVien } from './nhanvien.entity';
import { ChiNhanh } from './chi-nhanh.entity';
import { DichVuYTe } from './dich-vu-y-te.entity';

@Entity('LICHHEN')
export class LichHen {
  @PrimaryGeneratedColumn()
  MaLichHen: number;

  @Column({ type: 'int', nullable: true })
  MaKhachHang: number;

  @Column({ type: 'int', nullable: true })
  MaThuCung: number;

  @Column({ type: 'char', length: 5, nullable: true })
  MaBacSi: string;

  @Column({ type: 'char', length: 4, nullable: true })
  MaChiNhanh: string;

  @Column({ type: 'char', length: 5, nullable: true })
  MaDichVu: string;

  @Column({ type: 'date', nullable: true })
  NgayHen: Date;

  @Column({ type: 'time', nullable: true })
  GioHen: string;

  @Column({ type: 'time', nullable: true })
  GioBatDau: string; // Start time for appointment

  @Column({ type: 'time', nullable: true })
  GioKetThuc: string; // End time for appointment

  @Column({ type: 'nvarchar', length: 16, nullable: true, default: 'Chờ xác nhận' })
  TrangThai: string; // Chờ xác nhận, Đã xác nhận, Đã hoàn thành, Đã hủy

  @Column({ type: 'text', nullable: true })
  GhiChu: string; // Notes/reason for the appointment

  @ManyToOne(() => KhachHang, khachHang => khachHang.LichHens)
  @JoinColumn({ name: 'MaKhachHang' })
  KhachHang: KhachHang;

  @ManyToOne(() => ThuCung, thuCung => thuCung.LichHens)
  @JoinColumn({ name: 'MaThuCung' })
  ThuCung: ThuCung;

  @ManyToOne(() => NhanVien, nhanvien => nhanvien.LichHens)
  @JoinColumn({ name: 'MaBacSi' })
  BacSi: NhanVien;

  @ManyToOne(() => ChiNhanh, chiNhanh => chiNhanh.LichHens)
  @JoinColumn({ name: 'MaChiNhanh' })
  ChiNhanh: ChiNhanh;

  @ManyToOne(() => DichVuYTe)
  @JoinColumn({ name: 'MaDichVu' })
  DichVu: DichVuYTe;
}

