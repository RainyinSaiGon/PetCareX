import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LichHen } from '../../entities/lich-hen.entity';
import { NhanVien } from '../../entities/nhanvien.entity';
import { ChiNhanh } from '../../entities/chi-nhanh.entity';
import { DichVuYTe } from '../../entities/dich-vu-y-te.entity';
import { AppointmentController } from './appointment.controller';
import { AppointmentService } from './appointment.service';

@Module({
    imports: [TypeOrmModule.forFeature([LichHen, NhanVien, ChiNhanh, DichVuYTe])],
    controllers: [AppointmentController],
    providers: [AppointmentService],
    exports: [AppointmentService],
})
export class AppointmentModule { }
