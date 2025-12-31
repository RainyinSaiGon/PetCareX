import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvoiceController } from './invoice.controller';
import { InvoiceService } from './invoice.service';
import { HoaDon } from '../../entities/hoa-don.entity';
import { HoaDonSanPham } from '../../entities/hoa-don-san-pham.entity';
import { ChiNhanh } from '../../entities/chi-nhanh.entity';
import { ThanhToanDichVuYTe } from '../../entities/thanh-toan-dich-vu-y-te.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            HoaDon,
            HoaDonSanPham,
            ChiNhanh,
            ThanhToanDichVuYTe,
        ]),
    ],
    controllers: [InvoiceController],
    providers: [InvoiceService],
    exports: [InvoiceService],
})
export class InvoiceModule { }
