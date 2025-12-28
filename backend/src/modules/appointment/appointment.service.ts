import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual, LessThanOrEqual, Between } from 'typeorm';
import { LichHen } from '../../entities/lich-hen.entity';
import { NhanVien } from '../../entities/nhanvien.entity';
import { ChiNhanh } from '../../entities/chi-nhanh.entity';
import { DichVuYTe } from '../../entities/dich-vu-y-te.entity';

@Injectable()
export class AppointmentService {
    constructor(
        @InjectRepository(LichHen)
        private appointmentRepository: Repository<LichHen>,
        @InjectRepository(NhanVien)
        private nhanVienRepository: Repository<NhanVien>,
        @InjectRepository(ChiNhanh)
        private chiNhanhRepository: Repository<ChiNhanh>,
        @InjectRepository(DichVuYTe)
        private dichVuRepository: Repository<DichVuYTe>,
    ) { }

    /**
     * Get all branches
     */
    async getBranches() {
        const branches = await this.chiNhanhRepository.find();
        return branches.map(b => ({
            MaChiNhanh: b.MaChiNhanh,
            TenChiNhanh: b.TenChiNhanh,
            DiaChi: b.DiaChi,
            SDT: b.SDT,
        }));
    }

    /**
     * Get services for a branch
     */
    async getServices(maChiNhanh?: string) {
        const queryBuilder = this.dichVuRepository.createQueryBuilder('dv');

        // If branch is specified, we could filter by services offered at that branch
        // For now, return all services
        const services = await queryBuilder.getMany();

        return services.map(s => ({
            MaDichVu: s.MaDichVu,
            TenDichVu: s.TenDichVu,
            LoaiDichVu: s.LoaiDichVu,
        }));
    }

    /**
     * Get all doctors (veterinarians)
     */
    async getDoctors() {
        const doctors = await this.nhanVienRepository
            .createQueryBuilder('nv')
            .leftJoin('nv.Khoa', 'k')
            .where('k.TenKhoa LIKE :khoa', { khoa: '%Bác sĩ%' })
            .orWhere('k.TenKhoa LIKE :khoa2', { khoa2: '%Thú y%' })
            .orWhere('k.TenKhoa LIKE :khoa3', { khoa3: '%bác sĩ%' })
            .orWhere('k.TenKhoa LIKE :khoa4', { khoa4: '%thú y%' })
            .getMany();

        // If no doctors found with department filter, get all employees as fallback
        if (doctors.length === 0) {
            const allEmployees = await this.nhanVienRepository.find({ take: 20 });
            return allEmployees.map((d) => ({
                maNhanVien: d.MaNhanVien,
                hoTen: d.HoTen,
            }));
        }

        return doctors.map((d) => ({
            maNhanVien: d.MaNhanVien,
            hoTen: d.HoTen,
        }));
    }

    /**
     * Get appointments with optional filters
     */
    async getAppointments(filters: { date?: string; status?: string; maBacSi?: string; month?: string }) {
        const queryBuilder = this.appointmentRepository
            .createQueryBuilder('a')
            .leftJoinAndSelect('a.KhachHang', 'kh')
            .leftJoinAndSelect('a.ThuCung', 'tc')
            .leftJoinAndSelect('tc.ChungLoai', 'cl')
            .leftJoinAndSelect('a.BacSi', 'bs')
            .leftJoinAndSelect('a.ChiNhanh', 'cn')
            .leftJoinAndSelect('a.DichVu', 'dv');

        if (filters.date) {
            queryBuilder.andWhere('a.NgayHen = :date', { date: filters.date });
        }

        if (filters.month) {
            // Get all appointments for a specific month (YYYY-MM format)
            const [year, month] = filters.month.split('-');
            const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
            const endDate = new Date(parseInt(year), parseInt(month), 0);
            queryBuilder.andWhere('a.NgayHen BETWEEN :start AND :end', {
                start: startDate.toISOString().split('T')[0],
                end: endDate.toISOString().split('T')[0],
            });
        }

        if (filters.status) {
            queryBuilder.andWhere('a.TrangThai = :status', { status: filters.status });
        }

        if (filters.maBacSi) {
            queryBuilder.andWhere('a.MaBacSi = :maBacSi', { maBacSi: filters.maBacSi });
        }

        queryBuilder.orderBy('a.NgayHen', 'ASC').addOrderBy('a.GioHen', 'ASC');

        const appointments = await queryBuilder.getMany();

        return appointments.map((a) => this.mapAppointmentToResponse(a));
    }

