import { Entity, Column, PrimaryColumn, OneToMany } from 'typeorm';
import { GiayTiemPhong } from './giay-tiem-phong.entity';
import { PhieuDangKyLe } from './phieu-dang-ky-le.entity';
import { PhieuDangKyGoi } from './phieu-dang-ky-goi.entity';
import { ChiTietGoiTiemPhong } from './chi-tiet-goi-tiem-phong.entity';
import { KhoVaccine } from './kho-vaccine.entity';

@Entity('VACCINE')
export class Vaccine {
  @PrimaryColumn({ type: 'char', length: 5 })
  MaVaccine: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  TenVaccine: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  LoaiVaccine: string;

  @Column({ type: 'int', nullable: true })
  GiaVaccine: number;

  @OneToMany(() => GiayTiemPhong, giay => giay.Vaccine)
  GiayTiemPhongs: GiayTiemPhong[];

  @OneToMany(() => PhieuDangKyLe, pdkl => pdkl.Vaccine)
  PhieuDangKyLes: PhieuDangKyLe[];

  @OneToMany(() => PhieuDangKyGoi, pdkg => pdkg.GoiTiemPhong)
  PhieuDangKyGois: PhieuDangKyGoi[];

  @OneToMany(() => ChiTietGoiTiemPhong, ctgtp => ctgtp.Vaccine)
  ChiTiets: ChiTietGoiTiemPhong[];

  @OneToMany(() => KhoVaccine, kv => kv.Vaccine)
  KhoVaccines: KhoVaccine[];
}
