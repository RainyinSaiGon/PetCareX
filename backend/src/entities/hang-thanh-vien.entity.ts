import { Entity, Column, PrimaryColumn, OneToMany } from 'typeorm';
import { KhachHangThanhVien } from './khach-hang-thanh-vien.entity';

@Entity('HANGTHANHVIEN')
export class HangThanhVien {
  @PrimaryColumn({ type: 'varchar', length: 10 })
  TenHang: string;

  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true })
  GiamGia: number;

  @Column({ type: 'int', nullable: true, default: 0 })
  DiemTichLuyToiThieu: number;

  @OneToMany(() => KhachHangThanhVien, khtv => khtv.Hang)
  KhachHangThanhViens: KhachHangThanhVien[];
}
