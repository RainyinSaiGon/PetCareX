import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { NhanVien } from './nhan-vien.entity';

@Entity('TOATHUOC')
export class ToaThuoc {
  @PrimaryColumn({ name: 'SoToaThuoc', type: 'char', length: 6 })
  soToaThuoc: string;

  @Column({ name: 'MaThuCung', type: 'char', length: 5, nullable: true })
  maThuCung: string;

  @Column({ name: 'MaBacSi', type: 'char', length: 5, nullable: true })
  maBacSi: string;

  @Column({ name: 'NgayKeDon', type: 'datetime', nullable: true })
  ngayKeDon: Date;

  @Column({ name: 'GhiChu', type: 'nvarchar', length: 500, nullable: true })
  ghiChu: string;

  // Relations
  // Note: MaThuCung is char(5) in TOATHUOC but int in THUCUNG - relation not possible with direct FK
  
  @ManyToOne(() => NhanVien, { nullable: true })
  @JoinColumn({ name: 'MaBacSi' })
  bacSi: NhanVien;

  @OneToMany('CtToaThuoc', 'toaThuoc')
  chiTietToaThuocs: any[];
}
