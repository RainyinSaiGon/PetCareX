import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { PhieuDangKyTiemPhong } from './phieu-dang-ky-tiem-phong.entity';
import { GoiTiemPhong } from './goi-tiem-phong.entity';

@Entity('PHIEUDANGKYGOI')
export class PhieuDangKyGoi {
  @PrimaryGeneratedColumn({ name: 'MADANGKYGOI' })
  MaDangKyGoi: number;

  @Column({ name: 'MADANGKYTIEMPHONG' })
  MaDangKyTiemPhong: number;

  @ManyToOne(() => PhieuDangKyTiemPhong, pdktp => pdktp.PhieuDangKyGois)
  @JoinColumn({ name: 'MADANGKYTIEMPHONG' })
  PhieuDangKy: PhieuDangKyTiemPhong;

  @Column({ name: 'MAGOITIEMPHONG' })
  MaGoiTiemPhong: number;

  @ManyToOne(() => GoiTiemPhong)
  @JoinColumn({ name: 'MAGOITIEMPHONG' })
  GoiTiemPhong: GoiTiemPhong;

  @Column({ name: 'NGAYBATDAU', type: 'date' })
  NgayBatDau: Date;

  @Column({ name: 'NGAYHOANTHANH', type: 'date', nullable: true })
  NgayHoanThanh: Date;

  @Column({ name: 'TRANGTHAI', type: 'varchar', length: 50 })
  TrangThai: string;
}
