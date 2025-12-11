import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { UserRole, UserStatus } from '../common/enums/user-role.enum';
import { NhanVien } from './nhanvien.entity';
import { KhachHang } from './khach-hang.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  full_name: string;

  @Column({ nullable: true })
  phone: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.CUSTOMER,
  })
  role: UserRole;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.ACTIVE,
  })
  status: UserStatus;

  // Link to Employee (for staff roles)
  @Column({ nullable: true })
  ma_nhan_vien: number;

  @ManyToOne(() => NhanVien, { nullable: true })
  @JoinColumn({ name: 'ma_nhan_vien' })
  nhan_vien: NhanVien;

  // Link to Customer (for customer role)
  @Column({ nullable: true })
  ma_khach_hang: number;

  @ManyToOne(() => KhachHang, { nullable: true })
  @JoinColumn({ name: 'ma_khach_hang' })
  khach_hang: KhachHang;

  // Refresh token for JWT
  @Column({ nullable: true, type: 'text' })
  refresh_token: string | null;

  // Password reset
  @Column({ nullable: true, type: 'text' })
  reset_token: string | null;

  @Column({ nullable: true, type: 'timestamp' })
  reset_token_expires: Date | null;

  // Last login tracking
  @Column({ nullable: true, type: 'timestamp' })
  last_login: Date;

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
