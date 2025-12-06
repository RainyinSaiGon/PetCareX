import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Role } from '../auth/roles';

@Entity('KHACHHANG')
export class User {
  @PrimaryGeneratedColumn({ name: 'MaKhachHang' })
  id: number;

  @Column({ name: 'TenKhachHang', type: 'nvarchar', length: 100, unique: true })
  username: string;

  @Column({ name: 'Email', type: 'nvarchar', length: 255, unique: true })
  email: string;

  @Column({ name: 'MatKhau', type: 'nvarchar', length: 255 })
  password: string;

  @Column({ name: 'HoTen', type: 'nvarchar', length: 200, nullable: true })
  fullName: string;

  @Column({ name: 'SDT', type: 'char', length: 10, nullable: true })
  phoneNumber: string;

  @Column({ name: 'VaiTro', type: 'nvarchar', length: 20, default: Role.KHACH_HANG })
  role: Role;

  @Column({ name: 'MaNhanVien', type: 'char', length: 5, nullable: true })
  maNhanVien: string; // Link to NHANVIEN table for staff roles

  @Column({ name: 'TrangThai', type: 'bit', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'NgayTao', type: 'datetime2', default: () => 'GETDATE()' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'NgayCapNhat', type: 'datetime2', default: () => 'GETDATE()' })
  updatedAt: Date;
}
