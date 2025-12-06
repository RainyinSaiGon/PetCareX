import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { NhanVien } from './nhan-vien.entity';
import { ChiNhanh } from './chi-nhanh.entity';

@Entity('LICHLAMVIECBACSI')
export class LichLamViecBacSi {
  @PrimaryColumn({ name: 'MaBacSi', type: 'char', length: 5 })
  maBacSi: string;

  @PrimaryColumn({ name: 'MaChiNhanh', type: 'char', length: 4 })
  maChiNhanh: string;

  @PrimaryColumn({ name: 'Ngay', type: 'date' })
  ngay: Date;

  @Column({ name: 'TrangThai', type: 'nvarchar', length: 5, nullable: true })
  trangThai: string;

  @ManyToOne(() => NhanVien)
  @JoinColumn({ name: 'MaBacSi' })
  bacSi: NhanVien;

  @ManyToOne(() => ChiNhanh)
  @JoinColumn({ name: 'MaChiNhanh' })
  chiNhanh: ChiNhanh;
}
