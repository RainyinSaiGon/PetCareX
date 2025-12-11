import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { KhachHang } from './khach-hang.entity';
import { ThuCung } from './thu-cung.entity';
import { NhanVien } from './nhanvien.entity';

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

  @Column({ type: 'date', nullable: true })
  NgayHen: Date;

  @Column({ type: 'time', nullable: true })
  GioHen: string;

  @Column({ type: 'varchar', length: 16, nullable: true, default: 'Chờ xác nhận' })
  TrangThai: string; // Chờ xác nhận, Đã xác nhận, Đã hoàn thành, Đã hủy

  @ManyToOne(() => KhachHang, khachHang => khachHang.LichHens)
  @JoinColumn({ name: 'MaKhachHang' })
  KhachHang: KhachHang;

  @ManyToOne(() => ThuCung, thuCung => thuCung.LichHens)
  @JoinColumn({ name: 'MaThuCung' })
  ThuCung: ThuCung;

  @ManyToOne(() => NhanVien, nhanvien => nhanvien.LichHens)
  @JoinColumn({ name: 'MaBacSi' })
  BacSi: NhanVien;
}
