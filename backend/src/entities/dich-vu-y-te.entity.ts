import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('DICHVUYTE')
export class DichVuYTe {
  @PrimaryColumn({ name: 'MaDichVu', type: 'char', length: 5 })
  maDichVu: string;

  @Column({ name: 'TenDichVu', type: 'nvarchar', length: 50, nullable: true })
  tenDichVu: string;

  @Column({ name: 'LoaiDichVu', type: 'nvarchar', length: 10, nullable: true })
  loaiDichVu: string;
}
