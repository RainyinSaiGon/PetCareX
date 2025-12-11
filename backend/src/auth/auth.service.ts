import { Injectable, UnauthorizedException, ConflictException, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { User } from '../entities/user.entity';
import { UserRole, UserStatus } from '../common/enums/user-role.enum';
import { RegisterDto, LoginDto, RefreshTokenDto, ForgotPasswordDto, ResetPasswordDto, ChangePasswordDto } from './dto/auth.dto';

interface JwtPayload {
  sub: number;
  username: string;
  email: string;
  role: UserRole;
  ma_nhan_vien?: number;
  ma_khach_hang?: number;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto) {
    // Check if user exists
    const existingUser = await this.userRepository.findOne({
      where: [
        { email: registerDto.email },
        { username: registerDto.username },
      ],
    });

    if (existingUser) {
      throw new ConflictException('Email hoặc username đã tồn tại');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // Create user
    const user = this.userRepository.create({
      ...registerDto,
      password: hashedPassword,
      role: registerDto.role || UserRole.CUSTOMER,
      status: UserStatus.ACTIVE,
    });

    await this.userRepository.save(user);

    // Generate tokens
    const tokens = await this.generateTokens(user);

    // Save refresh token
    user.refresh_token = await bcrypt.hash(tokens.refresh_token, 10);
    await this.userRepository.save(user);

    return {
      ...tokens,
      user: this.sanitizeUser(user),
    };
  }

  async login(loginDto: LoginDto) {
    // Find user with relations
    const user = await this.userRepository.findOne({
      where: { username: loginDto.username },
      relations: ['nhan_vien', 'khach_hang'],
    });

    if (!user) {
      throw new UnauthorizedException('Thông tin đăng nhập không hợp lệ');
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Thông tin đăng nhập không hợp lệ');
    }

    if (!user.is_active || user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('Tài khoản đã bị vô hiệu hóa');
    }

    // Update last login
    user.last_login = new Date();
    await this.userRepository.save(user);

    // Generate tokens
    const tokens = await this.generateTokens(user);

    // Save refresh token
    user.refresh_token = await bcrypt.hash(tokens.refresh_token, 10);
    await this.userRepository.save(user);

    return {
      ...tokens,
      user: this.sanitizeUser(user),
    };
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto) {
    try {
      const payload = this.jwtService.verify(refreshTokenDto.refresh_token, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });

      const user = await this.userRepository.findOne({
        where: { id: payload.sub },
      });

      if (!user || !user.refresh_token) {
        throw new UnauthorizedException('Token không hợp lệ');
      }

      const isRefreshTokenValid = await bcrypt.compare(
        refreshTokenDto.refresh_token,
        user.refresh_token,
      );

      if (!isRefreshTokenValid) {
        throw new UnauthorizedException('Token không hợp lệ');
      }

      // Generate new tokens
      const tokens = await this.generateTokens(user);

      // Update refresh token
      user.refresh_token = await bcrypt.hash(tokens.refresh_token, 10);
      await this.userRepository.save(user);

      return tokens;
    } catch (error) {
      throw new UnauthorizedException('Token đã hết hạn hoặc không hợp lệ');
    }
  }

  async logout(userId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (user) {
      user.refresh_token = null;
      await this.userRepository.save(user);
    }
    return { message: 'Đăng xuất thành công' };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const user = await this.userRepository.findOne({
      where: { email: forgotPasswordDto.email },
    });

    if (!user) {
      // Don't reveal if email exists
      return { message: 'Nếu email tồn tại, link đặt lại mật khẩu đã được gửi' };
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = await bcrypt.hash(resetToken, 10);

    user.reset_token = hashedToken;
    user.reset_token_expires = new Date(Date.now() + 3600000); // 1 hour
    await this.userRepository.save(user);

    // TODO: Send email with reset token
    // In production, send email here
    // For now, return token (ONLY FOR DEVELOPMENT)
    return {
      message: 'Link đặt lại mật khẩu đã được gửi đến email',
      resetToken: resetToken, // Remove this in production
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const user = await this.userRepository.findOne({
      where: { email: resetPasswordDto.email },
    });

    if (!user || !user.reset_token || !user.reset_token_expires) {
      throw new BadRequestException('Token không hợp lệ hoặc đã hết hạn');
    }

    if (new Date() > user.reset_token_expires) {
      throw new BadRequestException('Token đã hết hạn');
    }

    const isTokenValid = await bcrypt.compare(
      resetPasswordDto.token,
      user.reset_token,
    );

    if (!isTokenValid) {
      throw new BadRequestException('Token không hợp lệ');
    }

    // Update password
    user.password = await bcrypt.hash(resetPasswordDto.newPassword, 10);
    user.reset_token = null;
    user.reset_token_expires = null;
    user.refresh_token = null; // Invalidate all sessions
    await this.userRepository.save(user);

    return { message: 'Mật khẩu đã được đặt lại thành công' };
  }

  async changePassword(userId: number, changePasswordDto: ChangePasswordDto) {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('Người dùng không tồn tại');
    }

    const isPasswordValid = await bcrypt.compare(
      changePasswordDto.currentPassword,
      user.password,
    );

    if (!isPasswordValid) {
      throw new BadRequestException('Mật khẩu hiện tại không đúng');
    }

    user.password = await bcrypt.hash(changePasswordDto.newPassword, 10);
    user.refresh_token = null; // Invalidate all sessions
    await this.userRepository.save(user);

    return { message: 'Đổi mật khẩu thành công' };
  }

  async getProfile(userId: number) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['nhan_vien', 'khach_hang'],
    });

    if (!user) {
      throw new UnauthorizedException('Người dùng không tồn tại');
    }

    return this.sanitizeUser(user);
  }

  async linkToEmployee(userId: number, maNhanVien: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    
    if (!user) {
      throw new NotFoundException('Người dùng không tồn tại');
    }

    user.ma_nhan_vien = maNhanVien;
    await this.userRepository.save(user);

    return { message: 'Liên kết nhân viên thành công' };
  }

  async linkToCustomer(userId: number, maKhachHang: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    
    if (!user) {
      throw new NotFoundException('Người dùng không tồn tại');
    }

    user.ma_khach_hang = maKhachHang;
    user.role = UserRole.CUSTOMER;
    await this.userRepository.save(user);

    return { message: 'Liên kết khách hàng thành công' };
  }

  private async generateTokens(user: User) {
    const payload: JwtPayload = {
      sub: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      ma_nhan_vien: user.ma_nhan_vien,
      ma_khach_hang: user.ma_khach_hang,
    };

    const [access_token, refresh_token] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_SECRET'),
        expiresIn: this.configService.get('JWT_EXPIRATION', '1h'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get('JWT_REFRESH_EXPIRATION', '7d'),
      }),
    ]);

    return {
      access_token,
      refresh_token,
    };
  }

  private sanitizeUser(user: User) {
    const { password, refresh_token, reset_token, ...result } = user;
    return result;
  }
}
