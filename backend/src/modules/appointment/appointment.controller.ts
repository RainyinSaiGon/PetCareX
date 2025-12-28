import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AppointmentService } from './appointment.service';

@Controller('api/appointments')
@UseGuards(JwtAuthGuard)
export class AppointmentController {
    constructor(private readonly appointmentService: AppointmentService) { }

    /**
     * Get list of doctors for assignment
     * GET /api/appointments/doctors
     */
    @Get('doctors')
    async getDoctors() {
        return this.appointmentService.getDoctors();
    }

    /**
     * Get all branches
     * GET /api/appointments/branches
     */
    @Get('branches')
    async getBranches() {
        return this.appointmentService.getBranches();
    }

    /**
     * Get services (optionally by branch)
     * GET /api/appointments/services?maChiNhanh=CN001
     */
    @Get('services')
    async getServices(@Query('maChiNhanh') maChiNhanh?: string) {
        return this.appointmentService.getServices(maChiNhanh);
    }

    /**
     * Get upcoming appointments for reminders
     * GET /api/appointments/upcoming
     */
    @Get('upcoming')
    async getUpcomingAppointments() {
        return this.appointmentService.getUpcomingAppointments();
    }

    /**
     * Get appointments for today
     * GET /api/appointments/today
     */
    @Get('today')
    async getTodayAppointments() {
        return this.appointmentService.getTodayAppointments();
    }

    /**
     * Get all appointments with optional filters
     * GET /api/appointments?date=2025-12-28&status=Chờ xác nhận&month=2025-12
     */
    @Get()
    async getAppointments(
        @Query('date') date?: string,
        @Query('status') status?: string,
        @Query('maBacSi') maBacSi?: string,
        @Query('month') month?: string,
    ) {
        return this.appointmentService.getAppointments({ date, status, maBacSi, month });
    }

    /**
     * Get appointment by ID
     * GET /api/appointments/:id
     */
    @Get(':id')
    async getAppointmentById(@Param('id', ParseIntPipe) id: number) {
        return this.appointmentService.getAppointmentById(id);
    }

    /**
     * Create new appointment (walk-in or scheduled)
     * POST /api/appointments
     */
    @Post()
    async createAppointment(@Body() createDto: {
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
        return this.appointmentService.createAppointment(createDto);
    }

    /**
     * Update appointment
     * PATCH /api/appointments/:id
     */
    @Patch(':id')
    async updateAppointment(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateDto: {
            trangThai?: string;
            ngayHen?: string;
            gioHen?: string;
            maBacSi?: string;
            ghiChu?: string;
        },
    ) {
        return this.appointmentService.updateAppointment(id, updateDto);
    }

    /**
     * Delete appointment
     * DELETE /api/appointments/:id
     */
    @Delete(':id')
    async deleteAppointment(@Param('id', ParseIntPipe) id: number) {
        return this.appointmentService.deleteAppointment(id);
    }
}
