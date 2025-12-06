import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { ChiNhanh } from '../entities/chi-nhanh.entity';
import { NhanVien } from '../entities/nhan-vien.entity';
import { KhoSanPham } from '../entities/kho-san-pham.entity';
import { KhoVaccine } from '../entities/kho-vaccine.entity';
import { HoaDon } from '../entities/hoa-don.entity';
import { Kho } from '../entities/kho.entity';

@Injectable()
export class ChiNhanhService {
  constructor(
    @InjectRepository(ChiNhanh)
    private chiNhanhRepo: Repository<ChiNhanh>,
    @InjectRepository(NhanVien)
    private nhanVienRepo: Repository<NhanVien>,
    @InjectRepository(KhoSanPham)
    private khoSanPhamRepo: Repository<KhoSanPham>,
    @InjectRepository(KhoVaccine)
    private khoVaccineRepo: Repository<KhoVaccine>,
    @InjectRepository(HoaDon)
    private hoaDonRepo: Repository<HoaDon>,
    @InjectRepository(Kho)
    private khoRepo: Repository<Kho>,
  ) {}

  // FQ-01 & General: Quản lý chi nhánh
  async findAll() {
    return this.chiNhanhRepo.find({
      order: { maChiNhanh: 'ASC' },
    });
  }

  async findOne(maChiNhanh: string) {
    const chiNhanh = await this.chiNhanhRepo.findOne({
      where: { maChiNhanh },
    });
    if (!chiNhanh) {
      throw new NotFoundException(`Không tìm thấy chi nhánh với mã ${maChiNhanh}`);
    }
    return chiNhanh;
  }

  async create(data: Partial<ChiNhanh>) {
    const chiNhanh = this.chiNhanhRepo.create(data);
    return this.chiNhanhRepo.save(chiNhanh);
  }

  async update(maChiNhanh: string, data: Partial<ChiNhanh>) {
    const chiNhanh = await this.findOne(maChiNhanh);
    Object.assign(chiNhanh, data);
    return this.chiNhanhRepo.save(chiNhanh);
  }

  async remove(maChiNhanh: string) {
    const chiNhanh = await this.findOne(maChiNhanh);
    return this.chiNhanhRepo.remove(chiNhanh);
  }

  // FQ-02 & FB-02: Báo cáo doanh thu - use raw SQL queries for complex operations
  async getDoanhThu(maChiNhanh: string, startDate: Date, endDate: Date) {
    const result = await this.hoaDonRepo.query(`
      SELECT 
        CONVERT(VARCHAR(10), NgayLap, 120) as Ngay,
        COUNT(*) as SoHoaDon,
        SUM(TongTien) as TongDoanhThu,
        SUM(GiamGia) as TongGiamGia,
        AVG(TongTien) as DoanhThuTrungBinh
      FROM HOADON hd
      JOIN NHANVIEN nv ON hd.MaNhanVien = nv.MaNhanVien
      WHERE nv.MaChiNhanh = @0 AND hd.NgayLap BETWEEN @1 AND @2
      GROUP BY CONVERT(VARCHAR(10), NgayLap, 120)
      ORDER BY Ngay
    `, [maChiNhanh, startDate, endDate]);
    
    return result;
  }

  async getDoanhThuToanHeThong(startDate: Date, endDate: Date) {
    const result = await this.hoaDonRepo.query(`
      SELECT 
        cn.MaChiNhanh,
        cn.TenChiNhanh,
        COUNT(hd.MaHoaDon) as SoHoaDon,
        SUM(hd.TongTien) as TongDoanhThu,
        AVG(hd.TongTien) as DoanhThuTrungBinh
      FROM CHINHANH cn
      LEFT JOIN NHANVIEN nv ON cn.MaChiNhanh = nv.MaChiNhanh
      LEFT JOIN HOADON hd ON nv.MaNhanVien = hd.MaNhanVien 
        AND hd.NgayLap BETWEEN @0 AND @1
      GROUP BY cn.MaChiNhanh, cn.TenChiNhanh
      ORDER BY TongDoanhThu DESC
    `, [startDate, endDate]);
    
    return result;
  }

  // FQ-03: Thống kê dịch vụ phổ biến
  async getDichVuThongKe(startDate: Date, endDate: Date) {
    const result = await this.hoaDonRepo.query(`
      SELECT 
        dv.MaDichVuYTe,
        dv.TenDichVuYTe,
        dv.LoaiDichVu,
        COUNT(*) as SoLuotSuDung,
        SUM(hd.TongTien) as DoanhThu
      FROM CT_DICHVUYTE ct
      JOIN DICHVUYTE dv ON ct.MaDichVuYTe = dv.MaDichVuYTe
      JOIN HOADON hd ON ct.MaHoaDon = hd.MaHoaDon
      WHERE hd.NgayLap BETWEEN @0 AND @1
      GROUP BY dv.MaDichVuYTe, dv.TenDichVuYTe, dv.LoaiDichVu
      ORDER BY SoLuotSuDung DESC
    `, [startDate, endDate]);
    
    return result;
  }

