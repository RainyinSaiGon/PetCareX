import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { GiayKhamBenhTongQuat } from './giay-kham-benh-tong-quat.entity';
import { GiayKhamBenhChuyenKhoa } from './giay-kham-benh-chuyen-khoa.entity';

@Entity('CHITIETKHAMBENRCHUANDOAN')
export class ChiTietKhamBenhChuanDoan {
  @PrimaryGeneratedColumn({ name: 'MACHITIETCHUANDOAN' })
  MaChiTietChuanDoan: number;

  @Column({ name: 'MAGIAYKHAMBENHTONGQUAT', nullable: true })
  MaGiayKhamBenhTongQuat: number;

  @ManyToOne(() => GiayKhamBenhTongQuat, gkbtq => gkbtq.ChiTietChuanDoans)
  @JoinColumn({ name: 'MAGIAYKHAMBENHTONGQUAT' })
  GiayKhamBenhTongQuat: GiayKhamBenhTongQuat;

  @Column({ name: 'MAGIAYKHAMBENHCHUYENKHOA', nullable: true })
  MaGiayKhamBenhChuyenKhoa: number;

  @ManyToOne(() => GiayKhamBenhChuyenKhoa, gkbck => gkbck.ChiTietChuanDoans)
  @JoinColumn({ name: 'MAGIAYKHAMBENHCHUYENKHOA' })
  GiayKhamBenhChuyenKhoa: GiayKhamBenhChuyenKhoa;

  @Column({ name: 'CHUANDOAN', type: 'text' })
  ChuanDoan: string;
}
