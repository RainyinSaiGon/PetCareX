import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Vaccine } from './vaccine.entity';
import { NhanVien } from './nhanvien.entity';
import { GiayKhamBenhTongQuat } from './giay-kham-benh-tong-quat.entity';

@Entity('GIAYTIEMPHONG')
export class GiayTiemPhong {
  @PrimaryGeneratedColumn()
  MaGiayTiem: number;

  @Column({ type: 'char', length: 5, nullable: true })
  MaVaccine: string;

  @Column({ type: 'char', length: 5, nullable: true })
  MaBacSi: string;

  @Column({ type: 'int', nullable: true })
  LieuLuong: number;

  @Column({ type: 'timestamp', nullable: true })
  NgayTiem: Date;

  @Column({ type: 'int', nullable: true })
  MaGiayKhamTongQuat: number;

  @ManyToOne(() => Vaccine, vaccine => vaccine.GiayTiemPhongs)
  @JoinColumn({ name: 'MaVaccine' })
  Vaccine: Vaccine;

  @ManyToOne(() => NhanVien, nhanvien => nhanvien.GiayTiemPhongs)
  @JoinColumn({ name: 'MaBacSi' })
  BacSi: NhanVien;

  @ManyToOne(() => GiayKhamBenhTongQuat, giay => giay.GiayTiemPhongs)
  @JoinColumn({ name: 'MaGiayKhamTongQuat' })
  GiayKhamTongQuat: GiayKhamBenhTongQuat;
}
