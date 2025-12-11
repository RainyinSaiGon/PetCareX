import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { KhachHang } from './khach-hang.entity';
import { ThuCung } from './thu-cung.entity';
import { DichVuYTe } from './dich-vu-y-te.entity';
import { PhieuDangKyLe } from './phieu-dang-ky-le.entity';
import { PhieuDangKyGoi } from './phieu-dang-ky-goi.entity';
import { GiayKhamBenhTongQuat } from './giay-kham-benh-tong-quat.entity';

@Entity('PHIEUDANGKYTIEMPHONG')
export class PhieuDangKyTiemPhong {
  @PrimaryGeneratedColumn()
  MaDangKy: number;

  @Column({ type: 'int', nullable: true })
  MaKhachHang: number;

  @Column({ type: 'int', nullable: true })
  MaThuCung: number;

  @Column({ type: 'timestamp', nullable: true })
  NgayDangKy: Date;

  @Column({ type: 'char', length: 5, nullable: true })
  MaDichVu: string;

  @ManyToOne(() => KhachHang, khachHang => khachHang.PhieuDangKys)
  @JoinColumn({ name: 'MaKhachHang' })
  KhachHang: KhachHang;

  @ManyToOne(() => ThuCung, thuCung => thuCung.PhieuDangKys)
  @JoinColumn({ name: 'MaThuCung' })
  ThuCung: ThuCung;

  @ManyToOne(() => DichVuYTe, dichVu => dichVu.PhieuDangKys)
  @JoinColumn({ name: 'MaDichVu' })
  DichVu: DichVuYTe;

  @OneToMany(() => PhieuDangKyLe, pdkl => pdkl.PhieuDangKy)
  PhieuDangKyLes: PhieuDangKyLe[];

  @OneToMany(() => PhieuDangKyGoi, pdkg => pdkg.PhieuDangKy)
  PhieuDangKyGois: PhieuDangKyGoi[];

  @OneToMany(() => GiayKhamBenhTongQuat, giay => giay.PhieuDangKy)
  GiayKhamBenhs: GiayKhamBenhTongQuat[];
}
