import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { HoaDon } from '../entities/hoa-don.entity';
import { CtSanPham } from '../entities/ct-san-pham.entity';
import { CtDichVuYTe } from '../entities/ct-dich-vu-y-te.entity';
import { SanPham } from '../entities/san-pham.entity';
import { KhoSanPham } from '../entities/kho-san-pham.entity';
import { KhachHangThanhVien } from '../entities/khach-hang-thanh-vien.entity';
import { HangThanhVien } from '../entities/hang-thanh-vien.entity';
import { DanhGiaMuaHang } from '../entities/danh-gia-mua-hang.entity';
import { CreateHoaDonDto, AddSanPhamDto, AddDichVuYTeDto, CreateDanhGiaMuaHangDto } from './dto/hoa-don.dto';

@Injectable()
export class HoaDonService {
  constructor(
    @InjectRepository(HoaDon)
    private hoaDonRepo: Repository<HoaDon>,
    @InjectRepository(CtSanPham)
    private ctSanPhamRepo: Repository<CtSanPham>,
    @InjectRepository(CtDichVuYTe)
    private ctDichVuYTeRepo: Repository<CtDichVuYTe>,
    @InjectRepository(SanPham)
    private sanPhamRepo: Repository<SanPham>,
    @InjectRepository(KhoSanPham)
    private khoSanPhamRepo: Repository<KhoSanPham>,
    @InjectRepository(KhachHangThanhVien)
    private thanhVienRepo: Repository<KhachHangThanhVien>,
    @InjectRepository(HangThanhVien)
    private hangThanhVienRepo: Repository<HangThanhVien>,
    @InjectRepository(DanhGiaMuaHang)
    private danhGiaRepo: Repository<DanhGiaMuaHang>,
  ) {}

  // FS-03: Lập hóa đơn
  async createHoaDon(dto: CreateHoaDonDto) {
    // Calculate total from items
    let tongTien = 0;
    let giamGia = 0;

    // Get member discount if applicable
    if (dto.maKhachHang) {
      const thanhVien = await this.thanhVienRepo.findOne({
        where: { maKhachHang: dto.maKhachHang },
        relations: ['hangThanhVien'],
      });
      
      if (thanhVien?.hangThanhVien?.giamGia) {
        giamGia = thanhVien.hangThanhVien.giamGia;
      }
    }

    // Create invoice (maHoaDon is auto-generated)
    const hoaDon = this.hoaDonRepo.create({
      maKhachHang: dto.maKhachHang,
      maNhanVien: dto.maNhanVien,
      ngayLap: new Date(),
      tongTien: 0,
      giamGia: 0,
    });

    const savedHoaDon = await this.hoaDonRepo.save(hoaDon);

    // Add products
    if (dto.sanPhams && dto.sanPhams.length > 0) {
      for (const sp of dto.sanPhams) {
        const added = await this.addSanPham(savedHoaDon.maHoaDon, sp);
        tongTien += added.thanhTien;
      }
    }

    // Add services
    if (dto.dichVuYTes && dto.dichVuYTes.length > 0) {
      for (const dv of dto.dichVuYTes) {
        const added = await this.addDichVuYTe(savedHoaDon.maHoaDon, dv);
        tongTien += added.thanhTien;
      }
    }

    // Apply discount percentage
    const discountAmount = tongTien * (giamGia / 100);
    tongTien -= discountAmount;

    // Update invoice totals
    savedHoaDon.tongTien = tongTien;
    savedHoaDon.giamGia = giamGia;
    await this.hoaDonRepo.save(savedHoaDon);

    // Update member spending if applicable
    if (dto.maKhachHang) {
      await this.updateMemberSpending(dto.maKhachHang, tongTien);
    }

    return this.getHoaDon(savedHoaDon.maHoaDon);
  }

  async getHoaDon(maHoaDon: number) {
    const hoaDon = await this.hoaDonRepo.findOne({
      where: { maHoaDon },
      relations: [
        'khachHang',
        'nhanVien',
        'ctSanPhams',
        'ctSanPhams.sanPham',
        'ctDichVuYTes',
        'ctDichVuYTes.dichVuYTe',
      ],
    });
    if (!hoaDon) {
      throw new NotFoundException('Không tìm thấy hóa đơn');
    }
    return hoaDon;
  }

  async findAllHoaDon(query?: {
    maChiNhanh?: string;
    maKhachHang?: string;
    startDate?: Date;
    endDate?: Date;
  }) {
    const queryBuilder = this.hoaDonRepo.createQueryBuilder('hd')
      .leftJoinAndSelect('hd.khachHang', 'kh')
      .leftJoinAndSelect('hd.nhanVien', 'nv');

    if (query?.maKhachHang) {
      queryBuilder.andWhere('hd.maKhachHang = :maKhachHang', { maKhachHang: query.maKhachHang });
    }
    if (query?.startDate && query?.endDate) {
      queryBuilder.andWhere('hd.ngayLap BETWEEN :startDate AND :endDate', {
        startDate: query.startDate,
        endDate: query.endDate,
      });
    }

    return queryBuilder.orderBy('hd.ngayLap', 'DESC').getMany();
  }

  // Add product to invoice
  async addSanPham(maHoaDon: number, dto: AddSanPhamDto) {
    // Get product info
    const sanPham = await this.sanPhamRepo.findOne({ where: { maSanPham: dto.maSanPham } });
    if (!sanPham) {
      throw new NotFoundException('Không tìm thấy sản phẩm');
    }

    const donGia = dto.donGia || sanPham.giaTienSanPham || 0;
    const thanhTien = donGia * dto.soLuong;

    // Create detail record
    const ctSanPham = this.ctSanPhamRepo.create({
      maHoaDon,
      maSanPham: dto.maSanPham,
      soLuong: dto.soLuong,
      donGia,
    });
    const savedCt = await this.ctSanPhamRepo.save(ctSanPham);

    return { ...savedCt, thanhTien };
  }

