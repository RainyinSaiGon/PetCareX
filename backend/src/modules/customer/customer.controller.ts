import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CreateKhachHangDto } from './dto/create-khach-hang.dto';
import { UpdateKhachHangDto } from './dto/update-khach-hang.dto';
import { CreateThuCungDto } from './dto/create-thu-cung.dto';
import { UpdateThuCungDto } from './dto/update-thu-cung.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('customer')
@UseGuards(JwtAuthGuard)
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  // ==================== KHÁCH HÀNG ENDPOINTS ====================

  @Post('khach-hang')
  async createKhachHang(@Body() createDto: CreateKhachHangDto) {
    const khachHang = await this.customerService.createKhachHang(createDto);
    return {
      message: 'Tạo khách hàng thành công',
      data: khachHang,
    };
  }

  @Get('khach-hang')
  async findAllKhachHang(
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('limit', ParseIntPipe) limit: number = 10,
  ) {
    return await this.customerService.findAllKhachHang(page, limit);
  }

  @Get('khach-hang/search')
  async searchKhachHang(@Query('keyword') keyword: string) {
    const results = await this.customerService.searchKhachHang(keyword);
    return {
      message: `Tìm thấy ${results.length} khách hàng`,
      data: results,
    };
  }

  @Get('khach-hang/phone/:phone')
  async findKhachHangByPhone(@Param('phone') phone: string) {
    const khachHang = await this.customerService.findKhachHangByPhone(phone);
    return {
      message: 'Tìm thấy khách hàng',
      data: khachHang,
    };
  }

  @Get('khach-hang/:id')
  async findOneKhachHang(@Param('id', ParseIntPipe) id: number) {
    const khachHang = await this.customerService.findOneKhachHang(id);
    return {
      message: 'Lấy thông tin khách hàng thành công',
      data: khachHang,
    };
  }

  @Put('khach-hang/:id')
  async updateKhachHang(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateKhachHangDto,
  ) {
    const khachHang = await this.customerService.updateKhachHang(id, updateDto);
    return {
      message: 'Cập nhật khách hàng thành công',
      data: khachHang,
    };
  }

  @Delete('khach-hang/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteKhachHang(@Param('id', ParseIntPipe) id: number) {
    await this.customerService.deleteKhachHang(id);
  }

  // ==================== THÚ CƯNG ENDPOINTS ====================

  @Post('thu-cung')
  async createThuCung(@Body() createDto: CreateThuCungDto) {
    const thuCung = await this.customerService.createThuCung(createDto);
    return {
      message: 'Thêm thú cưng thành công',
      data: thuCung,
    };
  }

  @Get('thu-cung')
  async findAllThuCung(
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('limit', ParseIntPipe) limit: number = 10,
    @Query('maKhachHang', ParseIntPipe) maKhachHang?: number,
  ) {
    return await this.customerService.findAllThuCung(page, limit, maKhachHang);
  }

  @Get('thu-cung/search')
  async searchThuCung(@Query('keyword') keyword: string) {
    const results = await this.customerService.searchThuCung(keyword);
    return {
      message: `Tìm thấy ${results.length} thú cưng`,
      data: results,
    };
  }

  @Get('thu-cung/:id')
  async findOneThuCung(@Param('id', ParseIntPipe) id: number) {
    const thuCung = await this.customerService.findOneThuCung(id);
    return {
      message: 'Lấy thông tin thú cưng thành công',
      data: thuCung,
    };
  }

  @Put('thu-cung/:id')
  async updateThuCung(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateThuCungDto,
  ) {
    const thuCung = await this.customerService.updateThuCung(id, updateDto);
    return {
      message: 'Cập nhật thú cưng thành công',
      data: thuCung,
    };
  }

  @Delete('thu-cung/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteThuCung(@Param('id', ParseIntPipe) id: number) {
    await this.customerService.deleteThuCung(id);
  }
}
