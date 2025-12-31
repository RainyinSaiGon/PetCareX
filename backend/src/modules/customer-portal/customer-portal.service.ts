import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, ILike } from 'typeorm';
import { SanPham } from '../../entities/san-pham.entity';
import { LichHen } from '../../entities/lich-hen.entity';
import { LichLamViecBacSi } from '../../entities/lich-lam-viec-bac-si.entity';
import { NhanVien } from '../../entities/nhanvien.entity';
import { ThuCung } from '../../entities/thu-cung.entity';
import { KhachHang } from '../../entities/khach-hang.entity';
import { HoaDon } from '../../entities/hoa-don.entity';
import { HoaDonSanPham } from '../../entities/hoa-don-san-pham.entity';
import { GiayKhamBenhTongQuat } from '../../entities/giay-kham-benh-tong-quat.entity';
import { ToaThuoc } from '../../entities/toa-thuoc.entity';
import { ChiTietTonKho } from '../../entities/chi-tiet-ton-kho.entity';
import { ChungLoaiThuCung } from '../../entities/chung-loai-thu-cung.entity';
import { LoaiThuCung } from '../../entities/loai-thu-cung.entity';
import { User } from '../../entities/user.entity';
import { ChiNhanh } from '../../entities/chi-nhanh.entity';
import { CungCapDichVu } from '../../entities/cung-cap-dich-vu.entity';
import { DichVuYTe } from '../../entities/dich-vu-y-te.entity';
import { DanhGiaMuaHang } from '../../entities/danh-gia-mua-hang.entity';

@Injectable()
export class CustomerPortalService {
    constructor(
        @InjectRepository(SanPham)
        private productRepo: Repository<SanPham>,
        @InjectRepository(LichHen)
        private appointmentRepo: Repository<LichHen>,
        @InjectRepository(LichLamViecBacSi)
        private scheduleRepo: Repository<LichLamViecBacSi>,
        @InjectRepository(NhanVien)
        private doctorRepo: Repository<NhanVien>,
        @InjectRepository(ThuCung)
        private petRepo: Repository<ThuCung>,
        @InjectRepository(KhachHang)
        private customerRepo: Repository<KhachHang>,
        @InjectRepository(HoaDon)
        private invoiceRepo: Repository<HoaDon>,
        @InjectRepository(HoaDonSanPham)
        private invoiceDetailRepo: Repository<HoaDonSanPham>,
        @InjectRepository(GiayKhamBenhTongQuat)
        private examRepo: Repository<GiayKhamBenhTongQuat>,
        @InjectRepository(ToaThuoc)
        private prescriptionRepo: Repository<ToaThuoc>,
        @InjectRepository(ChiTietTonKho)
        private inventoryRepo: Repository<ChiTietTonKho>,
        @InjectRepository(ChungLoaiThuCung)
        private petBreedRepo: Repository<ChungLoaiThuCung>,
        @InjectRepository(LoaiThuCung)
        private petCategoryRepo: Repository<LoaiThuCung>,
        @InjectRepository(User)
        private userRepo: Repository<User>,
        @InjectRepository(ChiNhanh)
        private branchRepo: Repository<ChiNhanh>,
        @InjectRepository(CungCapDichVu)
        private branchServiceRepo: Repository<CungCapDichVu>,
        @InjectRepository(DichVuYTe)
        private serviceRepo: Repository<DichVuYTe>,
        @InjectRepository(DanhGiaMuaHang)
        private reviewRepo: Repository<DanhGiaMuaHang>,
    ) { }

    // ========== HELPER METHODS ==========

    /**
     * Create a customer record for an existing user who doesn't have one
     */
    async createCustomerForUser(userId: number, data: { hoTen?: string; soDienThoai?: string }): Promise<number> {
        // First check if user already has a customer record in the database
        const user = await this.userRepo.findOne({
            where: { id: userId },
        });

        if (user?.ma_khach_hang) {
            // User already has a customer record, return it
            return user.ma_khach_hang;
        }

        // Create customer record
        const khachHang = this.customerRepo.create({
            HoTen: data.hoTen || 'Customer',
            SoDienThoai: data.soDienThoai || undefined,
        });
        await this.customerRepo.save(khachHang);

        // Link user to customer
        await this.userRepo.update(userId, {
            ma_khach_hang: khachHang.MaKhachHang,
        });

        return khachHang.MaKhachHang;
    }