    /**
     * Get today's appointments
     */
    async getTodayAppointments() {
        const today = new Date().toISOString().split('T')[0];
        return this.getAppointments({ date: today });
    }

    /**
     * Get upcoming appointments for reminders
     */
    async getUpcomingAppointments() {
        const now = new Date();
        const today = now.toISOString().split('T')[0];
        const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const currentTime = now.toTimeString().slice(0, 5);

        const queryBuilder = this.appointmentRepository
            .createQueryBuilder('a')
            .leftJoinAndSelect('a.KhachHang', 'kh')
            .leftJoinAndSelect('a.ThuCung', 'tc')
            .leftJoinAndSelect('tc.ChungLoai', 'cl')
            .leftJoinAndSelect('a.BacSi', 'bs')
            .where('a.TrangThai NOT IN (:...statuses)', { statuses: ['Đã hoàn thành', 'Đã hủy'] })
            .andWhere('(a.NgayHen = :today OR a.NgayHen = :tomorrow)', { today, tomorrow })
            .orderBy('a.NgayHen', 'ASC')
            .addOrderBy('a.GioHen', 'ASC');

        const appointments = await queryBuilder.getMany();

        return appointments.map((a) => {
            const appointmentDate = new Date(a.NgayHen).toISOString().split('T')[0];
            const isToday = appointmentDate === today;
            const isTomorrow = appointmentDate === tomorrow;

            // Calculate if within 1 hour
            let isUrgent = false;
            if (isToday && a.GioHen) {
                const [apptHour, apptMin] = a.GioHen.split(':').map(Number);
                const [nowHour, nowMin] = currentTime.split(':').map(Number);
                const apptMinutes = apptHour * 60 + apptMin;
                const nowMinutes = nowHour * 60 + nowMin;
                isUrgent = apptMinutes - nowMinutes <= 60 && apptMinutes - nowMinutes >= 0;
            }

            return {
                ...this.mapAppointmentToResponse(a),
                isToday,
                isTomorrow,
                isUrgent,
            };
        });
    }

    /**
     * Get appointment by ID
     */
    async getAppointmentById(id: number) {
        const appointment = await this.appointmentRepository.findOne({
            where: { MaLichHen: id },
            relations: ['KhachHang', 'ThuCung', 'ThuCung.ChungLoai', 'BacSi', 'ChiNhanh', 'DichVu'],
        });

        if (!appointment) {
            throw new NotFoundException(`Appointment with ID ${id} not found`);
        }

        return this.mapAppointmentToResponse(appointment);
    }

