import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('VACCINE')
export class Vaccine {
  @PrimaryColumn({ name: 'MaVaccine', type: 'char', length: 5 })
  maVaccine: string;

  @Column({ name: 'TenVaccine', type: 'nvarchar', length: 20, nullable: true })
  tenVaccine: string;

  @Column({ name: 'LoaiVaccine', type: 'nvarchar', length: 50, nullable: true })
  loaiVaccine: string;

  @Column({ name: 'GiaVaccine', type: 'int', nullable: true })
  giaVaccine: number;
}
