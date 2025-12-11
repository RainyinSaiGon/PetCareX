import { Entity, Column, PrimaryColumn, OneToMany } from 'typeorm';
import { NhanVien } from './nhanvien.entity';

@Entity('LOAINHANVIEN_LUONG')
export class LoaiNhanVienLuong {
  @PrimaryColumn({ type: 'varchar', length: 20 })
  LoaiNhanVien: string;

  @Column({ type: 'decimal', precision: 9, scale: 0, nullable: true })
  Luong: number;

  @OneToMany(() => NhanVien, nhanvien => nhanvien.LoaiNV)
  NhanViens: NhanVien[];
}
