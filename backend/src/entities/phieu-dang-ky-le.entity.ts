import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { PhieuDangKyTiemPhong } from './phieu-dang-ky-tiem-phong.entity';
import { Vaccine } from './vaccine.entity';

@Entity('PHIEUDANGKYLE')
export class PhieuDangKyLe {
  @PrimaryGeneratedColumn({ name: 'MADANGKYLE' })
  MaDangKyLe: number;

  @Column({ name: 'MADANGKYTIEMPHONG' })
  MaDangKyTiemPhong: number;

  @ManyToOne(() => PhieuDangKyTiemPhong, pdktp => pdktp.PhieuDangKyLes)
  @JoinColumn({ name: 'MADANGKYTIEMPHONG' })
  PhieuDangKy: PhieuDangKyTiemPhong;

  @Column({ name: 'MAVACCINE' })
  MaVaccine: number;

  @ManyToOne(() => Vaccine, vaccine => vaccine.PhieuDangKyLes)
  @JoinColumn({ name: 'MAVACCINE' })
  Vaccine: Vaccine;

  @Column({ name: 'SOLUONG', type: 'int' })
  SoLuong: number;

  @Column({ name: 'DONGIA', type: 'decimal', precision: 15, scale: 2 })
  DonGia: number;

  @Column({ name: 'THANHTIEN', type: 'decimal', precision: 15, scale: 2 })
  ThanhTien: number;
}
