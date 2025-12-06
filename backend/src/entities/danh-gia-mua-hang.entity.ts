import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { HoaDon } from './hoa-don.entity';

@Entity('DANHGIAMUAHANG')
export class DanhGiaMuaHang {
  @PrimaryGeneratedColumn({ name: 'MaDanhGia' })
  maDanhGia: number;

  @Column({ name: 'BinhLuan', type: 'nvarchar', length: 200, nullable: true })
  binhLuan: string;

  @Column({ name: 'MaHoaDon', nullable: true })
  maHoaDon: number;

  @Column({ name: 'MucDoHaiLong', type: 'int', nullable: true })
  mucDoHaiLong: number;

  @Column({ name: 'ThaiDoNhanVien', type: 'int', nullable: true })
  thaiDoNhanVien: number;

  @ManyToOne(() => HoaDon, { nullable: true })
  @JoinColumn({ name: 'MaHoaDon' })
  hoaDon: HoaDon;
}
