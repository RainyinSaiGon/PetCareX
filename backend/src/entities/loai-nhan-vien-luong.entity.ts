import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('LOAINHANVIEN_LUONG')
export class LoaiNhanVienLuong {
  @PrimaryColumn({ name: 'LoaiNhanVien', type: 'nvarchar', length: 20 })
  loaiNhanVien: string;

  @Column({ name: 'Luong', type: 'decimal', precision: 9, scale: 0, nullable: true })
  luong: number;
}
