import { Injectable, UnauthorizedException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../entities/user.entity';
import { RegisterDto, LoginDto, CreateStaffAccountDto, UpdateRoleDto, ChangePasswordDto } from './dto/auth.dto';
import { Role, RoleDisplayNames } from './roles';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: [
        { username: registerDto.username },
        { email: registerDto.email }
      ]
    });

    if (existingUser) {
      throw new UnauthorizedException('Username or email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // Create new user - always KHACH_HANG for public registration
    const user = this.userRepository.create({
      username: registerDto.username,
      email: registerDto.email,
      password: hashedPassword,
      fullName: registerDto.fullName,
      phoneNumber: registerDto.phoneNumber,
      role: Role.KHACH_HANG, // Always customer for public registration
      isActive: true,
    });

    await this.userRepository.save(user);

    // Generate token
    const payload = { sub: user.id, username: user.username, role: user.role };
    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      user: this.sanitizeUser(user),
    };
  }

  async login(loginDto: LoginDto) {
    // Find user by username
    const user = await this.userRepository.findOne({
      where: { username: loginDto.username }
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new ForbiddenException('Account is deactivated. Please contact administrator.');
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate token with role
    const payload = { sub: user.id, username: user.username, role: user.role };
    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      user: this.sanitizeUser(user),
    };
  }

  // Admin/Manager: Create staff account
  async createStaffAccount(createDto: CreateStaffAccountDto, creatorRole: Role) {
    // Only admin can create admin accounts
    if (createDto.role === Role.ADMIN && creatorRole !== Role.ADMIN) {
      throw new ForbiddenException('Only admin can create admin accounts');
    }

    // Managers can only create staff-level accounts
    if (creatorRole === Role.QUAN_LY && 
        (createDto.role === Role.ADMIN || createDto.role === Role.QUAN_LY)) {
      throw new ForbiddenException('Managers can only create staff-level accounts');
    }

    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: [
        { username: createDto.username },
        { email: createDto.email }
      ]
    });

    if (existingUser) {
      throw new BadRequestException('Username or email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(createDto.password, 10);

    // Create staff user
    const user = this.userRepository.create({
      username: createDto.username,
      email: createDto.email,
      password: hashedPassword,
      fullName: createDto.fullName,
      phoneNumber: createDto.phoneNumber,
      role: createDto.role,
      maNhanVien: createDto.maNhanVien,
      isActive: true,
    });

    await this.userRepository.save(user);

    return {
      message: `Staff account created successfully with role: ${RoleDisplayNames[createDto.role]}`,
      user: this.sanitizeUser(user),
    };
  }

  // Admin: Update user role
  async updateUserRole(userId: number, updateDto: UpdateRoleDto, updaterRole: Role) {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Only admin can assign admin role
    if (updateDto.role === Role.ADMIN && updaterRole !== Role.ADMIN) {
      throw new ForbiddenException('Only admin can assign admin role');
    }

    // Cannot demote self if admin
    if (user.role === Role.ADMIN && updateDto.role !== Role.ADMIN) {
      throw new ForbiddenException('Cannot demote admin account');
    }

    user.role = updateDto.role;
    if (updateDto.maNhanVien) {
      user.maNhanVien = updateDto.maNhanVien;
    }

    await this.userRepository.save(user);

    return {
      message: `User role updated to: ${RoleDisplayNames[updateDto.role]}`,
      user: this.sanitizeUser(user),
    };
  }

  // Admin: Activate/Deactivate user
  async toggleUserStatus(userId: number, isActive: boolean) {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.role === Role.ADMIN) {
      throw new ForbiddenException('Cannot deactivate admin account');
    }

    user.isActive = isActive;
    await this.userRepository.save(user);

    return {
      message: isActive ? 'User activated' : 'User deactivated',
      user: this.sanitizeUser(user),
    };
  }

  // Change password
  async changePassword(userId: number, changeDto: ChangePasswordDto) {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(changeDto.currentPassword, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Hash and save new password
    user.password = await bcrypt.hash(changeDto.newPassword, 10);
    await this.userRepository.save(user);

    return { message: 'Password changed successfully' };
  }

  // Get all users (admin/manager)
  async getAllUsers(role?: Role) {
    const query = this.userRepository.createQueryBuilder('user');
    
    if (role) {
      query.where('user.role = :role', { role });
    }

    const users = await query.orderBy('user.createdAt', 'DESC').getMany();
    return users.map(user => this.sanitizeUser(user));
  }

  async validateUser(userId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    if (!user.isActive) {
      throw new ForbiddenException('Account is deactivated');
    }
    return this.sanitizeUser(user);
  }

  private sanitizeUser(user: User) {
    const { password, ...result } = user;
    return {
      ...result,
      roleDisplayName: RoleDisplayNames[user.role] || user.role,
    };
  }
}
