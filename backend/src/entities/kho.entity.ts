import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { NhanVien } from './nhan-vien.entity';

@Entity('KHO')
export class Kho {
  @PrimaryColumn({ name: 'MaKho', type: 'char', length: 4 })
  maKho: string;

  @Column({ name: 'NhanVienPhuTrach', type: 'char', length: 5, nullable: true })
  nhanVienPhuTrach: string;

  @ManyToOne(() => NhanVien, { nullable: true })
  @JoinColumn({ name: 'NhanVienPhuTrach' })
  nhanVien: NhanVien;
}