  // Add service to invoice
  async addDichVuYTe(maHoaDon: number, dto: AddDichVuYTeDto) {
    const donGia = dto.donGia || 0;
    const thanhTien = donGia * (dto.soLuong || 1);

    const ctDichVu = this.ctDichVuYTeRepo.create({
      maHoaDon,
      maDichVu: dto.maDichVu,
      soLuong: dto.soLuong || 1,
      donGia,
    });
    const savedCt = await this.ctDichVuYTeRepo.save(ctDichVu);

    return { ...savedCt, thanhTien };
  }

  // Update member spending
  async updateMemberSpending(maKhachHang: number, amount: number) {
    const thanhVien = await this.thanhVienRepo.findOne({
      where: { maKhachHang },
    });

    if (!thanhVien) return;

    // Update total spending
    thanhVien.tongChiTieu = (thanhVien.tongChiTieu || 0) + amount;
    await this.thanhVienRepo.save(thanhVien);
  }

  // FS-04: Tra cứu tồn kho
  async searchInventory(maChiNhanh: string, search?: string) {
    const query = this.khoSanPhamRepo.createQueryBuilder('k')
      .leftJoinAndSelect('k.sanPham', 'sp')
      .where('k.MaChiNhanh = :maChiNhanh', { maChiNhanh });

    if (search) {
      query.andWhere('(sp.TenSanPham LIKE :search OR sp.MaSanPham LIKE :search)', {
        search: `%${search}%`,
      });
    }

    return query.getMany();
  }

  // FC-04: Lịch sử mua hàng
  async getLichSuMuaHang(maKhachHang: number) {
    return this.hoaDonRepo.createQueryBuilder('hd')
      .leftJoinAndSelect('hd.ctSanPhams', 'ctsp')
      .leftJoinAndSelect('ctsp.sanPham', 'sp')
      .leftJoinAndSelect('hd.ctDichVuYTes', 'ctdv')
      .leftJoinAndSelect('ctdv.dichVuYTe', 'dv')
      .where('hd.maKhachHang = :maKhachHang', { maKhachHang })
      .orderBy('hd.ngayLap', 'DESC')
      .getMany();
  }

  // FC-05: Đánh giá mua hàng
  async createDanhGiaMuaHang(dto: CreateDanhGiaMuaHangDto) {
    // Check if review already exists
    if (dto.maHoaDon) {
      const existing = await this.danhGiaRepo.findOne({ where: { maHoaDon: dto.maHoaDon } });
      if (existing) {
        throw new BadRequestException('Hóa đơn đã được đánh giá');
      }
    }

    const danhGia = this.danhGiaRepo.create({
      maHoaDon: dto.maHoaDon,
      mucDoHaiLong: dto.mucDoHaiLong,
      thaiDoNhanVien: dto.thaiDoNhanVien,
      binhLuan: dto.binhLuan,
    });
    return this.danhGiaRepo.save(danhGia);
  }

  async getDanhGiaMuaHang(maHoaDon: number) {
    return this.danhGiaRepo.findOne({
      where: { maHoaDon },
      relations: ['hoaDon'],
    });
  }

  // ========================
  // SẢN PHẨM
  // ========================

  async getAllSanPham() {
    return this.sanPhamRepo.find({
      order: { maSanPham: 'ASC' },
    });
  }

  async getSanPhamByLoai(loaiSanPham: string) {
    return this.sanPhamRepo.find({
      where: { loaiSanPham },
      order: { maSanPham: 'ASC' },
    });
  }

  async searchSanPham(search: string) {
    return this.sanPhamRepo.createQueryBuilder('sp')
      .where('sp.TenSanPham LIKE :search', { search: `%${search}%` })
      .orWhere('sp.MaSanPham LIKE :search', { search: `%${search}%` })
      .getMany();
  }

  // ========================
  // THỐNG KÊ
  // ========================

  async getDoanhThuThongKe(maChiNhanh?: string, startDate?: Date, endDate?: Date) {
    const start = startDate || new Date(new Date().setMonth(new Date().getMonth() - 1));
    const end = endDate || new Date();

    const query = this.hoaDonRepo.createQueryBuilder('hd')
      .where('hd.NgayLap BETWEEN :start AND :end', { start, end });

    if (maChiNhanh) {
      query.andWhere('hd.MaChiNhanh = :maChiNhanh', { maChiNhanh });
    }

    const result = await query
      .select('SUM(hd.TongTien)', 'tongDoanhThu')
      .addSelect('COUNT(*)', 'soHoaDon')
      .addSelect('AVG(hd.TongTien)', 'trungBinhHoaDon')
      .getRawOne();

    return result;
  }

  async getTopSanPham(maChiNhanh?: string, limit: number = 10) {
    const query = this.ctSanPhamRepo.createQueryBuilder('ct')
      .leftJoin('ct.sanPham', 'sp')
      .leftJoin('ct.hoaDon', 'hd')
      .select('sp.MaSanPham', 'maSanPham')
      .addSelect('sp.TenSanPham', 'tenSanPham')
      .addSelect('SUM(ct.SoLuong)', 'soLuongBan')
      .addSelect('SUM(ct.SoLuong * ct.DonGia)', 'doanhThu')
      .groupBy('sp.MaSanPham')
      .addGroupBy('sp.TenSanPham')
      .orderBy('soLuongBan', 'DESC')
      .limit(limit);

    if (maChiNhanh) {
      query.where('hd.MaChiNhanh = :maChiNhanh', { maChiNhanh });
    }

    return query.getRawMany();
  }
}
