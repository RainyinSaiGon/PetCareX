import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ChiNhanh } from './chi-nhanh.entity';
import { Khoa } from './khoa.entity';
import { LoaiNhanVienLuong } from './loai-nhan-vien-luong.entity';

@Entity('NHANVIEN')
export class NhanVien {
  @PrimaryColumn({ name: 'MaNhanVien', type: 'char', length: 5 })
  maNhanVien: string;

  @Column({ name: 'HoTen', type: 'nvarchar', length: 50, nullable: true })
  hoTen: string;

  @Column({ name: 'NgayVaoLam', type: 'date', nullable: true })
  ngayVaoLam: Date;

  @Column({ name: 'NgayNghiLam', type: 'date', nullable: true })
  ngayNghiLam: Date;

  @Column({ name: 'NgaySinh', type: 'date', nullable: true })
  ngaySinh: Date;

  @Column({ name: 'SDT', type: 'char', length: 10, nullable: true })
  sdt: string;

  @Column({ name: 'MaChiNhanh', type: 'char', length: 4, nullable: true })
  maChiNhanh: string;

  @Column({ name: 'LoaiNhanVien', type: 'nvarchar', length: 20, nullable: true })
  loaiNhanVien: string;

  @Column({ name: 'MaKhoa', type: 'char', length: 2, nullable: true })
  maKhoa: string;

  @ManyToOne(() => ChiNhanh, chiNhanh => chiNhanh.nhanViens, { nullable: true })
  @JoinColumn({ name: 'MaChiNhanh' })
  chiNhanh: ChiNhanh;

  @ManyToOne(() => Khoa, { nullable: true })
  @JoinColumn({ name: 'MaKhoa' })
  khoa: Khoa;

  @ManyToOne(() => LoaiNhanVienLuong, { nullable: true })
  @JoinColumn({ name: 'LoaiNhanVien' })
  loaiNhanVienLuong: LoaiNhanVienLuong;
}
