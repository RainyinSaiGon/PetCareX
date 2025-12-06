import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('HANGTHANHVIEN')
export class HangThanhVien {
  @PrimaryColumn({ name: 'TenHang', type: 'nvarchar', length: 10 })
  tenHang: string;

  @Column({ name: 'GiamGia', type: 'decimal', precision: 3, scale: 2, nullable: true })
  giamGia: number;
}
