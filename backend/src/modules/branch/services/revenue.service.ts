import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { HoaDon } from '../../../entities/hoa-don.entity';
import { HoaDonSanPham } from '../../../entities/hoa-don-san-pham.entity';
import { ChiNhanh } from '../../../entities/chi-nhanh.entity';
import { DateRangeReportDto, RevenueDetailDto, MonthlyRevenueChartDto, ServiceRevenueDto, ProductRevenueDto } from '../dto/revenue.dto';

@Injectable()
export class RevenueService {
  constructor(
    @InjectRepository(HoaDon) private invoiceRepo: Repository<HoaDon>,
    @InjectRepository(HoaDonSanPham) private invoiceDetailRepo: Repository<HoaDonSanPham>,
    @InjectRepository(ChiNhanh) private branchRepo: Repository<ChiNhanh>,
  ) {}

  // FB-02: Get branch revenue reports
  async getBranchRevenueReport(branchId?: string, page: number = 1, limit: number = 10): Promise<any> {
    const skip = (page - 1) * limit;
    let query = this.invoiceRepo.createQueryBuilder('invoice');

    if (branchId) {
      query = query.where('invoice.MaChiNhanh = :branchId', { branchId });
    }

    const invoices = await query.getMany();

    // Get all branches or specific branch
    let branches = await this.branchRepo.find();
    if (branchId) {
      branches = branches.filter(b => b.MaChiNhanh === branchId);
    }

    const revenueReports = branches.map(branch => {
      const branchInvoices = invoices.filter(inv => inv.MaChiNhanh === branch.MaChiNhanh);
      const totalRevenue = branchInvoices.reduce((sum, inv) => sum + (inv.TongTien || 0), 0);

      return {
        MaChiNhanh: branch.MaChiNhanh,
        TenChiNhanh: branch.TenChiNhanh,
        TotalRevenue: totalRevenue,
        TransactionCount: branchInvoices.length,
        AverageTransactionValue: branchInvoices.length > 0 ? totalRevenue / branchInvoices.length : 0,
        TopProductsCount: 0,
        TopServicesCount: 0,
        ReportDate: new Date(),
      };
    });

    const sortedReports = revenueReports.sort((a, b) => b.TotalRevenue - a.TotalRevenue);
    const paginatedReports = sortedReports.slice(skip, skip + limit);

    return {
      data: paginatedReports,
      total: sortedReports.length,
      page,
      totalPages: Math.ceil(sortedReports.length / limit),
    };
  }

  // FB-02: Get revenue details for date range
  async getRevenueDetailsByDateRange(
    startDate: Date,
    endDate: Date,
    branchId?: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<any> {
    const skip = (page - 1) * limit;

    let query = this.invoiceRepo.createQueryBuilder('invoice')
      .leftJoinAndSelect('invoice.NhanVien', 'nhanvien')
      .leftJoinAndSelect('invoice.KhachHang', 'khachhang')
      .where('invoice.NgayLap BETWEEN :startDate AND :endDate', { startDate, endDate });

    if (branchId) {
      query = query.andWhere('invoice.MaChiNhanh = :branchId', { branchId });
    }

    const [invoices, total] = await query
      .orderBy('invoice.NgayLap', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    const revenueDetails: RevenueDetailDto[] = invoices.map(inv => ({
      MaHoaDon: inv.MaHoaDon,
      NgayLap: inv.NgayLap,
      TongTien: inv.TongTien,
      GiamGia: inv.GiamGia,
      NhanVienName: inv.NhanVien?.HoTen || 'Unknown',
      KhachHangName: inv.KhachHang?.HoTen || 'Unknown',
      ItemCount: 0,
    }));

    const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.TongTien || 0), 0);

    return {
      data: revenueDetails,
      total,
      totalRevenue,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  // FB-02: Get monthly revenue chart data
  async getMonthlyRevenueChart(year: number, branchId?: string): Promise<MonthlyRevenueChartDto[]> {
    const chartData: MonthlyRevenueChartDto[] = [];

    for (let month = 1; month <= 12; month++) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);

      let query = this.invoiceRepo.createQueryBuilder('invoice')
        .where('invoice.NgayLap BETWEEN :startDate AND :endDate', { startDate, endDate });

      if (branchId) {
        query = query.andWhere('invoice.MaChiNhanh = :branchId', { branchId });
      }

      const monthInvoices = await query.getMany();
      const totalRevenue = monthInvoices.reduce((sum, inv) => sum + (inv.TongTien || 0), 0);

      chartData.push({
        month,
        year,
        totalRevenue,
        transactionCount: monthInvoices.length,
      });
    }

    return chartData;
  }

  // FB-02: Get top services by revenue
  async getTopServicesByRevenue(branchId?: string, limit: number = 10): Promise<ServiceRevenueDto[]> {
    // This would require analyzing ThanhToanDichVuYTe table
    // For now, returning mock structure
    return [];
  }

  // FB-02: Get top products by revenue
  async getTopProductsByRevenue(branchId?: string, limit: number = 10): Promise<ProductRevenueDto[]> {
    let query = this.invoiceDetailRepo.createQueryBuilder('detail')
      .leftJoinAndSelect('detail.SanPham', 'sanpham')
      .leftJoinAndSelect('detail.HoaDon', 'hoadon')
      .select('sanpham.MaSanPham', 'MaSanPham')
      .addSelect('sanpham.TenSanPham', 'TenSanPham')
      .addSelect('SUM(detail.SoLuong)', 'UnitsSold')
      .addSelect('SUM(detail.SoLuong * detail.DonGia)', 'TotalRevenue')
      .addSelect('AVG(detail.DonGia)', 'AveragePrice')
      .groupBy('sanpham.MaSanPham')
      .addGroupBy('sanpham.TenSanPham')
      .orderBy('TotalRevenue', 'DESC')
      .limit(limit);

    if (branchId) {
      query = query.where('hoadon.MaChiNhanh = :branchId', { branchId });
    }

    const results = await query.getRawMany();

    // Calculate total for percentage
    const totalRevenue = results.reduce((sum, r) => sum + parseFloat(r.TotalRevenue || 0), 0);

    return results.map(r => ({
      MaSanPham: r.MaSanPham,
      TenSanPham: r.TenSanPham,
      TotalRevenue: parseFloat(r.TotalRevenue || 0),
      UnitsSold: parseInt(r.UnitsSold || 0),
      AveragePrice: parseFloat(r.AveragePrice || 0),
      PercentageOfTotal: totalRevenue > 0 ? (parseFloat(r.TotalRevenue) / totalRevenue) * 100 : 0,
    }));
  }

  // FB-02: Get total system revenue
  async getTotalSystemRevenue(startDate?: Date, endDate?: Date): Promise<any> {
    let query = this.invoiceRepo.createQueryBuilder('invoice');

    if (startDate && endDate) {
      query = query.where('invoice.NgayLap BETWEEN :startDate AND :endDate', { startDate, endDate });
    }

    const invoices = await query.getMany();
    const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.TongTien || 0), 0);
    const totalTransactions = invoices.length;

    return {
      totalRevenue,
      totalTransactions,
      averageTransactionValue: totalTransactions > 0 ? totalRevenue / totalTransactions : 0,
      transactionCount: totalTransactions,
    };
  }
}
