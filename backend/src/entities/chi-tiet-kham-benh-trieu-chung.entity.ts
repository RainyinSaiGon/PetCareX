import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { GiayKhamBenhTongQuat } from './giay-kham-benh-tong-quat.entity';
import { GiayKhamBenhChuyenKhoa } from './giay-kham-benh-chuyen-khoa.entity';

@Entity('CHITIETKHAMBENHTRIEUZHUNG')
export class ChiTietKhamBenhTrieuChung {
  @PrimaryGeneratedColumn({ name: 'MACHITIETTRIEUZHUNG' })
  MaChiTietTrieuChung: number;

  @Column({ name: 'MAGIAYKHAMBENHTONGQUAT', nullable: true })
  MaGiayKhamBenhTongQuat: number;

  @ManyToOne(() => GiayKhamBenhTongQuat, gkbtq => gkbtq.ChiTietTrieuChungs)
  @JoinColumn({ name: 'MAGIAYKHAMBENHTONGQUAT' })
  GiayKhamBenhTongQuat: GiayKhamBenhTongQuat;

  @Column({ name: 'MAGIAYKHAMBENHCHUYENKHOA', nullable: true })
  MaGiayKhamBenhChuyenKhoa: number;

  @ManyToOne(() => GiayKhamBenhChuyenKhoa, gkbck => gkbck.ChiTietTrieuChungs)
  @JoinColumn({ name: 'MAGIAYKHAMBENHCHUYENKHOA' })
  GiayKhamBenhChuyenKhoa: GiayKhamBenhChuyenKhoa;

  @Column({ name: 'TRIEUZHUNG', type: 'text' })
  TrieuChung: string;
}
