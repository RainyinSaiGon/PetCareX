import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { NhanVien } from './nhan-vien.entity';
import { KhachHang } from './khach-hang.entity';

@Entity('HOADON')
export class HoaDon {
  @PrimaryGeneratedColumn({ name: 'MaHoaDon' })
  maHoaDon: number;

  @Column({ name: 'NgayLap', type: 'datetime', nullable: true })
  ngayLap: Date;

  @Column({ name: 'GiamGia', type: 'int', nullable: true })
  giamGia: number;

  @Column({ name: 'TongTien', type: 'decimal', precision: 15, scale: 2, nullable: true })
  tongTien: number;

  @Column({ name: 'MaNhanVien', type: 'char', length: 5, nullable: true })
  maNhanVien: string;

  @Column({ name: 'MaKhachHang', nullable: true })
  maKhachHang: number;

  // Relations
  @ManyToOne(() => NhanVien, { nullable: true })
  @JoinColumn({ name: 'MaNhanVien' })
  nhanVien: NhanVien;

  @ManyToOne(() => KhachHang, { nullable: true })
  @JoinColumn({ name: 'MaKhachHang' })
  khachHang: KhachHang;

  // One-to-many relations
  @OneToMany('CtSanPham', 'hoaDon')
  ctSanPhams: any[];

  @OneToMany('CtDichVuYTe', 'hoaDon')
  ctDichVuYTes: any[];
}
