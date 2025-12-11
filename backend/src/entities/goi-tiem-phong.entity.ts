import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { ChiTietGoiTiemPhong } from './chi-tiet-goi-tiem-phong.entity';

@Entity('GOITIEMPHONG')
export class GoiTiemPhong {
  @PrimaryGeneratedColumn({ name: 'MAGOITIEMPHONG' })
  MaGoiTiemPhong: number;

  @Column({ name: 'TENGOI', type: 'varchar', length: 200 })
  TenGoi: string;

  @Column({ name: 'DOITUONG', type: 'varchar', length: 100 })
  DoiTuong: string;

  @Column({ name: 'MOTA', type: 'text', nullable: true })
  MoTa: string;

  @Column({ name: 'TONGTIEN', type: 'decimal', precision: 15, scale: 2 })
  TongTien: number;

  @Column({ name: 'THOIHAN', type: 'int' })
  ThoiHan: number; // số tháng

  @Column({ name: 'TRANGTHAI', type: 'boolean', default: true })
  TrangThai: boolean;

  @OneToMany(() => ChiTietGoiTiemPhong, chiTiet => chiTiet.GoiTiemPhong)
  ChiTiets: ChiTietGoiTiemPhong[];
}
