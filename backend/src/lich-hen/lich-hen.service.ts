import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual } from 'typeorm';
import { LichHen } from '../entities/lich-hen.entity';
import { LichLamViecBacSi } from '../entities/lich-lam-viec-bac-si.entity';
import { NhanVien } from '../entities/nhan-vien.entity';
import { ChiNhanh } from '../entities/chi-nhanh.entity';
import { CreateLichHenDto, UpdateLichHenDto } from './dto/lich-hen.dto';

@Injectable()
export class LichHenService {
  constructor(
    @InjectRepository(LichHen)
    private lichHenRepo: Repository<LichHen>,
    @InjectRepository(LichLamViecBacSi)
    private lichLamViecRepo: Repository<LichLamViecBacSi>,
    @InjectRepository(NhanVien)
    private nhanVienRepo: Repository<NhanVien>,
    @InjectRepository(ChiNhanh)
    private chiNhanhRepo: Repository<ChiNhanh>,
  ) {}

  // FC-01: Đặt lịch hẹn online
  async createLichHen(dto: CreateLichHenDto) {
    // Check if doctor is available on that day
    if (dto.maBacSi) {
      const lichLamViec = await this.lichLamViecRepo.findOne({
        where: {
          maBacSi: dto.maBacSi,
          maChiNhanh: dto.maChiNhanh,
          ngay: new Date(dto.ngayHen),
          trangThai: 'Làm',
        },
      });

      if (!lichLamViec) {
        throw new BadRequestException('Bác sĩ không làm việc vào ngày này tại chi nhánh đã chọn');
      }
    }

    // Check for conflicting appointments
    const existingAppointment = await this.lichHenRepo.findOne({
      where: {
        maBacSi: dto.maBacSi,
        ngayHen: new Date(dto.ngayHen),
        gioHen: dto.gioHen,
        trangThai: 'Đã đặt',
      },
    });

    if (existingAppointment) {
      throw new BadRequestException('Bác sĩ đã có lịch hẹn vào thời điểm này');
    }

    const lichHen = this.lichHenRepo.create({
      ...dto,
      ngayHen: new Date(dto.ngayHen),
      ngayDat: new Date(),
      trangThai: dto.trangThai || 'Đã đặt',
    });

    return this.lichHenRepo.save(lichHen);
  }

  async getLichHen(maLichHen: string) {
    const lichHen = await this.lichHenRepo.findOne({
      where: { maLichHen },
      relations: ['khachHang', 'thuCung', 'bacSi', 'chiNhanh', 'dichVuYTe'],
    });
    if (!lichHen) {
      throw new NotFoundException('Không tìm thấy lịch hẹn');
    }
    return lichHen;
  }

  // Update appointment status
  async updateLichHen(maLichHen: string, dto: UpdateLichHenDto) {
    const lichHen = await this.getLichHen(maLichHen);
    Object.assign(lichHen, dto);
    if (dto.ngayHen) {
      lichHen.ngayHen = new Date(dto.ngayHen);
    }
    return this.lichHenRepo.save(lichHen);
  }

  // Cancel appointment
  async cancelLichHen(maLichHen: string, lyDo?: string) {
    const lichHen = await this.getLichHen(maLichHen);
    lichHen.trangThai = 'Đã hủy';
    lichHen.ghiChu = lyDo || lichHen.ghiChu;
    return this.lichHenRepo.save(lichHen);
  }

  // FC-01: Get customer's appointments
  async getLichHenByKhachHang(maKhachHang: number) {
    return this.lichHenRepo.find({
      where: { maKhachHang },
      relations: ['thuCung', 'bacSi', 'chiNhanh', 'dichVuYTe'],
      order: { ngayHen: 'DESC' },
    });
  }

