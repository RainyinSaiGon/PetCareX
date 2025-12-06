import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { NhanVien } from './nhan-vien.entity';
import { ThuCung } from './thu-cung.entity';
import { DichVuYTe } from './dich-vu-y-te.entity';

@Entity('GIAYKHAMBENHCHUYENKHOA')
export class GiayKhamBenhChuyenKhoa {
  @PrimaryGeneratedColumn({ name: 'MaGiayKhamChuyenKhoa' })
  maGiayKhamChuyenKhoa: number;

  @Column({ name: 'NgayKham', type: 'datetime', nullable: true })
  ngayKham: Date;

  @Column({ name: 'NgayTaiKham', type: 'datetime', nullable: true })
  ngayTaiKham: Date;

  @Column({ name: 'MaBacSi', type: 'char', length: 5, nullable: true })
  maBacSi: string;

  @Column({ name: 'MaThuCung', nullable: true })
  maThuCung: number;

  @Column({ name: 'MaDichVu', type: 'char', length: 5, nullable: true })
  maDichVu: string;

  @ManyToOne(() => NhanVien, { nullable: true })
  @JoinColumn({ name: 'MaBacSi' })
  bacSi: NhanVien;

  @ManyToOne(() => ThuCung, { nullable: true })
  @JoinColumn({ name: 'MaThuCung' })
  thuCung: ThuCung;

  @ManyToOne(() => DichVuYTe, { nullable: true })
  @JoinColumn({ name: 'MaDichVu' })
  dichVu: DichVuYTe;
}
