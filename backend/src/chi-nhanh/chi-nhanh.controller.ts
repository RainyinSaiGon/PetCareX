import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ChiNhanhService } from './chi-nhanh.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('chi-nhanh')
@UseGuards(JwtAuthGuard)
export class ChiNhanhController {
  constructor(private readonly chiNhanhService: ChiNhanhService) {}

  @Get()
  async findAll() {
    return this.chiNhanhService.findAll();
  }

  @Get(':maChiNhanh')
  async findOne(@Param('maChiNhanh') maChiNhanh: string) {
    return this.chiNhanhService.findOne(maChiNhanh);
  }

  @Post()
  async create(@Body() data: any) {
    return this.chiNhanhService.create(data);
  }

  @Put(':maChiNhanh')
  async update(@Param('maChiNhanh') maChiNhanh: string, @Body() data: any) {
    return this.chiNhanhService.update(maChiNhanh, data);
  }

  @Delete(':maChiNhanh')
  async remove(@Param('maChiNhanh') maChiNhanh: string) {
    return this.chiNhanhService.remove(maChiNhanh);
  }

  // FQ-02: Báo cáo doanh thu toàn hệ thống
  @Get('bao-cao/doanh-thu-toan-he-thong')
  async getDoanhThuToanHeThong(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.chiNhanhService.getDoanhThuToanHeThong(new Date(startDate), new Date(endDate));
  }

  // FQ-03: Thống kê dịch vụ phổ biến
  @Get('bao-cao/dich-vu-thong-ke')
  async getDichVuThongKe(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.chiNhanhService.getDichVuThongKe(new Date(startDate), new Date(endDate));
  }

  // FB-02: Báo cáo doanh thu chi nhánh
  @Get(':maChiNhanh/doanh-thu')
  async getDoanhThu(
    @Param('maChiNhanh') maChiNhanh: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.chiNhanhService.getDoanhThu(maChiNhanh, new Date(startDate), new Date(endDate));
  }

  // FB-03: Quản lý tồn kho sản phẩm
  @Get(':maChiNhanh/kho-san-pham')
  async getKhoSanPham(@Param('maChiNhanh') maChiNhanh: string) {
    return this.chiNhanhService.getKhoSanPham(maChiNhanh);
  }

  @Get(':maChiNhanh/san-pham-sap-het')
  async getSanPhamSapHetHang(
    @Param('maChiNhanh') maChiNhanh: string,
    @Query('threshold') threshold?: number,
  ) {
    return this.chiNhanhService.getSanPhamSapHetHang(maChiNhanh, threshold);
  }

  // FB-04: Quản lý tồn kho vaccine (uses maKho not maChiNhanh)
  @Get('kho-vaccine/:maKho')
  async getKhoVaccine(@Param('maKho') maKho: string) {
    return this.chiNhanhService.getKhoVaccine(maKho);
  }

  // Get products expiring soon
  @Get(':maChiNhanh/san-pham-sap-het-han')
  async getSanPhamSapHetHan(
    @Param('maChiNhanh') maChiNhanh: string,
    @Query('days') days?: number,
  ) {
    return this.chiNhanhService.getSanPhamSapHetHan(maChiNhanh, days);
  }

  // FB-06: Thống kê dịch vụ y tế chi nhánh
  @Get(':maChiNhanh/thong-ke-dich-vu')
  async getDichVuYTeThongKe(
    @Param('maChiNhanh') maChiNhanh: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.chiNhanhService.getDichVuYTeThongKe(maChiNhanh, new Date(startDate), new Date(endDate));
  }

  // FB-07: Thống kê mua hàng chi nhánh
  @Get(':maChiNhanh/thong-ke-mua-hang')
  async getMuaHangThongKe(
    @Param('maChiNhanh') maChiNhanh: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.chiNhanhService.getMuaHangThongKe(maChiNhanh, new Date(startDate), new Date(endDate));
  }

  // Dashboard
  @Get(':maChiNhanh/dashboard')
  async getDashboard(@Param('maChiNhanh') maChiNhanh: string) {
    return this.chiNhanhService.getDashboardSummary(maChiNhanh);
  }

  // Get staff of branch
  @Get(':maChiNhanh/nhan-vien')
  async getNhanVien(@Param('maChiNhanh') maChiNhanh: string) {
    return this.chiNhanhService.getNhanVien(maChiNhanh);
  }
}
