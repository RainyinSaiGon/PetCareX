import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { KhachHang } from './khach-hang.entity';
import { ThuCung } from './thu-cung.entity';
import { DichVuYTe } from './dich-vu-y-te.entity';

@Entity('PHIEUDANGKYTIEMPHONG')
export class PhieuDangKyTiemPhong {
  @PrimaryGeneratedColumn({ name: 'MaDangKy' })
  maDangKy: number;

  @Column({ name: 'MaKhachHang', nullable: true })
  maKhachHang: number;

  @Column({ name: 'MaThuCung', nullable: true })
  maThuCung: number;

  @Column({ name: 'NgayDangKy', type: 'datetime', nullable: true })
  ngayDangKy: Date;

  @Column({ name: 'MaDichVu', type: 'char', length: 5, nullable: true })
  maDichVu: string;

  @ManyToOne(() => KhachHang, { nullable: true })
  @JoinColumn({ name: 'MaKhachHang' })
  khachHang: KhachHang;

  @ManyToOne(() => ThuCung, { nullable: true })
  @JoinColumn({ name: 'MaThuCung' })
  thuCung: ThuCung;

  @ManyToOne(() => DichVuYTe, { nullable: true })
  @JoinColumn({ name: 'MaDichVu' })
  dichVu: DichVuYTe;
}
