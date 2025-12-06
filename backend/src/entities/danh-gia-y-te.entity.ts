import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { HoaDon } from './hoa-don.entity';

@Entity('DANHGIAYTE')
export class DanhGiaYTe {
  @PrimaryGeneratedColumn({ name: 'MaDanhGia' })
  maDanhGia: number;

  @Column({ name: 'BinhLuan', type: 'nvarchar', length: 200, nullable: true })
  binhLuan: string;

  @Column({ name: 'MucDoHaiLong', type: 'int', nullable: true })
  mucDoHaiLong: number;

  @Column({ name: 'ThaiDoNhanVien', type: 'int', nullable: true })
  thaiDoNhanVien: number;

  @Column({ name: 'DiemChatLuongDichVu', type: 'int', nullable: true })
  diemChatLuongDichVu: number;

  @Column({ name: 'MaHoaDon', nullable: true })
  maHoaDon: number;

  @ManyToOne(() => HoaDon, { nullable: true })
  @JoinColumn({ name: 'MaHoaDon' })
  hoaDon: HoaDon;
}
