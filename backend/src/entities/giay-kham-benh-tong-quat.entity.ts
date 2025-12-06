import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ThuCung } from './thu-cung.entity';
import { PhieuDangKyTiemPhong } from './phieu-dang-ky-tiem-phong.entity';

@Entity('GIAYKHAMBENHTONGQUAT')
export class GiayKhamBenhTongQuat {
  @PrimaryGeneratedColumn({ name: 'MaGiayKhamTongQuat' })
  maGiayKhamTongQuat: number;

  @Column({ name: 'NhietDo', type: 'float', nullable: true })
  nhietDo: number;

  @Column({ name: 'MoTa', type: 'nvarchar', length: 100, nullable: true })
  moTa: string;

  @Column({ name: 'MaThuCung', nullable: true })
  maThuCung: number;

  @Column({ name: 'MaPhieuDangKyTiemPhong', nullable: true })
  maPhieuDangKyTiemPhong: number;

  @ManyToOne(() => ThuCung, { nullable: true })
  @JoinColumn({ name: 'MaThuCung' })
  thuCung: ThuCung;

  @ManyToOne(() => PhieuDangKyTiemPhong, { nullable: true })
  @JoinColumn({ name: 'MaPhieuDangKyTiemPhong' })
  phieuDangKy: PhieuDangKyTiemPhong;
}
