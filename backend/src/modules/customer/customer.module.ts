import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerController } from './customer.controller';
import { CustomerService } from './customer.service';
import { KhachHang } from '../../entities/khach-hang.entity';
import { ThuCung } from '../../entities/thu-cung.entity';
import { ChungLoaiThuCung } from '../../entities/chung-loai-thu-cung.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([KhachHang, ThuCung, ChungLoaiThuCung]),
  ],
  controllers: [CustomerController],
  providers: [CustomerService],
  exports: [CustomerService],
})
export class CustomerModule {}
