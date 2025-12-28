import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { HoaDon } from './hoa-don.entity';
import { DichVuYTe } from './dich-vu-y-te.entity';

@Entity('DANHGIAYTE')
export class DanhGiaYTe {
  @PrimaryGeneratedColumn({ name: 'MADANHGIAYTE' })
  MaDanhGiaYTe: number;

  @Column({ name: 'MAHOADON' })
  MaHoaDon: number;

  @ManyToOne(() => HoaDon)
  @JoinColumn({ name: 'MAHOADON' })
  HoaDon: HoaDon;

  @Column({ name: 'MADICHVU', type: 'char', length: 5 })
  MaDichVu: string;

  @ManyToOne(() => DichVuYTe, dichVu => dichVu.DanhGias)
  @JoinColumn({ name: 'MADICHVU' })
  DichVu: DichVuYTe;

  @Column({ name: 'SOSAO', type: 'int' })
  SoSao: number;

  @Column({ name: 'NHANXET', type: 'text', nullable: true })
  NhanXet: string;

  @Column({ name: 'NGAYDANHGIA', type: 'datetime2', default: () => 'GETDATE()' })
  NgayDanhGia: Date;
}

