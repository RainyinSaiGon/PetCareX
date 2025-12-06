import { Entity, PrimaryColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { NhanVien } from './nhan-vien.entity';

@Entity('CHINHANH')
export class ChiNhanh {
  @PrimaryColumn({ name: 'MaChiNhanh', type: 'char', length: 4 })
  maChiNhanh: string;

  @Column({ name: 'TenChiNhanh', type: 'nvarchar', length: 70, nullable: true })
  tenChiNhanh: string;

  @Column({ name: 'DiaChi', type: 'nvarchar', length: 150, nullable: true })
  diaChi: string;

  @Column({ name: 'SDT', type: 'char', length: 10, nullable: true })
  sdt: string;

  @Column({ name: 'MaQuanLy', type: 'char', length: 5, nullable: true })
  maQuanLy: string;

  @Column({ name: 'ThoiGianMoCua', type: 'time', nullable: true })
  thoiGianMoCua: string;

  @Column({ name: 'ThoiGianDongCua', type: 'time', nullable: true })
  thoiGianDongCua: string;

  @ManyToOne(() => NhanVien, { nullable: true })
  @JoinColumn({ name: 'MaQuanLy' })
  quanLy: NhanVien;

  @OneToMany(() => NhanVien, nhanVien => nhanVien.chiNhanh)
  nhanViens: NhanVien[];
}
