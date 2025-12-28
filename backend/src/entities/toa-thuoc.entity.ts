import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { ThuCung } from './thu-cung.entity';
import { NhanVien } from './nhanvien.entity';
import { ChiTietToaThuoc } from './chi-tiet-toa-thuoc.entity';
import { GiayKhamBenhTongQuat } from './giay-kham-benh-tong-quat.entity';

@Entity('TOATHUOC')
export class ToaThuoc {
  @PrimaryGeneratedColumn()
  MaToaThuoc: number;

  @Column({ type: 'int', nullable: true })
  MaThuCung: number;

  @Column({ type: 'int', nullable: true })
  MaGiayKhamTongQuat: number;

  @Column({ type: 'char', length: 5, nullable: true })
  MaBacSi: string;

  @Column({ type: 'datetime2', nullable: true })
  NgayKham: Date;

  @Column({ type: 'decimal', precision: 18, scale: 0, nullable: true })
  TongTien: number;

  @ManyToOne(() => ThuCung, thuCung => thuCung.ToaThuocs)
  @JoinColumn({ name: 'MaThuCung' })
  ThuCung: ThuCung;

  @ManyToOne(() => GiayKhamBenhTongQuat)
  @JoinColumn({ name: 'MaGiayKhamTongQuat' })
  GiayKhamBenhTongQuat: GiayKhamBenhTongQuat;

  @ManyToOne(() => NhanVien, nhanvien => nhanvien.ToaThuocs)
  @JoinColumn({ name: 'MaBacSi' })
  BacSi: NhanVien;

  @OneToMany(() => ChiTietToaThuoc, chitiet => chitiet.ToaThuoc)
  ChiTiets: ChiTietToaThuoc[];
}


