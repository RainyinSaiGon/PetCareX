import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Vaccine } from './vaccine.entity';
import { NhanVien } from './nhan-vien.entity';
import { GiayKhamBenhTongQuat } from './giay-kham-benh-tong-quat.entity';

@Entity('GIAYTIEMPHONG')
export class GiayTiemPhong {
  @PrimaryGeneratedColumn({ name: 'MaGiayTiem' })
  maGiayTiem: number;

  @Column({ name: 'MaVaccine', type: 'char', length: 5, nullable: true })
  maVaccine: string;

  @Column({ name: 'MaBacSi', type: 'char', length: 5, nullable: true })
  maBacSi: string;

  @Column({ name: 'LieuLuong', type: 'int', nullable: true })
  lieuLuong: number;

  @Column({ name: 'NgayTiem', type: 'datetime', nullable: true })
  ngayTiem: Date;

  @Column({ name: 'MaGiayKhamTongQuat', nullable: true })
  maGiayKhamTongQuat: number;

  @ManyToOne(() => Vaccine, { nullable: true })
  @JoinColumn({ name: 'MaVaccine' })
  vaccine: Vaccine;

  @ManyToOne(() => NhanVien, { nullable: true })
  @JoinColumn({ name: 'MaBacSi' })
  bacSi: NhanVien;

  @ManyToOne(() => GiayKhamBenhTongQuat, { nullable: true })
  @JoinColumn({ name: 'MaGiayKhamTongQuat' })
  giayKhamTongQuat: GiayKhamBenhTongQuat;
}
