import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { ThuCung } from './thu-cung.entity';
import { PhieuDangKyTiemPhong } from './phieu-dang-ky-tiem-phong.entity';
import { GiayTiemPhong } from './giay-tiem-phong.entity';
import { ChiTietKhamBenhChuanDoan } from './chi-tiet-kham-benh-chuan-doan.entity';
import { ChiTietKhamBenhTrieuChung } from './chi-tiet-kham-benh-trieu-chung.entity';

@Entity('GIAYKHAMBENHTONGQUAT')
export class GiayKhamBenhTongQuat {
  @PrimaryGeneratedColumn()
  MaGiayKhamTongQuat: number;

  @Column({ type: 'float', nullable: true })
  NhietDo: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  MoTa: string;

  @Column({ type: 'int', nullable: true })
  MaThuCung: number;

  @Column({ type: 'int', nullable: true })
  MaPhieuDangKyTiemPhong: number;

  @ManyToOne(() => ThuCung, thuCung => thuCung.GiayKhamTongQuats)
  @JoinColumn({ name: 'MaThuCung' })
  ThuCung: ThuCung;

  @ManyToOne(() => PhieuDangKyTiemPhong, pdktp => pdktp.GiayKhamBenhs)
  @JoinColumn({ name: 'MaPhieuDangKyTiemPhong' })
  PhieuDangKy: PhieuDangKyTiemPhong;

  @OneToMany(() => GiayTiemPhong, giay => giay.GiayKhamTongQuat)
  GiayTiemPhongs: GiayTiemPhong[];

  @OneToMany(() => ChiTietKhamBenhChuanDoan, ctcd => ctcd.GiayKhamBenhTongQuat)
  ChiTietChuanDoans: ChiTietKhamBenhChuanDoan[];

  @OneToMany(() => ChiTietKhamBenhTrieuChung, ctct => ctct.GiayKhamBenhTongQuat)
  ChiTietTrieuChungs: ChiTietKhamBenhTrieuChung[];
}
