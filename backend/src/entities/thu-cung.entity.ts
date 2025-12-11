import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { KhachHang } from './khach-hang.entity';
import { ChungLoaiThuCung } from './chung-loai-thu-cung.entity';
import { LichHen } from './lich-hen.entity';
import { GiayKhamBenhTongQuat } from './giay-kham-benh-tong-quat.entity';
import { GiayKhamBenhChuyenKhoa } from './giay-kham-benh-chuyen-khoa.entity';
import { ToaThuoc } from './toa-thuoc.entity';
import { PhieuDangKyTiemPhong } from './phieu-dang-ky-tiem-phong.entity';

@Entity('THUCUNG')
export class ThuCung {
  @PrimaryGeneratedColumn()
  MaThuCung: number;

  @Column({ type: 'varchar', length: 20, nullable: true })
  TenThuCung: string;

  @Column({ type: 'date', nullable: true })
  NgaySinhThuCung: Date;

  @Column({ type: 'int', nullable: true })
  MaKhachHang: number;

  @Column({ type: 'char', length: 2, nullable: true })
  MaChungLoai: string;

  @ManyToOne(() => KhachHang, khachHang => khachHang.ThuCungs)
  @JoinColumn({ name: 'MaKhachHang' })
  KhachHang: KhachHang;

  @ManyToOne(() => ChungLoaiThuCung)
  @JoinColumn({ name: 'MaChungLoai' })
  ChungLoai: ChungLoaiThuCung;

  @OneToMany(() => LichHen, lichHen => lichHen.ThuCung)
  LichHens: LichHen[];

  @OneToMany(() => GiayKhamBenhTongQuat, giay => giay.ThuCung)
  GiayKhamTongQuats: GiayKhamBenhTongQuat[];

  @OneToMany(() => GiayKhamBenhChuyenKhoa, giay => giay.ThuCung)
  GiayKhamChuyenKhoas: GiayKhamBenhChuyenKhoa[];

  @OneToMany(() => ToaThuoc, toa => toa.ThuCung)
  ToaThuocs: ToaThuoc[];

  @OneToMany(() => PhieuDangKyTiemPhong, pdktp => pdktp.ThuCung)
  PhieuDangKys: PhieuDangKyTiemPhong[];
}
