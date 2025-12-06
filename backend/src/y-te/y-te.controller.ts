import { Controller, Get, Post, Body, Param, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { YTeService } from './y-te.service';
import {
  CreateKhamBenhTongQuatDto,
  CreateKhamBenhChuyenKhoaDto,
  CreateToaThuocDto,
  CreateGiayTiemPhongDto,
  CreatePhieuDangKyTiemPhongDto,
  CreateDanhGiaYTeDto,
} from './dto/y-te.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('y-te')
@UseGuards(JwtAuthGuard)
export class YTeController {
  constructor(private readonly yTeService: YTeService) {}

  // ========================
  // FV-01: LỊCH SỬ BỆNH ÁN
  // ========================

  @Get('lich-su-benh-an/:maThuCung')
  async getLichSuBenhAn(@Param('maThuCung', ParseIntPipe) maThuCung: number) {
    return this.yTeService.getLichSuBenhAn(maThuCung);
  }

  // ========================
  // FV-02: KHÁM BỆNH
  // ========================

  @Post('kham-tong-quat')
  async createKhamTongQuat(@Body() dto: CreateKhamBenhTongQuatDto) {
    return this.yTeService.createKhamTongQuat(dto);
  }

  @Get('kham-tong-quat/:maGiay')
  async getKhamTongQuat(@Param('maGiay', ParseIntPipe) maGiay: number) {
    return this.yTeService.getKhamTongQuat(maGiay);
  }

  @Post('kham-chuyen-khoa')
  async createKhamChuyenKhoa(@Body() dto: CreateKhamBenhChuyenKhoaDto) {
    return this.yTeService.createKhamChuyenKhoa(dto);
  }

  @Get('kham-chuyen-khoa/:maGiay')
  async getKhamChuyenKhoa(@Param('maGiay', ParseIntPipe) maGiay: number) {
    return this.yTeService.getKhamChuyenKhoa(maGiay);
  }

  // ========================
  // FV-03: KÊ ĐƠN THUỐC
  // ========================

  @Post('toa-thuoc')
  async createToaThuoc(@Body() dto: CreateToaThuocDto) {
    return this.yTeService.createToaThuoc(dto);
  }

  @Get('toa-thuoc/:soToaThuoc')
  async getToaThuoc(@Param('soToaThuoc') soToaThuoc: string) {
    return this.yTeService.getToaThuoc(soToaThuoc);
  }

  // ========================
  // TIÊM PHÒNG
  // ========================

  @Post('phieu-dang-ky')
  async createPhieuDangKy(@Body() dto: CreatePhieuDangKyTiemPhongDto) {
    return this.yTeService.createPhieuDangKy(dto);
  }

  @Get('phieu-dang-ky')
  async getAllPhieuDangKy() {
    return this.yTeService.getAllPhieuDangKy();
  }

  @Get('phieu-dang-ky/:maDangKy')
  async getPhieuDangKy(@Param('maDangKy', ParseIntPipe) maDangKy: number) {
    return this.yTeService.getPhieuDangKy(maDangKy);
  }

  @Post('giay-tiem-phong')
  async createGiayTiemPhong(@Body() dto: CreateGiayTiemPhongDto) {
    return this.yTeService.createGiayTiemPhong(dto);
  }

  @Get('giay-tiem-phong/kham-tong-quat/:maGiayKhamTongQuat')
  async getGiayTiemPhongByKhamTongQuat(@Param('maGiayKhamTongQuat', ParseIntPipe) maGiayKhamTongQuat: number) {
    return this.yTeService.getGiayTiemPhongByKhamTongQuat(maGiayKhamTongQuat);
  }

  // ========================
  // DỊCH VỤ Y TẾ
  // ========================

  @Get('dich-vu')
  async getAllDichVuYTe() {
    return this.yTeService.getAllDichVuYTe();
  }

  @Get('dich-vu/loai/:loai')
  async getDichVuYTeByLoai(@Param('loai') loai: string) {
    return this.yTeService.getDichVuYTeByLoai(loai);
  }

  // ========================
  // VACCINE
  // ========================

  @Get('vaccine')
  async getAllVaccines() {
    return this.yTeService.getAllVaccines();
  }

  @Get('vaccine/loai/:loai')
  async getVaccinesByLoai(@Param('loai') loai: string) {
    return this.yTeService.getVaccinesByLoai(loai);
  }

  // ========================
  // FC-05: ĐÁNH GIÁ
  // ========================

  @Post('danh-gia')
  async createDanhGia(@Body() dto: CreateDanhGiaYTeDto) {
    return this.yTeService.createDanhGia(dto);
  }

  @Get('danh-gia')
  async getAllDanhGiaYTe() {
    return this.yTeService.getAllDanhGiaYTe();
  }

  @Get('danh-gia/hoa-don/:maHoaDon')
  async getDanhGiaByHoaDon(@Param('maHoaDon', ParseIntPipe) maHoaDon: number) {
    return this.yTeService.getDanhGiaByHoaDon(maHoaDon);
  }

  // ========================
  // THỐNG KÊ
  // ========================

  @Get('thong-ke')
  async getYTeStatistics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.yTeService.getYTeStatistics(
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }
}
