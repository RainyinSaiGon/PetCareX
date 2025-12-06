import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { KhachHangService } from './khach-hang.service';
import { CreateKhachHangDto, UpdateKhachHangDto, CreateThuCungDto, UpdateThuCungDto } from './dto/khach-hang.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('khach-hang')
@UseGuards(JwtAuthGuard)
export class KhachHangController {
  constructor(private readonly khachHangService: KhachHangService) {}

  // FS-01: Quản lý khách hàng
  @Get()
  async findAll(@Query('search') search?: string) {
    return this.khachHangService.findAll({ search });
  }

  @Get('statistics')
  async getStatistics() {
    return this.khachHangService.getKhachHangStatistics();
  }

  @Get(':maKhachHang')
  async findOne(@Param('maKhachHang', ParseIntPipe) maKhachHang: number) {
    return this.khachHangService.findOne(maKhachHang);
  }

  @Post()
  async create(@Body() dto: CreateKhachHangDto) {
    return this.khachHangService.create(dto);
  }

  @Put(':maKhachHang')
  async update(@Param('maKhachHang', ParseIntPipe) maKhachHang: number, @Body() dto: UpdateKhachHangDto) {
    return this.khachHangService.update(maKhachHang, dto);
  }

  @Delete(':maKhachHang')
  async remove(@Param('maKhachHang', ParseIntPipe) maKhachHang: number) {
    return this.khachHangService.remove(maKhachHang);
  }

  // FC-03: Đăng ký thành viên
  @Post(':maKhachHang/thanh-vien')
  async registerMembership(
    @Param('maKhachHang', ParseIntPipe) maKhachHang: number,
    @Body() data: { email?: string; gioiTinh?: string; ngaySinh?: Date; cccd?: string; diaChi?: string },
  ) {
    return this.khachHangService.registerMembership(maKhachHang, data);
  }

  @Get(':maKhachHang/thanh-vien')
  async getMembershipInfo(@Param('maKhachHang', ParseIntPipe) maKhachHang: number) {
    return this.khachHangService.getMembershipInfo(maKhachHang);
  }

  // FS-02: Quản lý thú cưng
  @Get(':maKhachHang/thu-cung')
  async getThuCungs(@Param('maKhachHang', ParseIntPipe) maKhachHang: number) {
    return this.khachHangService.getThuCungs(maKhachHang);
  }

  @Post(':maKhachHang/thu-cung')
  async createThuCung(@Param('maKhachHang', ParseIntPipe) maKhachHang: number, @Body() dto: CreateThuCungDto) {
    dto.maKhachHang = String(maKhachHang);
    return this.khachHangService.createThuCung(dto);
  }

  // FC-02: Hồ sơ bệnh án thú cưng
  @Get('thu-cung/:maThuCung/lich-su-y-te')
  async getPetMedicalHistory(@Param('maThuCung', ParseIntPipe) maThuCung: number) {
    return this.khachHangService.getPetMedicalHistory(maThuCung);
  }
}

@Controller('thu-cung')
@UseGuards(JwtAuthGuard)
export class ThuCungController {
  constructor(private readonly khachHangService: KhachHangService) {}

  @Get(':maThuCung')
  async getThuCung(@Param('maThuCung', ParseIntPipe) maThuCung: number) {
    return this.khachHangService.getThuCung(maThuCung);
  }

  @Put(':maThuCung')
  async updateThuCung(@Param('maThuCung', ParseIntPipe) maThuCung: number, @Body() dto: UpdateThuCungDto) {
    return this.khachHangService.updateThuCung(maThuCung, dto);
  }

  @Delete(':maThuCung')
  async removeThuCung(@Param('maThuCung', ParseIntPipe) maThuCung: number) {
    return this.khachHangService.removeThuCung(maThuCung);
  }

  @Get(':maThuCung/lich-su-y-te')
  async getPetMedicalHistory(@Param('maThuCung', ParseIntPipe) maThuCung: number) {
    return this.khachHangService.getPetMedicalHistory(maThuCung);
  }
}
