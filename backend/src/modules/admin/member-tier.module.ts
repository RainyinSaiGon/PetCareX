import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { KhachHang } from '../../entities/khach-hang.entity';
import { KhachHangThanhVien } from '../../entities/khach-hang-thanh-vien.entity';
import { HangThanhVien } from '../../entities/hang-thanh-vien.entity';
import { HoaDon } from '../../entities/hoa-don.entity';
import { MemberTierService } from './member-tier.service';
import { MemberTierController } from './member-tier.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      KhachHang,
      KhachHangThanhVien,
      HangThanhVien,
      HoaDon,
    ]),
    ScheduleModule.forRoot(),
  ],
  controllers: [MemberTierController],
  providers: [MemberTierService],
  exports: [MemberTierService],
})
export class MemberTierModule {}
