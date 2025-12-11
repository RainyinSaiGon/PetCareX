import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UserRole } from '../common/enums/user-role.enum';

interface JwtPayload {
  sub: number;
  username: string;
  email: string;
  role: UserRole;
  ma_nhan_vien?: number;
  ma_khach_hang?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET') || 'fallback-secret',
    });
  }

  async validate(payload: JwtPayload) {
    return {
      id: payload.sub,
      username: payload.username,
      email: payload.email,
      role: payload.role,
      ma_nhan_vien: payload.ma_nhan_vien,
      ma_khach_hang: payload.ma_khach_hang,
    };
  }
}
