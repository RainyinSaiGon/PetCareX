import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { ThuCung } from './thu-cung.entity';
import { NhanVien } from './nhanvien.entity';
import { DichVuYTe } from './dich-vu-y-te.entity';
import { ChiTietKhamBenhChuanDoan } from './chi-tiet-kham-benh-chuan-doan.entity';
import { ChiTietKhamBenhTrieuChung } from './chi-tiet-kham-benh-trieu-chung.entity';

@Entity('GIAYKHAMBENHCHUYENKHOA')
export class GiayKhamBenhChuyenKhoa {
  @PrimaryGeneratedColumn()
  MaGiayKhamChuyenKhoa: number;

  @Column({ type: 'timestamp', nullable: true })
  NgayKham: Date;

  @Column({ type: 'timestamp', nullable: true })
  NgayTaiKham: Date;

  @Column({ type: 'char', length: 5, nullable: true })
  MaBacSi: string;

  @Column({ type: 'int', nullable: true })
  MaThuCung: number;

  @Column({ type: 'char', length: 5, nullable: true })
  MaDichVu: string;

  @ManyToOne(() => NhanVien, nhanvien => nhanvien.GiayKhamBenhChuyenKhoas)
  @JoinColumn({ name: 'MaBacSi' })
  BacSi: NhanVien;

  @ManyToOne(() => ThuCung, thuCung => thuCung.GiayKhamChuyenKhoas)
  @JoinColumn({ name: 'MaThuCung' })
  ThuCung: ThuCung;

  @ManyToOne(() => DichVuYTe, dichvu => dichvu.GiayKhamBenhs)
  @JoinColumn({ name: 'MaDichVu' })
  DichVu: DichVuYTe;

  @OneToMany(() => ChiTietKhamBenhChuanDoan, ctcd => ctcd.GiayKhamBenhChuyenKhoa)
  ChiTietChuanDoans: ChiTietKhamBenhChuanDoan[];

  @OneToMany(() => ChiTietKhamBenhTrieuChung, ctct => ctct.GiayKhamBenhChuyenKhoa)
  ChiTietTrieuChungs: ChiTietKhamBenhTrieuChung[];
}
