import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual } from 'typeorm';
import { 
  RevenueReportDto, 
  TopServicesDto, 
  RevenueReportResponse,
  TopServiceResponse,
  MemberTierStatisticsResponse,
  DashboardSummaryResponse,
  RevenueTimeFrame
} from './dto/analytics.dto';
import { HoaDon } from '../../entities/hoa-don.entity';
import { HoaDonSanPham } from '../../entities/hoa-don-san-pham.entity';
import { ThanhToanDichVuYTe } from '../../entities/thanh-toan-dich-vu-y-te.entity';
import { KhachHangThanhVien } from '../../entities/khach-hang-thanh-vien.entity';
import { HangThanhVien } from '../../entities/hang-thanh-vien.entity';
import { NhanVien } from '../../entities/nhanvien.entity';
import { ChiNhanh } from '../../entities/chi-nhanh.entity';
import { LichHen } from '../../entities/lich-hen.entity';
import { DichVuYTe } from '../../entities/dich-vu-y-te.entity';
import { SanPham } from '../../entities/san-pham.entity';
import { KhachHang } from '../../entities/khach-hang.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(HoaDon)
    private hoaDonRepository: Repository<HoaDon>,
    @InjectRepository(HoaDonSanPham)
    private hoaDonSanPhamRepository: Repository<HoaDonSanPham>,
    @InjectRepository(ThanhToanDichVuYTe)
    private thanhToanDichVuRepository: Repository<ThanhToanDichVuYTe>,
    @InjectRepository(KhachHangThanhVien)
    private khachHangThanhVienRepository: Repository<KhachHangThanhVien>,
    @InjectRepository(HangThanhVien)
    private hangThanhVienRepository: Repository<HangThanhVien>,
    @InjectRepository(NhanVien)
    private nhanVienRepository: Repository<NhanVien>,
    @InjectRepository(ChiNhanh)
    private chiNhanhRepository: Repository<ChiNhanh>,
    @InjectRepository(LichHen)
    private lichHenRepository: Repository<LichHen>,
    @InjectRepository(DichVuYTe)
    private dichVuYTeRepository: Repository<DichVuYTe>,
    @InjectRepository(SanPham)
    private sanPhamRepository: Repository<SanPham>,
    @InjectRepository(KhachHang)
    private khachHangRepository: Repository<KhachHang>,
  ) {}

  /**
   * FQ-02: Revenue Reports (Total System)
   */
  async getRevenueReport(dto: RevenueReportDto): Promise<RevenueReportResponse> {
    const { startDate, endDate, timeFrame, maChiNhanh } = dto;
    
    // Default to current month if no dates provided
    const start = startDate ? new Date(startDate) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const end = endDate ? new Date(endDate) : new Date();

    // Build query conditions
    const whereConditions: any = {
      NgayLap: Between(start, end),
    };

    if (maChiNhanh) {
      whereConditions.MaChiNhanh = maChiNhanh;
    }

    // Get all invoices in the period
    const invoices = await this.hoaDonRepository.find({
      where: whereConditions,
      relations: ['SanPhams', 'SanPhams.SanPham'],
    });

    // Calculate product revenue from invoices
    const productRevenue = invoices.reduce((sum, invoice) => {
      const invoiceProductTotal = invoice.SanPhams?.reduce(
        (total, item) => total + (item.ThanhTien || 0), 
        0
      ) || 0;
      return sum + invoiceProductTotal;
    }, 0);

    // Get service revenue
    const servicePayments = await this.thanhToanDichVuRepository.find({
      where: {
        NgayThanhToan: Between(start, end),
        ...(maChiNhanh && { MaChiNhanh: maChiNhanh }),
      },
      relations: ['DichVu'],
    });

    const serviceRevenue = servicePayments.reduce(
      (sum, payment) => sum + (payment.SoTien || 0),
      0
    );

    const totalRevenue = productRevenue + serviceRevenue;

    // Revenue by period (group by timeframe)
    const revenueByPeriod = this.groupRevenueByPeriod(
      invoices,
      servicePayments,
      timeFrame || RevenueTimeFrame.DAILY
    );

    // Revenue by branch (if not filtered by branch)
    let revenueByBranch: {
      maChiNhanh: string;
      tenChiNhanh: string;
      revenue: number;
    }[] | undefined = undefined;
    
    if (!maChiNhanh) {
      const branches = await this.chiNhanhRepository.find();
      revenueByBranch = await Promise.all(
        branches.map(async (branch) => {
          const branchInvoices = invoices.filter(
            (inv) => inv.MaChiNhanh === branch.MaChiNhanh
          );
          const branchProductRev = branchInvoices.reduce((sum, inv) => {
            return sum + (inv.SanPhams?.reduce(
              (total, item) => total + (item.ThanhTien || 0), 
              0
            ) || 0);
          }, 0);

          const branchServicePayments = servicePayments.filter(
            (payment) => payment.MaChiNhanh === branch.MaChiNhanh
          );
          const branchServiceRev = branchServicePayments.reduce(
            (sum, payment) => sum + (payment.SoTien || 0),
            0
          );

          return {
            maChiNhanh: branch.MaChiNhanh,
            tenChiNhanh: branch.TenChiNhanh,
            revenue: branchProductRev + branchServiceRev,
          };
        })
      );
    }

    // Comparison with previous period
    const periodDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const previousStart = new Date(start);
    previousStart.setDate(previousStart.getDate() - periodDays);
    const previousEnd = new Date(start);
    previousEnd.setDate(previousEnd.getDate() - 1);

    const previousInvoices = await this.hoaDonRepository.find({
      where: {
        NgayLap: Between(previousStart, previousEnd),
        ...(maChiNhanh && { MaChiNhanh: maChiNhanh }),
      },
      relations: ['SanPhams'],
    });

    const previousProductRev = previousInvoices.reduce((sum, inv) => {
      return sum + (inv.SanPhams?.reduce(
        (total, item) => total + (item.ThanhTien || 0), 
        0
      ) || 0);
    }, 0);

    const previousServicePayments = await this.thanhToanDichVuRepository.find({
      where: {
        NgayThanhToan: Between(previousStart, previousEnd),
        ...(maChiNhanh && { MaChiNhanh: maChiNhanh }),
      },
    });

    const previousServiceRev = previousServicePayments.reduce(
      (sum, payment) => sum + (payment.SoTien || 0),
      0
    );

    const previousPeriodRevenue = previousProductRev + previousServiceRev;
    const changePercentage = previousPeriodRevenue > 0 
      ? ((totalRevenue - previousPeriodRevenue) / previousPeriodRevenue) * 100 
      : 0;

    return {
      totalRevenue,
      productRevenue,
      serviceRevenue,
      revenueByPeriod,
      revenueByBranch,
      comparison: {
        previousPeriod: previousPeriodRevenue,
        changePercentage: Math.round(changePercentage * 100) / 100,
      },
    };
  }

  private groupRevenueByPeriod(
    invoices: HoaDon[],
    servicePayments: ThanhToanDichVuYTe[],
    timeFrame: RevenueTimeFrame
  ) {
    const periodMap = new Map<string, { product: number; service: number }>();

    // Group invoices
    invoices.forEach((invoice) => {
      const period = this.getPeriodKey(invoice.NgayLap, timeFrame);
      const current = periodMap.get(period) || { product: 0, service: 0 };
      const invoiceTotal = invoice.SanPhams?.reduce(
        (sum, item) => sum + (item.ThanhTien || 0),
        0
      ) || 0;
      current.product += invoiceTotal;
      periodMap.set(period, current);
    });

    // Group service payments
    servicePayments.forEach((payment) => {
      const period = this.getPeriodKey(payment.NgayThanhToan, timeFrame);
      const current = periodMap.get(period) || { product: 0, service: 0 };
      current.service += payment.SoTien || 0;
      periodMap.set(period, current);
    });

    // Convert to array and sort
    return Array.from(periodMap.entries())
      .map(([period, data]) => ({
        period,
        revenue: data.product + data.service,
        productRevenue: data.product,
        serviceRevenue: data.service,
      }))
      .sort((a, b) => a.period.localeCompare(b.period));
  }

  private getPeriodKey(date: Date, timeFrame: RevenueTimeFrame): string {
    const d = new Date(date);
    switch (timeFrame) {
      case RevenueTimeFrame.DAILY:
        return d.toISOString().split('T')[0];
      case RevenueTimeFrame.WEEKLY:
        const week = this.getWeekNumber(d);
        return `${d.getFullYear()}-W${week}`;
      case RevenueTimeFrame.MONTHLY:
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      case RevenueTimeFrame.YEARLY:
        return `${d.getFullYear()}`;
      default:
        return d.toISOString().split('T')[0];
    }
  }

  private getWeekNumber(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  }

  /**
   * FQ-03: Top Services Analysis (3-month)
   */
  async getTopServices(dto: TopServicesDto): Promise<TopServiceResponse[]> {
    const months = dto.months || 3;
    const limit = dto.limit || 10;

    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const servicePayments = await this.thanhToanDichVuRepository
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.DichVu', 'service')
      .where('payment.NgayThanhToan >= :startDate', { startDate })
      .getMany();

    // Group by service
    const serviceMap = new Map<string, {
      maDichVu: string;
      tenDichVu: string;
      soLanSuDung: number;
      tongDoanhThu: number;
    }>();

    servicePayments.forEach((payment) => {
      const maDichVu = payment.MaDichVu;
      const current = serviceMap.get(maDichVu) || {
        maDichVu,
        tenDichVu: payment.DichVu?.TenDichVu || 'Unknown',
        soLanSuDung: 0,
        tongDoanhThu: 0,
      };
      current.soLanSuDung++;
      current.tongDoanhThu += payment.SoTien || 0;
      serviceMap.set(maDichVu, current);
    });

    // Convert to array and calculate average
    const topServices = Array.from(serviceMap.values())
      .map((service) => ({
        ...service,
        trungBinhGia: service.soLanSuDung > 0 
          ? Math.round(service.tongDoanhThu / service.soLanSuDung) 
          : 0,
      }))
      .sort((a, b) => b.soLanSuDung - a.soLanSuDung)
      .slice(0, limit);

    return topServices;
  }

  /**
   * FQ-04: Member Tier Statistics
   */
  async getMemberTierStatistics(): Promise<MemberTierStatisticsResponse> {
    // Get all member tiers
    const tiers = await this.hangThanhVienRepository.find({
      order: { DiemTichLuyToiThieu: 'ASC' },
    });

    // Get all members with their tier info
    const members = await this.khachHangThanhVienRepository.find({
      relations: ['Hang', 'KhachHang'],
    });

    const totalMembers = members.length;

    // Calculate tier distribution
    const tierDistribution = tiers.map((tier) => {
      const tierMembers = members.filter((m) => m.TenHang === tier.TenHang);
      const soLuongThanhVien = tierMembers.length;
      const tyLe = totalMembers > 0 ? (soLuongThanhVien / totalMembers) * 100 : 0;
      
      const tongChiTieu = tierMembers.reduce(
        (sum, m) => sum + (m.TongChiTieu || 0),
        0
      );
      const trungBinhChiTieu = soLuongThanhVien > 0 
        ? tongChiTieu / soLuongThanhVien 
        : 0;

      return {
        maHang: tier.TenHang,
        tenHang: tier.TenHang,
        soLuongThanhVien,
        tyLe: Math.round(tyLe * 100) / 100,
        tongChiTieu,
        trungBinhChiTieu: Math.round(trungBinhChiTieu),
      };
    });

    // Recent upgrades (members who changed tier in last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentUpgrades = members
      .filter((m) => m.NgayNangHang && new Date(m.NgayNangHang) >= thirtyDaysAgo)
      .map((m) => ({
        maKhachHang: m.MaKhachHang,
        tenKhachHang: m.KhachHang?.HoTen || 'Unknown',
        hangCu: m.HangCu || 'None',
        hangMoi: m.TenHang,
        ngayNangHang: m.NgayNangHang,
      }))
      .sort((a, b) => new Date(b.ngayNangHang).getTime() - new Date(a.ngayNangHang).getTime())
      .slice(0, 20);

    // Revenue by tier
    const tierRevenue = tierDistribution.map((tier) => ({
      maHang: tier.maHang,
      tenHang: tier.tenHang,
      doanhThu: tier.tongChiTieu,
    }));

    return {
      totalMembers,
      tierDistribution,
      recentUpgrades,
      tierRevenue,
    };
  }

  /**
   * Dashboard Summary (Combined Analytics)
   */
  async getDashboardSummary(): Promise<DashboardSummaryResponse> {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - 7);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const yearStart = new Date(now.getFullYear(), 0, 1);

    // Revenue calculations
    const revenueToday = await this.calculateRevenue(todayStart, now);
    const revenueWeek = await this.calculateRevenue(weekStart, now);
    const revenueMonth = await this.calculateRevenue(monthStart, now);
    const revenueYear = await this.calculateRevenue(yearStart, now);

    // Customer statistics
    const totalCustomers = await this.khachHangRepository.count();

    const newCustomersThisMonth = await this.khachHangRepository
      .createQueryBuilder('kh')
      .leftJoin('kh.HoaDons', 'hd')
      .where('hd.NgayLap >= :monthStart', { monthStart })
      .select('COUNT(DISTINCT kh.MaKhachHang)', 'count')
      .getRawOne();

    const totalMembers = await this.khachHangThanhVienRepository.count();

    // Appointments
    const appointmentsToday = await this.lichHenRepository.count({
      where: { NgayHen: Between(todayStart, now) },
    });

    const appointmentsWeek = await this.lichHenRepository.count({
      where: { NgayHen: Between(weekStart, now) },
    });

    // Employees
    const totalEmployees = await this.nhanVienRepository.count();
    const employeesByType = await this.nhanVienRepository
      .createQueryBuilder('nv')
      .select('nv.LoaiNhanVien', 'loaiNhanVien')
      .addSelect('COUNT(*)', 'soLuong')
      .groupBy('nv.LoaiNhanVien')
      .getRawMany();

    // Top products (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const topProducts = await this.hoaDonSanPhamRepository
      .createQueryBuilder('hdsp')
      .leftJoinAndSelect('hdsp.SanPham', 'sp')
      .leftJoin('hdsp.HoaDon', 'hd')
      .select('hdsp.MaSanPham', 'maSanPham')
      .addSelect('sp.TenSanPham', 'tenSanPham')
      .addSelect('SUM(hdsp.SoLuong)', 'soLuongBan')
      .addSelect('SUM(hdsp.ThanhTien)', 'doanhThu')
      .where('hd.NgayLap >= :thirtyDaysAgo', { thirtyDaysAgo })
      .groupBy('hdsp.MaSanPham')
      .addGroupBy('sp.TenSanPham')
      .orderBy('SUM(hdsp.SoLuong)', 'DESC')
      .limit(5)
      .getRawMany();

    // Top services
    const topServices = await this.getTopServices({ months: 1, limit: 5 });

    // Revenue chart (last 7 days)
    const revenueChart = await this.getRevenueChartData(7);

    return {
      revenue: {
        today: revenueToday,
        thisWeek: revenueWeek,
        thisMonth: revenueMonth,
        thisYear: revenueYear,
      },
      customers: {
        total: totalCustomers,
        new: parseInt(newCustomersThisMonth?.count || '0'),
        active: totalCustomers,
        members: totalMembers,
      },
      appointments: {
        today: appointmentsToday,
        thisWeek: appointmentsWeek,
        pending: 0, // Can be calculated based on status
        completed: 0,
      },
      employees: {
        total: totalEmployees,
        active: totalEmployees,
        byType: employeesByType.map(e => ({
          loaiNhanVien: e.loaiNhanVien,
          soLuong: parseInt(e.soLuong),
        })),
      },
      topProducts: topProducts.map(p => ({
        maSanPham: p.maSanPham,
        tenSanPham: p.tenSanPham || 'Unknown',
        soLuongBan: parseInt(p.soLuongBan),
        doanhThu: parseFloat(p.doanhThu || '0'),
      })),
      topServices,
      revenueChart,
    };
  }

  private async calculateRevenue(start: Date, end: Date): Promise<number> {
    const invoices = await this.hoaDonRepository.find({
      where: { NgayLap: Between(start, end) },
      relations: ['SanPhams'],
    });

    const productRev = invoices.reduce((sum, inv) => {
      return sum + (inv.SanPhams?.reduce(
        (total, item) => total + (item.ThanhTien || 0), 
        0
      ) || 0);
    }, 0);

    const servicePayments = await this.thanhToanDichVuRepository.find({
      where: { NgayThanhToan: Between(start, end) },
    });

    const serviceRev = servicePayments.reduce(
      (sum, payment) => sum + (payment.SoTien || 0),
      0
    );    return productRev + serviceRev;
  }

  private async getRevenueChartData(days: number) {
    const labels: string[] = [];
    const data: number[] = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);

      const revenue = await this.calculateRevenue(dayStart, dayEnd);
      
      labels.push(dayStart.toISOString().split('T')[0]);
      data.push(revenue);
    }

    return { labels, data };
  }
}
