import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { GoiTiemPhong } from './goi-tiem-phong.entity';
import { Vaccine } from './vaccine.entity';

@Entity('CHITIETGOITIEMPHONG')
export class ChiTietGoiTiemPhong {
  @PrimaryGeneratedColumn({ name: 'MACHITIET' })
  MaChiTiet: number;

  @Column({ name: 'MAGOITIEMPHONG' })
  MaGoiTiemPhong: number;

  @ManyToOne(() => GoiTiemPhong, goi => goi.ChiTiets)
  @JoinColumn({ name: 'MAGOITIEMPHONG' })
  GoiTiemPhong: GoiTiemPhong;

  @Column({ name: 'MAVACCINE' })
  MaVaccine: number;

  @ManyToOne(() => Vaccine, vaccine => vaccine.ChiTiets)
  @JoinColumn({ name: 'MAVACCINE' })
  Vaccine: Vaccine;

  @Column({ name: 'SOLUONG', type: 'int' })
  SoLuong: number;

  @Column({ name: 'THUTUMUITIEM', type: 'int' })
  ThuTuMuiTiem: number;

  @Column({ name: 'KHOANGCACHTIEM', type: 'int' })
  KhoangCachTiem: number; // số ngày

  @Column({ name: 'GHICHU', type: 'text', nullable: true })
  GhiChu: string;
}
