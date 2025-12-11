import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { KhachHangThanhVien } from './khach-hang-thanh-vien.entity';
import { ThuCung } from './thu-cung.entity';
import { LichHen } from './lich-hen.entity';
import { HoaDon } from './hoa-don.entity';
import { PhieuDangKyTiemPhong } from './phieu-dang-ky-tiem-phong.entity';

@Entity('KHACHHANG')
export class KhachHang {
  @PrimaryGeneratedColumn()
  MaKhachHang: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  HoTen: string;

  @Column({ type: 'char', length: 10, nullable: true, unique: true })
  SoDienThoai: string;

  @OneToMany(() => KhachHangThanhVien, khtv => khtv.KhachHang)
  ThanhVien: KhachHangThanhVien[];

  @OneToMany(() => ThuCung, thuCung => thuCung.KhachHang)
  ThuCungs: ThuCung[];

  @OneToMany(() => LichHen, lichHen => lichHen.KhachHang)
  LichHens: LichHen[];

  @OneToMany(() => HoaDon, hoaDon => hoaDon.KhachHang)
  HoaDons: HoaDon[];

  @OneToMany(() => PhieuDangKyTiemPhong, pdktp => pdktp.KhachHang)
  PhieuDangKys: PhieuDangKyTiemPhong[];
}