  // FB-03 & FB-04: Quản lý tồn kho
  async getKhoSanPham(maChiNhanh: string) {
    return this.khoSanPhamRepo.find({
      where: { maChiNhanh },
      relations: ['sanPham'],
      order: { maSanPham: 'ASC' },
    });
  }

  // Get vaccine inventory (uses maKho, not maChiNhanh directly)
  async getKhoVaccine(maKho: string) {
    return this.khoVaccineRepo.find({
      where: { maKho },
      relations: ['vaccine'],
      order: { maVaccine: 'ASC' },
    });
  }

  async getSanPhamSapHetHang(maChiNhanh: string, threshold: number = 10) {
    const items = await this.khoSanPhamRepo.find({
      where: { maChiNhanh },
      relations: ['sanPham'],
    });
    return items.filter(item => item.soLuong <= threshold);
  }

  // Get products expiring soon
  async getSanPhamSapHetHan(maChiNhanh: string, daysBeforeExpiry: number = 30) {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + daysBeforeExpiry);
    
    const items = await this.khoSanPhamRepo.find({
      where: { maChiNhanh },
      relations: ['sanPham'],
    });
    return items.filter(item => item.ngayHetHan && new Date(item.ngayHetHan) <= expiryDate);
  }

  // FB-06: Thống kê dịch vụ y tế chi nhánh
  async getDichVuYTeThongKe(maChiNhanh: string, startDate: Date, endDate: Date) {
    const result = await this.hoaDonRepo.query(`
      SELECT 
        dv.LoaiDichVu,
        dv.TenDichVuYTe,
        COUNT(*) as SoLuotSuDung,
        SUM(ct.SoLuong * ct.DonGia) as DoanhThu
      FROM CT_DICHVUYTE ct
      JOIN DICHVUYTE dv ON ct.MaDichVuYTe = dv.MaDichVuYTe
      JOIN HOADON hd ON ct.MaHoaDon = hd.MaHoaDon
      JOIN NHANVIEN nv ON hd.MaNhanVien = nv.MaNhanVien
      WHERE nv.MaChiNhanh = @0 AND hd.NgayLap BETWEEN @1 AND @2
      GROUP BY dv.LoaiDichVu, dv.TenDichVuYTe
      ORDER BY SoLuotSuDung DESC
    `, [maChiNhanh, startDate, endDate]);
    
    return result;
  }

  // FB-07: Thống kê mua hàng chi nhánh
  async getMuaHangThongKe(maChiNhanh: string, startDate: Date, endDate: Date) {
    const result = await this.hoaDonRepo.query(`
      SELECT 
        sp.MaSanPham,
        sp.TenSanPham,
        sp.LoaiSanPham,
        SUM(ct.SoLuong) as SoLuongBan,
        SUM(ct.SoLuong * ct.DonGia) as DoanhThu
      FROM CT_SANPHAM ct
      JOIN SANPHAM sp ON ct.MaSanPham = sp.MaSanPham
      JOIN HOADON hd ON ct.MaHoaDon = hd.MaHoaDon
      JOIN NHANVIEN nv ON hd.MaNhanVien = nv.MaNhanVien
      WHERE nv.MaChiNhanh = @0 AND hd.NgayLap BETWEEN @1 AND @2
      GROUP BY sp.MaSanPham, sp.TenSanPham, sp.LoaiSanPham
      ORDER BY SoLuongBan DESC
    `, [maChiNhanh, startDate, endDate]);
    
    return result;
  }

  // Dashboard summary
  async getDashboardSummary(maChiNhanh: string) {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    // Count active staff (ngayNghiLam is null)
    const totalStaff = await this.nhanVienRepo.count({ 
      where: { maChiNhanh, ngayNghiLam: IsNull() } 
    });

    // Get total products in inventory
    const totalProductsResult = await this.khoSanPhamRepo.createQueryBuilder('k')
      .where('k.maChiNhanh = :maChiNhanh', { maChiNhanh })
      .select('SUM(k.soLuong)', 'total')
      .getRawOne();

    // Get monthly revenue via raw query
    const revenueResult = await this.hoaDonRepo.query(`
      SELECT SUM(hd.TongTien) as total
      FROM HOADON hd
      JOIN NHANVIEN nv ON hd.MaNhanVien = nv.MaNhanVien
      WHERE nv.MaChiNhanh = @0 AND hd.NgayLap >= @1
    `, [maChiNhanh, startOfMonth]);

    return {
      totalStaff,
      totalProducts: totalProductsResult?.total || 0,
      monthlyRevenue: revenueResult[0]?.total || 0,
    };
  }

  // Get all warehouses (Kho)
  async getAllKho() {
    return this.khoRepo.find({
      relations: ['nhanVien'],
    });
  }

  // Get staff of branch
  async getNhanVien(maChiNhanh: string) {
    return this.nhanVienRepo.find({
      where: { maChiNhanh, ngayNghiLam: IsNull() },
      order: { hoTen: 'ASC' },
    });
  }
}
