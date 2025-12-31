import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LichHen } from '../../entities/lich-hen.entity';
import { NhanVien } from '../../entities/nhanvien.entity';
import { ChiNhanh } from '../../entities/chi-nhanh.entity';
import { DichVuYTe } from '../../entities/dich-vu-y-te.entity';
import { HoaDon } from '../../entities/hoa-don.entity';
import { CungCapDichVu } from '../../entities/cung-cap-dich-vu.entity';
import { ThanhToanDichVuYTe } from '../../entities/thanh-toan-dich-vu-y-te.entity';
import { AppointmentController } from './appointment.controller';
import { AppointmentService } from './appointment.service';

@Module({
    imports: [TypeOrmModule.forFeature([
        LichHen,
        NhanVien,
        ChiNhanh,
        DichVuYTe,
        HoaDon,
        CungCapDichVu,
        ThanhToanDichVuYTe
    ])],
    controllers: [AppointmentController],
    providers: [AppointmentService],
    exports: [AppointmentService],
})
export class AppointmentModule { }

