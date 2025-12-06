import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('GOITIEMPHONG')
export class GoiTiemPhong {
  @PrimaryColumn({ name: 'MaGoi', type: 'char', length: 4 })
  maGoi: string;

  @Column({ name: 'TenGoi', type: 'nvarchar', length: 50, nullable: true })
  tenGoi: string;

  @Column({ name: 'GiaGoi', type: 'int', nullable: true })
  giaGoi: number;
}
