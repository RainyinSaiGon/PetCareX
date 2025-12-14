import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerController } from './controllers/customer.controller';
import { CustomerService } from './services/customer.service';
import { PetController } from './controllers/pet.controller';
import { PetService } from './services/pet.service';
import { KhachHang } from '../../entities/khach-hang.entity';
import { KhachHangThanhVien } from '../../entities/khach-hang-thanh-vien.entity';
import { ThuCung } from '../../entities/thu-cung.entity';
import { HoaDon } from '../../entities/hoa-don.entity';
import { LichHen } from '../../entities/lich-hen.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      KhachHang,
      KhachHangThanhVien,
      ThuCung,
      HoaDon,
      LichHen,
    ]),
  ],
  controllers: [CustomerController, PetController],
  providers: [CustomerService, PetService],
  exports: [CustomerService, PetService],
})
export class SalesModule {}
