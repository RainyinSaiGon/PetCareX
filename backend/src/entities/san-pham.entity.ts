import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('SANPHAM')
export class SanPham {
  @PrimaryColumn({ name: 'MaSanPham', type: 'char', length: 5 })
  maSanPham: string;

  @Column({ name: 'TenSanPham', type: 'nvarchar', length: 50, nullable: true })
  tenSanPham: string;

  @Column({ name: 'GiaTienSanPham', type: 'int', nullable: true })
  giaTienSanPham: number;

  @Column({ name: 'LoaiSanPham', type: 'nvarchar', length: 50, nullable: true })
  loaiSanPham: string;
}
