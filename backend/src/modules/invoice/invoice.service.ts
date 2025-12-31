import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Like, ILike } from 'typeorm';
import { HoaDon } from '../../entities/hoa-don.entity';
import { HoaDonSanPham } from '../../entities/hoa-don-san-pham.entity';
import { ChiNhanh } from '../../entities/chi-nhanh.entity';
import { InvoiceFilterDto, UpdateInvoiceStatusDto } from './dto/invoice.dto';

@Injectable()
export class InvoiceService {
    constructor(
        @InjectRepository(HoaDon)
        private invoiceRepo: Repository<HoaDon>,
        @InjectRepository(HoaDonSanPham)
        private invoiceDetailRepo: Repository<HoaDonSanPham>,
        @InjectRepository(ChiNhanh)
        private branchRepo: Repository<ChiNhanh>,
    ) { }

    async getInvoices(filters: InvoiceFilterDto) {
        const page = filters.page || 1;
        const limit = filters.limit || 20;
        const skip = (page - 1) * limit;

        const query = this.invoiceRepo
            .createQueryBuilder('hd')
            .leftJoinAndSelect('hd.KhachHang', 'kh')
            .leftJoinAndSelect('hd.NhanVien', 'nv')
            .leftJoinAndSelect('hd.ChiNhanh', 'cn');

        // Search filter
        if (filters.search) {
            query.andWhere(
                '(CAST(hd.MaHoaDon AS VARCHAR) LIKE :search OR kh.HoTen LIKE :search OR kh.SoDienThoai LIKE :search)',
                { search: `%${filters.search}%` }
            );
        }

        // Date range filter
        if (filters.startDate) {
            query.andWhere('hd.NgayLap >= :startDate', { startDate: filters.startDate });
        }
        if (filters.endDate) {
            query.andWhere('hd.NgayLap <= :endDate', { endDate: filters.endDate });
        }

        // Status filter
        if (filters.status) {
            query.andWhere('hd.TrangThai = :status', { status: filters.status });
        }

        // Branch filter
        if (filters.maChiNhanh) {
            query.andWhere('hd.MaChiNhanh = :maChiNhanh', { maChiNhanh: filters.maChiNhanh });
        }

        // Customer filter
        if (filters.maKhachHang) {
            query.andWhere('hd.MaKhachHang = :maKhachHang', { maKhachHang: filters.maKhachHang });
        }

        // Amount filter
        if (filters.minAmount !== undefined) {
            query.andWhere('hd.TongTien >= :minAmount', { minAmount: filters.minAmount });
        }
        if (filters.maxAmount !== undefined) {
            query.andWhere('hd.TongTien <= :maxAmount', { maxAmount: filters.maxAmount });
        }

        // Sorting
        const sortBy = filters.sortBy || 'NgayLap';
        const sortOrder = filters.sortOrder || 'DESC';
        query.orderBy(`hd.${sortBy}`, sortOrder);

        // Get total count
        const total = await query.getCount();

        // Apply pagination
        const invoices = await query.skip(skip).take(limit).getMany();

        return {
            invoices: invoices.map(inv => ({
                maHoaDon: inv.MaHoaDon,
                ngayLap: inv.NgayLap,
                giamGia: inv.GiamGia,
                tongTien: inv.TongTien,
                trangThai: inv.TrangThai || 'Chưa xác định',
                khachHang: inv.KhachHang ? {
                    maKhachHang: inv.KhachHang.MaKhachHang,
                    hoTen: inv.KhachHang.HoTen,
                    soDienThoai: inv.KhachHang.SoDienThoai,
                } : null,
                nhanVien: inv.NhanVien ? {
                    maNhanVien: inv.NhanVien.MaNhanVien,
                    hoTen: inv.NhanVien.HoTen,
                } : null,
                chiNhanh: inv.ChiNhanh ? {
                    maChiNhanh: inv.ChiNhanh.MaChiNhanh,
                    tenChiNhanh: inv.ChiNhanh.TenChiNhanh,
                } : null,
            })),
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async getInvoiceById(maHoaDon: number) {
        const invoice = await this.invoiceRepo.findOne({
            where: { MaHoaDon: maHoaDon },
            relations: ['KhachHang', 'NhanVien', 'ChiNhanh', 'SanPhams', 'SanPhams.SanPham', 'DichVus', 'DichVus.DichVu'],
        });

        if (!invoice) {
            throw new NotFoundException(`Invoice ${maHoaDon} not found`);
        }

        return {
            maHoaDon: invoice.MaHoaDon,
            ngayLap: invoice.NgayLap,
            giamGia: invoice.GiamGia,
            tongTien: invoice.TongTien,
            trangThai: invoice.TrangThai || 'Chưa xác định',
            khachHang: invoice.KhachHang ? {
                maKhachHang: invoice.KhachHang.MaKhachHang,
                hoTen: invoice.KhachHang.HoTen,
                soDienThoai: invoice.KhachHang.SoDienThoai,
            } : null,
            nhanVien: invoice.NhanVien ? {
                maNhanVien: invoice.NhanVien.MaNhanVien,
                hoTen: invoice.NhanVien.HoTen,
            } : null,
            chiNhanh: invoice.ChiNhanh ? {
                maChiNhanh: invoice.ChiNhanh.MaChiNhanh,
                tenChiNhanh: invoice.ChiNhanh.TenChiNhanh,
            } : null,
            sanPhams: invoice.SanPhams?.map(sp => ({
                maSanPham: sp.MaSanPham,
                tenSanPham: sp.SanPham?.TenSanPham || 'Unknown',
                soLuong: sp.SoLuong,
                donGia: sp.DonGia,
                thanhTien: sp.ThanhTien,
            })) || [],
            dichVus: invoice.DichVus?.map(dv => ({
                maDichVu: dv.MaDichVu,
                tenDichVu: dv.DichVu?.TenDichVu || 'Unknown',
                soTien: dv.SoTien || 0,
            })) || [],
        };
    }

    async updateInvoiceStatus(maHoaDon: number, dto: UpdateInvoiceStatusDto) {
        const invoice = await this.invoiceRepo.findOne({
            where: { MaHoaDon: maHoaDon },
        });

        if (!invoice) {
            throw new NotFoundException(`Invoice ${maHoaDon} not found`);
        }

        invoice.TrangThai = dto.status;
        await this.invoiceRepo.save(invoice);

        return {
            success: true,
            message: 'Invoice status updated successfully',
            maHoaDon: invoice.MaHoaDon,
            newStatus: invoice.TrangThai,
        };
    }

    async getStatistics() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Total invoices count
        const totalCount = await this.invoiceRepo.count();

        // Total revenue
        const totalRevenueResult = await this.invoiceRepo
            .createQueryBuilder('hd')
            .select('SUM(hd.TongTien)', 'total')
            .getRawOne();
        const totalRevenue = totalRevenueResult?.total || 0;

        // Today's revenue
        const todayRevenueResult = await this.invoiceRepo
            .createQueryBuilder('hd')
            .select('SUM(hd.TongTien)', 'total')
            .where('hd.NgayLap >= :today AND hd.NgayLap < :tomorrow', { today, tomorrow })
            .getRawOne();
        const todayRevenue = todayRevenueResult?.total || 0;

        // Today's count
        const todayCount = await this.invoiceRepo
            .createQueryBuilder('hd')
            .where('hd.NgayLap >= :today AND hd.NgayLap < :tomorrow', { today, tomorrow })
            .getCount();

        // Pending orders
        const pendingCount = await this.invoiceRepo.count({
            where: { TrangThai: 'Đã đặt hàng' },
        });

        // Status breakdown
        const statusBreakdown = await this.invoiceRepo
            .createQueryBuilder('hd')
            .select('hd.TrangThai', 'status')
            .addSelect('COUNT(*)', 'count')
            .groupBy('hd.TrangThai')
            .getRawMany();

        return {
            totalCount,
            totalRevenue: parseFloat(totalRevenue) || 0,
            todayRevenue: parseFloat(todayRevenue) || 0,
            todayCount,
            pendingCount,
            averageOrderValue: totalCount > 0 ? (parseFloat(totalRevenue) || 0) / totalCount : 0,
            statusBreakdown: statusBreakdown.map(s => ({
                status: s.status || 'Chưa xác định',
                count: parseInt(s.count),
            })),
        };
    }

    async getBranches() {
        const branches = await this.branchRepo.find({
            order: { MaChiNhanh: 'ASC' },
        });
        return branches.map(b => ({
            maChiNhanh: b.MaChiNhanh,
            tenChiNhanh: b.TenChiNhanh,
        }));
    }
}
