import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { LichHenService } from './lich-hen.service';
import { CreateLichHenDto, UpdateLichHenDto } from './dto/lich-hen.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('lich-hen')
@UseGuards(JwtAuthGuard)
export class LichHenController {
  constructor(private readonly lichHenService: LichHenService) {}

  // Statistics - place before :maLichHen to avoid route conflicts
  @Get('thong-ke/tong-hop')
  async getAppointmentStatistics(
    @Query('maChiNhanh') maChiNhanh?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.lichHenService.getAppointmentStatistics(
      maChiNhanh,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  // Get branches for booking
  @Get('booking/chi-nhanh')
  async getChiNhanhsForBooking() {
    return this.lichHenService.getChiNhanhsForBooking();
  }

  // Get available doctors for a branch on a date
  @Get('booking/bac-si/:maChiNhanh')
  async getAvailableDoctors(
    @Param('maChiNhanh') maChiNhanh: string,
    @Query('date') date: string,
  ) {
    return this.lichHenService.getAvailableDoctors(maChiNhanh, new Date(date));
  }

  // Get available slots for booking
  @Get('slots/:maChiNhanh/:maBacSi')
  async getAvailableSlots(
    @Param('maChiNhanh') maChiNhanh: string,
    @Param('maBacSi') maBacSi: string,
    @Query('date') date: string,
  ) {
    return this.lichHenService.getAvailableSlots(maChiNhanh, maBacSi, new Date(date));
  }

  // Get appointments by customer
  @Get('khach-hang/:maKhachHang')
  async getLichHenByKhachHang(@Param('maKhachHang', ParseIntPipe) maKhachHang: number) {
    return this.lichHenService.getLichHenByKhachHang(maKhachHang);
  }

  @Get('khach-hang/:maKhachHang/sap-toi')
  async getUpcomingAppointments(@Param('maKhachHang', ParseIntPipe) maKhachHang: number) {
    return this.lichHenService.getUpcomingAppointments(maKhachHang);
  }

  // FS-05: Quản lý lịch hẹn
  @Get('chi-nhanh/:maChiNhanh')
  async getLichHenByChiNhanh(
    @Param('maChiNhanh') maChiNhanh: string,
    @Query('date') date?: string,
  ) {
    return this.lichHenService.getLichHenByChiNhanh(
      maChiNhanh,
      date ? new Date(date) : undefined,
    );
  }

  @Get('bac-si/:maBacSi')
  async getLichHenByBacSi(
    @Param('maBacSi') maBacSi: string,
    @Query('date') date?: string,
  ) {
    return this.lichHenService.getLichHenByBacSi(
      maBacSi,
      date ? new Date(date) : undefined,
    );
  }

  // FC-01: Đặt lịch hẹn online
  @Post()
  async createLichHen(@Body() dto: CreateLichHenDto) {
    return this.lichHenService.createLichHen(dto);
  }

  @Get(':maLichHen')
  async getLichHen(@Param('maLichHen') maLichHen: string) {
    return this.lichHenService.getLichHen(maLichHen);
  }

  @Put(':maLichHen')
  async updateLichHen(@Param('maLichHen') maLichHen: string, @Body() dto: UpdateLichHenDto) {
    return this.lichHenService.updateLichHen(maLichHen, dto);
  }

  @Put(':maLichHen/huy')
  async cancelLichHen(@Param('maLichHen') maLichHen: string, @Body('lyDo') lyDo?: string) {
    return this.lichHenService.cancelLichHen(maLichHen, lyDo);
  }
}