    // ========== PRODUCTS ==========

    async getProducts(filters?: {
        loai?: string;
        search?: string;
        page?: number;
        limit?: number;
        sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'name';
        minPrice?: number;
        maxPrice?: number;
    }) {
        const page = filters?.page || 1;
        const limit = filters?.limit || 20;
        const offset = (page - 1) * limit;

        // Query starting from Inventory to ensure we show items that exist in stock
        const query = this.inventoryRepo
            .createQueryBuilder('tk')
            .leftJoinAndSelect('tk.SanPham', 'sp')
            .select([
                'sp.MaSanPham',
                'sp.TenSanPham',
                'sp.LoaiSanPham',
                'sp.GiaTienSanPham',
                'sp.HinhAnh',
                'SUM(tk.SoLuong) as total_stock'
            ])
            .where('tk.SoLuong > 0') // Only show items with stock
            .groupBy('sp.MaSanPham')
            .addGroupBy('sp.TenSanPham')
            .addGroupBy('sp.LoaiSanPham')
            .addGroupBy('sp.GiaTienSanPham')
            .addGroupBy('sp.HinhAnh');

        if (filters?.loai) {
            query.andWhere('sp.LoaiSanPham = :loai', { loai: filters.loai });
        }

        if (filters?.search) {
            query.andWhere('LOWER(sp.TenSanPham) LIKE LOWER(:search)', { search: `%${filters.search}%` });
        }

        if (filters?.minPrice !== undefined) {
            query.andHaving('SUM(sp.GiaTienSanPham) >= :minPrice', { minPrice: filters.minPrice });
        }

        if (filters?.maxPrice !== undefined) {
            query.andHaving('SUM(sp.GiaTienSanPham) <= :maxPrice', { maxPrice: filters.maxPrice });
        }

        // Sorting
        switch (filters?.sortBy) {
            case 'price_asc':
                query.orderBy('sp.GiaTienSanPham', 'ASC');
                break;
            case 'price_desc':
                query.orderBy('sp.GiaTienSanPham', 'DESC');
                break;
            case 'newest':
                query.orderBy('sp.MaSanPham', 'DESC');
                break;
            case 'name':
            default:
                query.orderBy('sp.TenSanPham', 'ASC');
                break;
        }

        // Get total count first (before pagination)
        const allResults = await query.getRawMany();
        const total = allResults.length;

        // Apply pagination
        query.offset(offset).limit(limit);
        const results = await query.getRawMany();

        const products = results.map((p) => ({
            maSanPham: p.sp_MaSanPham,
            tenSanPham: p.sp_TenSanPham,
            loaiSanPham: p.sp_LoaiSanPham,
            giaTien: p.sp_GiaTienSanPham,
            hinhAnh: p.sp_HinhAnh,
            moTa: '',
            tonKho: parseInt(p.total_stock) || 0,
        }));

        return {
            products,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            }
        };
    }

    async getProductById(maSanPham: string) {
        const product = await this.productRepo.findOne({
            where: { MaSanPham: maSanPham },
            relations: ['ChiTietTonKhos', 'DanhGias'],
        });

        if (!product) {
            throw new NotFoundException(`Product ${maSanPham} not found`);
        }

        // Calculate average rating
        const reviews = product.DanhGias || [];
        const avgRating = reviews.length > 0
            ? reviews.reduce((sum, r) => sum + r.SoSao, 0) / reviews.length
            : 0;

        return {
            maSanPham: product.MaSanPham,
            tenSanPham: product.TenSanPham,
            loaiSanPham: product.LoaiSanPham,
            giaTien: product.GiaTienSanPham,
            hinhAnh: product.HinhAnh,
            moTa: '',
            tonKho: product.ChiTietTonKhos?.reduce((sum, tk) => sum + (tk.SoLuong || 0), 0) || 0,
            avgRating: Math.round(avgRating * 10) / 10,
            reviewCount: reviews.length,
        };
    }

    async getProductCategories() {
        const categories = await this.inventoryRepo
            .createQueryBuilder('tk')
            .leftJoin('tk.SanPham', 'sp')
            .select('DISTINCT sp.LoaiSanPham', 'loai')
            .where('tk.SoLuong > 0')
            .getRawMany();

        return categories.map((c) => c.loai).filter((c) => c);
    }

    // ========== DOCTORS & SCHEDULES ==========

    async getDoctors() {
        const doctors = await this.doctorRepo.find({
            where: { LoaiNhanVien: 'BacSi' }
        });

        return doctors.map((d) => ({
            maNhanVien: d.MaNhanVien,
            hoTen: d.HoTen,
            soDienThoai: d.SDT,
            email: '', // Entity does not have email
        }));
    }

    async getDoctorSchedule(maBacSi: string, date?: string) {
        // Get work schedules
        const scheduleQuery = this.scheduleRepo
            .createQueryBuilder('lich')
            .leftJoinAndSelect('lich.BacSi', 'bs')
            .leftJoinAndSelect('lich.ChiNhanh', 'cn')
            .where('lich.MaBacSi = :maBacSi', { maBacSi });

        const targetDate = date || new Date().toISOString().split('T')[0];

        if (date) {
            scheduleQuery.andWhere('lich.Ngay = :date', { date });
        } else {
            // Get next 7 days by default
            const today = new Date().toISOString().split('T')[0];
            scheduleQuery.andWhere('lich.Ngay >= :today', { today });
        }

        scheduleQuery.orderBy('lich.Ngay', 'ASC');
        const schedules = await scheduleQuery.getMany();

        // Get doctor info for default schedule
        const doctor = await this.doctorRepo.findOne({ where: { MaNhanVien: maBacSi } });

        // Get all appointments for the doctor (any status to show schedule)
        const appointmentQuery = this.appointmentRepo
            .createQueryBuilder('apt')
            .leftJoinAndSelect('apt.BacSi', 'bs')
            .leftJoinAndSelect('apt.ThuCung', 'tc')
            .leftJoinAndSelect('apt.KhachHang', 'kh')
            .where('apt.MaBacSi = :maBacSi', { maBacSi });

        if (date) {
            appointmentQuery.andWhere('apt.NgayHen = :date', { date });
        } else {
            const today = new Date().toISOString().split('T')[0];
            appointmentQuery.andWhere('apt.NgayHen >= :today', { today });
        }

        appointmentQuery.orderBy('apt.NgayHen', 'ASC').addOrderBy('apt.GioBatDau', 'ASC');
        const appointments = await appointmentQuery.getMany();

        // Combine work schedules and appointments
        const workSchedules = schedules.map((s) => ({
            type: 'schedule',
            maLichLamViec: `${s.MaBacSi}-${s.Ngay}`,
            ngayLamViec: s.Ngay,
            gioBatDau: '08:00',
            gioKetThuc: '17:00',
            chiNhanh: s.ChiNhanh?.TenChiNhanh,
            bacSi: {
                maNhanVien: s.BacSi?.MaNhanVien,
                hoTen: s.BacSi?.HoTen,
            },
        }));

        const appointmentSchedules = appointments.map((apt) => ({
            type: 'appointment',
            maLichHen: apt.MaLichHen,
            ngayLamViec: apt.NgayHen,
            gioBatDau: apt.GioBatDau || apt.GioHen,
            gioKetThuc: apt.GioKetThuc,
            trangThai: apt.TrangThai,
            petName: apt.ThuCung?.TenThuCung,
            customerName: apt.KhachHang?.HoTen,
            ghiChu: apt.GhiChu,
            bacSi: {
                maNhanVien: apt.BacSi?.MaNhanVien,
                hoTen: apt.BacSi?.HoTen,
            },
        }));

        // If no schedules or appointments exist, return a default schedule for the selected date
        if (workSchedules.length === 0 && appointmentSchedules.length === 0) {
            return [{
                type: 'schedule',
                maLichLamViec: `${maBacSi}-${targetDate}`,
                ngayLamViec: targetDate,
                gioBatDau: '08:00',
                gioKetThuc: '17:00',
                chiNhanh: 'Tất cả chi nhánh',
                bacSi: {
                    maNhanVien: maBacSi,
                    hoTen: doctor?.HoTen || 'Bác sĩ',
                },
            }];
        }

        return [...workSchedules, ...appointmentSchedules];
    }

    async getAvailableSlots(maBacSi: string, ngayHen: string) {
        // Get doctor's schedule for the day
        const schedules = await this.scheduleRepo.find({
            where: { MaBacSi: maBacSi, Ngay: new Date(ngayHen) },
        });

        // Get existing appointments for that doctor on that day
        const appointments = await this.appointmentRepo.find({
            where: { MaBacSi: maBacSi, NgayHen: new Date(ngayHen) },
        });

        const bookedTimes = appointments.map((a) => a.GioHen);

        // Generate available slots (every 30 minutes)
        // Default working hours 08:00 - 17:00 if schedule exists
        const slots: string[] = [];

        // If doctor has a schedule entry for this day
        if (schedules.length > 0) {
            const startHour = 8;
            const startMin = 0;
            const endHour = 17;
            const endMin = 0;

            let currentHour = startHour;
            let currentMin = startMin;

            while (currentHour < endHour || (currentHour === endHour && currentMin < endMin)) {
                const timeStr = `${String(currentHour).padStart(2, '0')}:${String(currentMin).padStart(2, '0')}`;
                if (!bookedTimes.includes(timeStr)) {
                    slots.push(timeStr);
                }
                currentMin += 30;
                if (currentMin >= 60) {
                    currentHour++;
                    currentMin = 0;
                }
            }
        }

        return slots;
    }

    // ========== APPOINTMENTS ==========

    async getCustomerAppointments(maKhachHang: number) {
        const appointments = await this.appointmentRepo.find({
            where: { MaKhachHang: maKhachHang },
            relations: ['ThuCung', 'ThuCung.ChungLoai', 'BacSi'],
            order: { NgayHen: 'DESC', GioHen: 'ASC' },
        });

        return appointments.map((a) => ({
            maLichHen: a.MaLichHen,
            ngayHen: a.NgayHen,
            gioHen: a.GioHen,
            trangThai: a.TrangThai,
            ghiChu: a.GhiChu,
            thuCung: a.ThuCung
                ? {
                    maThuCung: a.ThuCung.MaThuCung,
                    tenThuCung: a.ThuCung.TenThuCung,
                    chungLoai: a.ThuCung.ChungLoai?.TenChungLoaiThuCung,
                }
                : null,
            bacSi: a.BacSi
                ? {
                    maNhanVien: a.BacSi.MaNhanVien,
                    hoTen: a.BacSi.HoTen,
                }
                : null,
        }));
    }

    async bookAppointment(dto: {
        maKhachHang: number;
        maThuCung: number;
        maBacSi?: string;
        maChiNhanh: string;
        maDichVu: string;
        ngayHen: string;
        gioHen: string;
        gioBatDau?: string;
        gioKetThuc?: string;
        ghiChu?: string;
    }) {
        // Auto-calculate end time if not provided (start time + 20 minutes)
        let startTime = dto.gioBatDau || dto.gioHen;
        let endTime = dto.gioKetThuc;

        if (!endTime && startTime) {
            const [hours, minutes] = startTime.split(':').map(Number);
            const endDate = new Date();
            endDate.setHours(hours, minutes + 20, 0, 0);
            endTime = endDate.toTimeString().slice(0, 5);
        }

        // Verify pet belongs to customer
        const pet = await this.petRepo.findOne({
            where: { MaThuCung: dto.maThuCung, MaKhachHang: dto.maKhachHang },
        });

        if (!pet) {
            throw new BadRequestException('Pet not found or does not belong to this customer');
        }

        // Verify service is available at selected branch
        const branchService = await this.branchServiceRepo.findOne({
            where: {
                MaChiNhanh: dto.maChiNhanh,
                MaDichVu: dto.maDichVu,
            },
        });

        if (!branchService) {
            throw new BadRequestException('Service not available at selected branch');
        }

        // Check if slot is available
        if (dto.maBacSi) {
            const existing = await this.appointmentRepo
                .createQueryBuilder('apt')
                .where('apt.MaBacSi = :maBacSi', { maBacSi: dto.maBacSi })
                .andWhere('apt.NgayHen = :ngayHen', { ngayHen: dto.ngayHen })
                .andWhere('CAST(apt.GioHen AS nvarchar(10)) = :gioHen', { gioHen: dto.gioHen })
                .getOne();

            if (existing) {
                throw new BadRequestException('This time slot is already booked');
            }
        }

        const appointment = this.appointmentRepo.create({
            MaKhachHang: dto.maKhachHang,
            MaThuCung: dto.maThuCung,
            MaBacSi: dto.maBacSi,
            MaChiNhanh: dto.maChiNhanh,
            MaDichVu: dto.maDichVu,
            NgayHen: new Date(dto.ngayHen),
            GioHen: dto.gioHen || startTime, // Keep for backward compatibility
            GioBatDau: startTime,
            GioKetThuc: endTime,
            GhiChu: dto.ghiChu,
            TrangThai: 'Chờ xác nhận',
        });

        const saved = await this.appointmentRepo.save(appointment);

        return {
            maLichHen: saved.MaLichHen,
            message: 'Appointment booked successfully',
        };
    }

    async cancelAppointment(maLichHen: number, maKhachHang: number) {
        const appointment = await this.appointmentRepo.findOne({
            where: { MaLichHen: maLichHen, MaKhachHang: maKhachHang },
        });

        if (!appointment) {
            throw new NotFoundException('Appointment not found');
        }

        if (appointment.TrangThai === 'Đã hoàn thành') {
            throw new BadRequestException('Cannot cancel a completed appointment');
        }

        appointment.TrangThai = 'Đã hủy';
        await this.appointmentRepo.save(appointment);

        return { success: true, message: 'Appointment cancelled' };
    }

    // ========== PETS ==========

    async getCustomerPets(maKhachHang: number) {
        const pets = await this.petRepo.find({
            where: { MaKhachHang: maKhachHang },
            relations: ['ChungLoai', 'ChungLoai.LoaiThuCung'],
            order: { TenThuCung: 'ASC' },
        });

        return pets.map((p) => ({
            maThuCung: p.MaThuCung,
            tenThuCung: p.TenThuCung,
            gioiTinh: p.GioiTinh,
            ngaySinh: p.NgaySinhThuCung,
            canNang: p.CanNang,
            mauSac: p.MauSac,
            loaiThuCung: p.ChungLoai?.LoaiThuCung?.TenLoaiThuCung,
            chungLoai: p.ChungLoai?.TenChungLoaiThuCung,
        }));
    }

    async getPetBreeds() {
        return this.petBreedRepo.find({
            order: { TenChungLoaiThuCung: 'ASC' },
        });
    }

    async getPetCategories() {
        return this.petCategoryRepo.find({
            order: { TenLoaiThuCung: 'ASC' },
        });
    }

    async createPet(maKhachHang: number, dto: {
        tenThuCung: string;
        maChungLoai: string;
        gioiTinh: string;
        canNang: number;
        mauSac: string;
        ngaySinh?: string;
    }) {
        const pet = this.petRepo.create({
            MaKhachHang: maKhachHang,
            TenThuCung: dto.tenThuCung,
            MaChungLoai: dto.maChungLoai,
            GioiTinh: dto.gioiTinh,
            CanNang: dto.canNang,
            MauSac: dto.mauSac,
            NgaySinhThuCung: dto.ngaySinh ? new Date(dto.ngaySinh) : new Date(),
        });

        const savedPet = await this.petRepo.save(pet);

        return {
            maThuCung: savedPet.MaThuCung,
            message: 'Pet created successfully',
        };
    }

    async getPetHistory(maThuCung: number, maKhachHang: number) {
        console.log('getPetHistory called with:', { maThuCung, maKhachHang });

        // Verify pet belongs to customer
        const pet = await this.petRepo.findOne({
            where: { MaThuCung: maThuCung, MaKhachHang: maKhachHang },
        });

        if (!pet) {
            throw new NotFoundException('Pet not found');
        }

        console.log('Pet found:', pet.MaThuCung, pet.TenThuCung);

        // Get examinations
        const exams = await this.examRepo.find({
            where: { MaThuCung: maThuCung },
            relations: ['ChiTietChuanDoans', 'ChiTietTrieuChungs'],
            order: { NgayKham: 'DESC' },
        });

        console.log('Exams found:', exams.length, exams);

        // Get prescriptions
        const prescriptions = await this.prescriptionRepo.find({
            where: { MaThuCung: maThuCung },
            relations: ['ChiTiets', 'ChiTiets.Thuoc', 'ChiTiets.Thuoc.SanPham'],
            order: { NgayKham: 'DESC' },
        });

        return {
            pet: {
                maThuCung: pet.MaThuCung,
                tenThuCung: pet.TenThuCung,
            },
            examinations: exams.map((e) => ({
                maGiayKham: e.MaGiayKhamTongQuat,
                ngayKham: e.NgayKham,
                chanDoan: e.ChiTietChuanDoans?.map(c => c.ChuanDoan).join(', ') || '',
                trieuChung: e.ChiTietTrieuChungs?.map(t => t.TrieuChung).join(', ') || '',
                ghiChu: e.MoTa,
                bacSi: '', // Doctor info not available in General Exam entity
            })),
            prescriptions: prescriptions.map((p) => ({
                maToaThuoc: p.MaToaThuoc,
                ngayKeToa: p.NgayKham,
                tongTien: p.TongTien,
                soLuongThuoc: p.ChiTiets?.length || 0,
                medicines: p.ChiTiets?.map(ct => ({
                    tenThuoc: ct.Thuoc?.SanPham?.TenSanPham || 'Unknown',
                    soLuong: ct.SoLuong,
                    ghiChu: ct.GhiChu,
                })) || [],
            })),
        };
    }

    // ========== BRANCHES AND SERVICES ==========

    async getBranches() {
        const branches = await this.branchRepo.find({
            order: { MaChiNhanh: 'ASC' },
        });

        return branches.map(branch => ({
            maChiNhanh: branch.MaChiNhanh,
            tenChiNhanh: branch.TenChiNhanh,
            diaChi: branch.DiaChi,
        }));
    }

    async getBranchServices(maChiNhanh: string) {
        // Trim to handle CHAR(4) padding with trailing spaces
        const trimmedBranchId = maChiNhanh.trim();

        // Get services available at this branch via CUNGCAPDICHVU table
        const branchServices = await this.branchServiceRepo.find({
            where: { MaChiNhanh: trimmedBranchId },
            relations: ['DichVu'],
        });

        return branchServices.map(bs => ({
            maDichVu: bs.MaDichVu,
            tenDichVu: bs.DichVu?.TenDichVu || 'Unknown',
            loaiDichVu: bs.DichVu?.LoaiDichVu,
        }));
    }

    // ========== ORDERS/HISTORY ==========

    async getCustomerOrders(maKhachHang: number) {
        const invoices = await this.invoiceRepo.find({
            where: { MaKhachHang: maKhachHang },
            relations: ['SanPhams', 'SanPhams.SanPham'],
            order: { NgayLap: 'DESC' },
        });

        return invoices.map((inv) => ({
            maHoaDon: inv.MaHoaDon,
            ngayLap: inv.NgayLap,
            tongTien: inv.TongTien,
            trangThai: inv.TrangThai || 'Đã thanh toán',
            chiTiet: inv.SanPhams?.map((ct) => ({
                tenSanPham: ct.SanPham?.TenSanPham,
                soLuong: ct.SoLuong,
                donGia: ct.DonGia,
                thanhTien: ct.ThanhTien,
            })),
        }));
    }

    async createOrder(maKhachHang: number, items: { maSanPham: string; soLuong: number }[]) {
        if (!items || items.length === 0) {
            throw new BadRequestException('Cart is empty');
        }

        // Verify customer exists
        const customer = await this.customerRepo.findOne({
            where: { MaKhachHang: maKhachHang },
        });

        if (!customer) {
            throw new NotFoundException('Customer not found');
        }

        // Calculate total and create invoice
        let tongTien = 0;
        const details: { maSanPham: string; soLuong: number; donGia: number; thanhTien: number }[] = [];

        for (const item of items) {
            const product = await this.productRepo.findOne({
                where: { MaSanPham: item.maSanPham },
            });

            if (!product) {
                throw new NotFoundException(`Product ${item.maSanPham} not found`);
            }

            const thanhTien = (product.GiaTienSanPham || 0) * item.soLuong;
            tongTien += thanhTien;

            details.push({
                maSanPham: item.maSanPham,
                soLuong: item.soLuong,
                donGia: product.GiaTienSanPham || 0,
                thanhTien,
            });
        }

        // Create invoice
        const invoice = this.invoiceRepo.create({
            MaKhachHang: maKhachHang,
            NgayLap: new Date(),
            TongTien: tongTien,
            TrangThai: 'Đã đặt hàng',
        });

        const savedInvoice = await this.invoiceRepo.save(invoice);

        // Create invoice details
        for (const detail of details) {
            const invoiceDetail = this.invoiceDetailRepo.create({
                MaHoaDon: savedInvoice.MaHoaDon,
                MaSanPham: detail.maSanPham,
                SoLuong: detail.soLuong,
                DonGia: detail.donGia,
                ThanhTien: detail.thanhTien,
            });
            await this.invoiceDetailRepo.save(invoiceDetail);
        }

        return {
            maHoaDon: savedInvoice.MaHoaDon,
            tongTien,
            message: 'Order placed successfully',
        };
    }

    // ========== PRODUCT REVIEWS ==========

    async getProductReviews(maSanPham: string) {
        const reviews = await this.reviewRepo.find({
            where: { MaSanPham: maSanPham },
            relations: ['HoaDon', 'HoaDon.KhachHang'],
            order: { NgayDanhGia: 'DESC' },
        });

        // Calculate rating breakdown
        const ratingBreakdown = [0, 0, 0, 0, 0]; // 1-5 stars
        reviews.forEach(r => {
            if (r.SoSao >= 1 && r.SoSao <= 5) {
                ratingBreakdown[r.SoSao - 1]++;
            }
        });

        const totalReviews = reviews.length;
        const avgRating = totalReviews > 0
            ? reviews.reduce((sum, r) => sum + r.SoSao, 0) / totalReviews
            : 0;

        return {
            avgRating: Math.round(avgRating * 10) / 10,
            totalReviews,
            ratingBreakdown: {
                star5: ratingBreakdown[4],
                star4: ratingBreakdown[3],
                star3: ratingBreakdown[2],
                star2: ratingBreakdown[1],
                star1: ratingBreakdown[0],
            },
            reviews: reviews.map(r => ({
                maDanhGia: r.MaDanhGiaMuaHang,
                soSao: r.SoSao,
                nhanXet: r.NhanXet,
                ngayDanhGia: r.NgayDanhGia,
                tenKhachHang: r.HoaDon?.KhachHang?.HoTen || 'Khách hàng',
            })),
        };
    }

    async canReviewProduct(maSanPham: string, maKhachHang: number) {
        // Check if customer has purchased this product
        const purchase = await this.invoiceDetailRepo
            .createQueryBuilder('ct')
            .innerJoin('ct.HoaDon', 'hd')
            .where('ct.MaSanPham = :maSanPham', { maSanPham })
            .andWhere('hd.MaKhachHang = :maKhachHang', { maKhachHang })
            .getOne();

        if (!purchase) {
            return { canReview: false, reason: 'Bạn chưa mua sản phẩm này' };
        }

        // Check if already reviewed
        const existingReview = await this.reviewRepo
            .createQueryBuilder('dg')
            .innerJoin('dg.HoaDon', 'hd')
            .where('dg.MaSanPham = :maSanPham', { maSanPham })
            .andWhere('hd.MaKhachHang = :maKhachHang', { maKhachHang })
            .getOne();

        if (existingReview) {
            return { canReview: false, reason: 'Bạn đã đánh giá sản phẩm này' };
        }

        return { canReview: true, maHoaDon: purchase.MaHoaDon };
    }

    async submitReview(maSanPham: string, maKhachHang: number, dto: {
        soSao: number;
        nhanXet?: string;
    }) {
        // First check if can review
        const canReviewResult = await this.canReviewProduct(maSanPham, maKhachHang);
        if (!canReviewResult.canReview) {
            throw new BadRequestException(canReviewResult.reason);
        }

        // Create review
        const review = this.reviewRepo.create({
            MaHoaDon: canReviewResult.maHoaDon,
            MaSanPham: maSanPham,
            SoSao: dto.soSao,
            NhanXet: dto.nhanXet || '',
            NgayDanhGia: new Date(),
        });

        const savedReview = await this.reviewRepo.save(review);

        return {
            maDanhGia: savedReview.MaDanhGiaMuaHang,
            message: 'Đánh giá thành công',
        };
    }
}

