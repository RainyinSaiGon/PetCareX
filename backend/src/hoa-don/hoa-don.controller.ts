import { Controller, Get, Post, Body, Param, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { HoaDonService } from './hoa-don.service';
import { CreateHoaDonDto, AddSanPhamDto, AddDichVuYTeDto, CreateDanhGiaMuaHangDto } from './dto/hoa-don.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('hoa-don')
@UseGuards(JwtAuthGuard)
export class HoaDonController {
  constructor(private readonly hoaDonService: HoaDonService) {}

  // FS-03: Lập hóa đơn
  @Post()
  async createHoaDon(@Body() dto: CreateHoaDonDto) {
    return this.hoaDonService.createHoaDon(dto);
  }

  @Get()
  async findAllHoaDon(
    @Query('maChiNhanh') maChiNhanh?: string,
    @Query('maKhachHang') maKhachHang?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.hoaDonService.findAllHoaDon({
      maChiNhanh,
      maKhachHang,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });
  }

  // Thống kê - put before :maHoaDon to avoid route conflicts
  @Get('thong-ke/doanh-thu')
  async getDoanhThuThongKe(
    @Query('maChiNhanh') maChiNhanh?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.hoaDonService.getDoanhThuThongKe(
      maChiNhanh,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Get('thong-ke/top-san-pham')
  async getTopSanPham(
    @Query('maChiNhanh') maChiNhanh?: string,
    @Query('limit') limit?: number,
  ) {
    return this.hoaDonService.getTopSanPham(maChiNhanh, limit);
  }

  // FS-04: Tra cứu tồn kho
  @Get('ton-kho/:maChiNhanh')
  async searchInventory(
    @Param('maChiNhanh') maChiNhanh: string,
    @Query('search') search?: string,
  ) {
    return this.hoaDonService.searchInventory(maChiNhanh, search);
  }

  // FC-04: Lịch sử mua hàng
  @Get('lich-su/:maKhachHang')
  async getLichSuMuaHang(@Param('maKhachHang', ParseIntPipe) maKhachHang: number) {
    return this.hoaDonService.getLichSuMuaHang(maKhachHang);
  }

  @Get(':maHoaDon')
  async getHoaDon(@Param('maHoaDon', ParseIntPipe) maHoaDon: number) {
    return this.hoaDonService.getHoaDon(maHoaDon);
  }

  // Add products/services to existing invoice
  @Post(':maHoaDon/san-pham')
  async addSanPham(@Param('maHoaDon', ParseIntPipe) maHoaDon: number, @Body() dto: AddSanPhamDto) {
    return this.hoaDonService.addSanPham(maHoaDon, dto);
  }

  @Post(':maHoaDon/dich-vu')
  async addDichVuYTe(@Param('maHoaDon', ParseIntPipe) maHoaDon: number, @Body() dto: AddDichVuYTeDto) {
    return this.hoaDonService.addDichVuYTe(maHoaDon, dto);
  }

  // FC-05: Đánh giá mua hàng
  @Post(':maHoaDon/danh-gia')
  async createDanhGiaMuaHang(@Param('maHoaDon', ParseIntPipe) maHoaDon: number, @Body() dto: CreateDanhGiaMuaHangDto) {
    dto.maHoaDon = maHoaDon;
    return this.hoaDonService.createDanhGiaMuaHang(dto);
  }

  @Get(':maHoaDon/danh-gia')
  async getDanhGiaMuaHang(@Param('maHoaDon', ParseIntPipe) maHoaDon: number) {
    return this.hoaDonService.getDanhGiaMuaHang(maHoaDon);
  }
}

// Sản phẩm Controller
@Controller('san-pham')
@UseGuards(JwtAuthGuard)
export class SanPhamController {
  constructor(private readonly hoaDonService: HoaDonService) {}

  @Get()
  async getAllSanPham() {
    return this.hoaDonService.getAllSanPham();
  }

  @Get('loai/:loai')
  async getSanPhamByLoai(@Param('loai') loai: string) {
    return this.hoaDonService.getSanPhamByLoai(loai);
  }

  @Get('search')
  async searchSanPham(@Query('q') q: string) {
    return this.hoaDonService.searchSanPham(q);
  }
}
