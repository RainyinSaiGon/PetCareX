import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { NhanVienService } from './nhan-vien.service';
import { CreateNhanVienDto, UpdateNhanVienDto } from './dto/nhan-vien.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('nhan-vien')
@UseGuards(JwtAuthGuard)
export class NhanVienController {
  constructor(private readonly nhanVienService: NhanVienService) {}

  // FQ-01 & FB-01: Quản lý nhân viên
  @Get()
  async findAll(
    @Query('maChiNhanh') maChiNhanh?: string,
    @Query('loaiNhanVien') loaiNhanVien?: string,
    @Query('search') search?: string,
  ) {
    return this.nhanVienService.findAll({ maChiNhanh, loaiNhanVien, search });
  }

  @Get('bac-si')
  async findAllDoctors() {
    return this.nhanVienService.findAllDoctors();
  }

  @Get('chi-nhanh/:maChiNhanh')
  async findByChiNhanh(@Param('maChiNhanh') maChiNhanh: string) {
    return this.nhanVienService.findByChiNhanh(maChiNhanh);
  }

  @Get(':maNhanVien')
  async findOne(@Param('maNhanVien') maNhanVien: string) {
    return this.nhanVienService.findOne(maNhanVien);
  }

  @Post()
  async create(@Body() dto: CreateNhanVienDto) {
    return this.nhanVienService.create(dto);
  }

  @Put(':maNhanVien')
  async update(@Param('maNhanVien') maNhanVien: string, @Body() dto: UpdateNhanVienDto) {
    return this.nhanVienService.update(maNhanVien, dto);
  }

  @Delete(':maNhanVien')
  async remove(@Param('maNhanVien') maNhanVien: string) {
    return this.nhanVienService.remove(maNhanVien);
  }

  // FV-04: Lịch làm việc bác sĩ
  @Get(':maNhanVien/lich-lam-viec')
  async getLichLamViec(
    @Param('maNhanVien') maNhanVien: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.nhanVienService.getLichLamViec(
      maNhanVien,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Post('lich-lam-viec')
  async createLichLamViec(@Body() data: { maBacSi: string; maChiNhanh: string; ngay: Date; trangThai?: string }) {
    return this.nhanVienService.createLichLamViec(data);
  }

  // FB-05: Hiệu suất nhân viên
  @Get('hieu-suat/:maChiNhanh')
  async getHieuSuatNhanVien(
    @Param('maChiNhanh') maChiNhanh: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.nhanVienService.getHieuSuatNhanVien(maChiNhanh, new Date(startDate), new Date(endDate));
  }

  // Get available doctors for appointment booking
  @Get('bac-si-kha-dung/:maChiNhanh')
  async getAvailableDoctors(
    @Param('maChiNhanh') maChiNhanh: string,
    @Query('ngay') ngay: string,
  ) {
    return this.nhanVienService.getAvailableDoctors(new Date(ngay), maChiNhanh);
  }
}