    /**
     * Create new appointment
     */
    async createAppointment(dto: {
        maKhachHang: number;
        maThuCung: number;
        maBacSi?: string;
        maChiNhanh?: string;
        maDichVu?: string;
        ngayHen: string;
        gioHen: string;
        gioBatDau?: string;
        gioKetThuc?: string;
        trangThai?: string;
        ghiChu?: string;
    }) {
        // Calculate end time if not provided (start + 20 minutes)
        let gioKetThuc = dto.gioKetThuc;
        if (!gioKetThuc && dto.gioBatDau) {
            const [hours, minutes] = dto.gioBatDau.split(':').map(Number);
            const endMinutes = hours * 60 + minutes + 20;
            const endHours = Math.floor(endMinutes / 60) % 24;
            const endMins = endMinutes % 60;
            gioKetThuc = `${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}`;
        }

        const appointment = this.appointmentRepository.create({
            MaKhachHang: dto.maKhachHang,
            MaThuCung: dto.maThuCung,
            MaBacSi: dto.maBacSi || undefined,
            MaChiNhanh: dto.maChiNhanh || undefined,
            MaDichVu: dto.maDichVu || undefined,
            NgayHen: new Date(dto.ngayHen),
            GioHen: dto.gioHen,
            GioBatDau: dto.gioBatDau || dto.gioHen,
            GioKetThuc: gioKetThuc || undefined,
            TrangThai: dto.trangThai || 'Đang chờ',
            GhiChu: dto.ghiChu || undefined,
        });

        const saved = await this.appointmentRepository.save(appointment);
        return this.getAppointmentById(saved.MaLichHen);
    }

    /**
     * Update appointment
     */
    async updateAppointment(
        id: number,
        dto: {
            trangThai?: string;
            ngayHen?: string;
            gioHen?: string;
            maBacSi?: string;
            ghiChu?: string;
        },
    ) {
        const appointment = await this.appointmentRepository.findOne({
            where: { MaLichHen: id },
        });

        if (!appointment) {
            throw new NotFoundException(`Appointment with ID ${id} not found`);
        }

        if (dto.trangThai) appointment.TrangThai = dto.trangThai;
        if (dto.ngayHen) appointment.NgayHen = new Date(dto.ngayHen);
        if (dto.gioHen) appointment.GioHen = dto.gioHen;
        if (dto.maBacSi !== undefined) appointment.MaBacSi = dto.maBacSi;
        if (dto.ghiChu !== undefined) appointment.GhiChu = dto.ghiChu;

        await this.appointmentRepository.save(appointment);
        return this.getAppointmentById(id);
    }

    /**
     * Delete appointment
     */
    async deleteAppointment(id: number) {
        const appointment = await this.appointmentRepository.findOne({
            where: { MaLichHen: id },
        });

        if (!appointment) {
            throw new NotFoundException(`Appointment with ID ${id} not found`);
        }

        await this.appointmentRepository.remove(appointment);
        return { success: true, message: 'Appointment deleted successfully' };
    }

    /**
     * Map entity to response DTO
     */
    private mapAppointmentToResponse(a: LichHen) {
        return {
            maLichHen: a.MaLichHen,
            ngayHen: a.NgayHen,
            gioHen: a.GioHen,
            gioBatDau: a.GioBatDau,
            gioKetThuc: a.GioKetThuc,
            trangThai: a.TrangThai,
            ghiChu: a.GhiChu,
            khachHang: a.KhachHang
                ? {
                    maKhachHang: a.KhachHang.MaKhachHang,
                    hoTen: a.KhachHang.HoTen,
                    soDienThoai: a.KhachHang.SoDienThoai,
                }
                : null,
            thuCung: a.ThuCung
                ? {
                    maThuCung: a.ThuCung.MaThuCung,
                    tenThuCung: a.ThuCung.TenThuCung,
                    chungLoai: a.ThuCung.ChungLoai?.TenChungLoaiThuCung,
                }
                : null,
            bacSi: a.BacSi
                ? {
                    maNhanVien: a.BacSi.MaNhanVien,
                    hoTen: a.BacSi.HoTen,
                }
                : null,
            chiNhanh: a.ChiNhanh
                ? {
                    maChiNhanh: a.ChiNhanh.MaChiNhanh,
                    tenChiNhanh: a.ChiNhanh.TenChiNhanh,
                }
                : null,
            dichVu: a.DichVu
                ? {
                    maDichVu: a.DichVu.MaDichVu,
                    tenDichVu: a.DichVu.TenDichVu,
                }
                : null,
        };
    }
}