  // Get upcoming appointments for customer
  async getUpcomingAppointments(maKhachHang: number) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return this.lichHenRepo.find({
      where: {
        maKhachHang,
        ngayHen: MoreThanOrEqual(today),
        trangThai: 'Đã đặt',
      },
      relations: ['thuCung', 'bacSi', 'chiNhanh', 'dichVuYTe'],
      order: { ngayHen: 'ASC', gioHen: 'ASC' },
    });
  }

  // FS-05: Quản lý lịch hẹn khách hàng (for staff)
  async getLichHenByChiNhanh(maChiNhanh: string, date?: Date) {
    const where: any = { maChiNhanh };
    
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      where.ngayHen = Between(startOfDay, endOfDay);
    }

    return this.lichHenRepo.find({
      where,
      relations: ['khachHang', 'thuCung', 'bacSi', 'dichVuYTe'],
      order: { ngayHen: 'ASC', gioHen: 'ASC' },
    });
  }

  // Get appointments for a specific doctor
  async getLichHenByBacSi(maBacSi: string, date?: Date) {
    const where: any = { maBacSi };
    
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      where.ngayHen = Between(startOfDay, endOfDay);
    }

    return this.lichHenRepo.find({
      where,
      relations: ['khachHang', 'thuCung', 'chiNhanh', 'dichVuYTe'],
      order: { ngayHen: 'ASC', gioHen: 'ASC' },
    });
  }

  // Get available time slots
  async getAvailableSlots(maChiNhanh: string, maBacSi: string, date: Date) {
    // Check if doctor works on this day
    const lichLamViec = await this.lichLamViecRepo.findOne({
      where: {
        maBacSi,
        maChiNhanh,
        ngay: date,
        trangThai: 'Làm',
      },
    });

    if (!lichLamViec) {
      return { available: false, slots: [] };
    }

    // Get existing appointments
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const existingAppointments = await this.lichHenRepo.find({
      where: {
        maBacSi,
        maChiNhanh,
        ngayHen: Between(startOfDay, endOfDay),
        trangThai: 'Đã đặt',
      },
      select: ['gioHen'],
    });

    const bookedSlots = existingAppointments.map(a => a.gioHen);

    // Generate available slots (8:00 - 17:00, 30 min intervals)
    const allSlots: string[] = [];
    for (let hour = 8; hour < 17; hour++) {
      for (const min of [0, 30]) {
        const timeStr = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
        allSlots.push(timeStr);
      }
    }

    const availableSlots = allSlots.filter(slot => !bookedSlots.includes(slot));

    return {
      available: true,
      slots: availableSlots,
      bookedSlots,
    };
  }

  // Get all branches for appointment booking
  async getChiNhanhsForBooking() {
    return this.chiNhanhRepo.find({
      order: { maChiNhanh: 'ASC' },
    });
  }

  // Get available doctors for a branch on a specific date
  async getAvailableDoctors(maChiNhanh: string, date: Date) {
    const lichLamViecs = await this.lichLamViecRepo.find({
      where: {
        maChiNhanh,
        ngay: date,
        trangThai: 'Làm',
      },
      relations: ['bacSi'],
    });

    return lichLamViecs.map(l => l.bacSi);
  }

  // Statistics
  async getAppointmentStatistics(maChiNhanh?: string, startDate?: Date, endDate?: Date) {
    const start = startDate || new Date(new Date().setMonth(new Date().getMonth() - 1));
    const end = endDate || new Date();

    const query = this.lichHenRepo.createQueryBuilder('lh')
      .where('lh.NgayHen BETWEEN :start AND :end', { start, end });

    if (maChiNhanh) {
      query.andWhere('lh.MaChiNhanh = :maChiNhanh', { maChiNhanh });
    }

    const [total, completed, cancelled] = await Promise.all([
      query.clone().getCount(),
      query.clone().andWhere('lh.TrangThai = :status', { status: 'Hoàn thành' }).getCount(),
      query.clone().andWhere('lh.TrangThai = :status', { status: 'Đã hủy' }).getCount(),
    ]);

    return {
      total,
      completed,
      cancelled,
      pending: total - completed - cancelled,
      completionRate: total > 0 ? ((completed / total) * 100).toFixed(2) : 0,
    };
  }
}
