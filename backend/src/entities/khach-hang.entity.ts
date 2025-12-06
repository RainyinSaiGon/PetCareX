import { Entity, PrimaryGeneratedColumn, Column, OneToMany, OneToOne } from 'typeorm';
import { ThuCung } from './thu-cung.entity';
import { KhachHangThanhVien } from './khach-hang-thanh-vien.entity';

@Entity('KHACHHANG')
export class KhachHang {
  @PrimaryGeneratedColumn({ name: 'MaKhachHang' })
  maKhachHang: number;

  @Column({ name: 'HoTen', type: 'nvarchar', length: 50, nullable: true })
  hoTen: string;

  @Column({ name: 'SoDienThoai', type: 'char', length: 10, nullable: true })
  soDienThoai: string;

  @OneToMany(() => ThuCung, thuCung => thuCung.khachHang)
  thuCungs: ThuCung[];

  @OneToOne(() => KhachHangThanhVien, thanhVien => thanhVien.khachHang)
  thanhVien: KhachHangThanhVien;
}
