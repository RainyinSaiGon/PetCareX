import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { KhachHang } from './khach-hang.entity';
import { ChungLoaiThuCung } from './chung-loai-thu-cung.entity';

@Entity('THUCUNG')
export class ThuCung {
  @PrimaryGeneratedColumn({ name: 'MaThuCung' })
  maThuCung: number;

  @Column({ name: 'TenThuCung', type: 'nvarchar', length: 20, nullable: true })
  tenThuCung: string;

  @Column({ name: 'NgaySinhThuCung', type: 'date', nullable: true })
  ngaySinhThuCung: Date;

  @Column({ name: 'MaKhachHang', nullable: true })
  maKhachHang: number;

  @Column({ name: 'MaChungLoai', type: 'char', length: 2, nullable: true })
  maChungLoai: string;

  @ManyToOne(() => KhachHang, khachHang => khachHang.thuCungs, { nullable: true })
  @JoinColumn({ name: 'MaKhachHang' })
  khachHang: KhachHang;

  @ManyToOne(() => ChungLoaiThuCung, { nullable: true })
  @JoinColumn({ name: 'MaChungLoai' })
  chungLoai: ChungLoaiThuCung;
}
