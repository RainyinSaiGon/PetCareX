import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { NhanVien } from './nhanvien.entity';
import { ChiNhanh } from './chi-nhanh.entity';

@Entity('LICHLAMVIECBACSI')
export class LichLamViecBacSi {
  @PrimaryColumn({ type: 'char', length: 5 })
  MaBacSi: string;

  @PrimaryColumn({ type: 'char', length: 4 })
  MaChiNhanh: string;

  @PrimaryColumn({ type: 'date' })
  Ngay: Date;

  @Column({ type: 'varchar', length: 5, nullable: true })
  TrangThai: string;

  @ManyToOne(() => NhanVien, nhanVien => nhanVien.LichLamViecs)
  @JoinColumn({ name: 'MaBacSi' })
  BacSi: NhanVien;

  @ManyToOne(() => ChiNhanh, chiNhanh => chiNhanh.LichLamViecs)
  @JoinColumn({ name: 'MaChiNhanh' })
  ChiNhanh: ChiNhanh;
}
