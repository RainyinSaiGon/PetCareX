import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CustomerPortalService } from './customer-portal.service';

@Controller('api/customer')
@UseGuards(JwtAuthGuard)
export class CustomerPortalController {
    constructor(private readonly customerService: CustomerPortalService) { }

    // ========== PRODUCTS ==========

    /**
     * Get product catalog
     * GET /api/customer/products?loai=Thuốc&search=vitamin&limit=20
     */
    @Get('products')
    async getProducts(
        @Query('loai') loai?: string,
        @Query('search') search?: string,
        @Query('limit') limit?: string,
    ) {
        return this.customerService.getProducts({
            loai,
            search,
            limit: limit ? parseInt(limit) : undefined,
        });
    }

    /**
     * Get product categories
     * GET /api/customer/products/categories
     */
    @Get('products/categories')
    async getCategories() {
        return this.customerService.getProductCategories();
    }

    /**
     * Get product by ID
     * GET /api/customer/products/:id
     */
    @Get('products/:id')
    async getProduct(@Param('id') id: string) {
        return this.customerService.getProductById(id);
    }

    // ========== DOCTORS & SCHEDULES ==========

    /**
     * Get list of doctors
     * GET /api/customer/doctors
     */
    @Get('doctors')
    async getDoctors() {
        return this.customerService.getDoctors();
    }

    /**
     * Get doctor schedule
     * GET /api/customer/doctors/:id/schedule?date=2025-12-28
     */
    @Get('doctors/:id/schedule')
    async getDoctorSchedule(@Param('id') id: string, @Query('date') date?: string) {
        return this.customerService.getDoctorSchedule(id, date);
    }

    /**
     * Get available time slots for a doctor on a date
     * GET /api/customer/doctors/:id/slots?date=2025-12-28
     */
    @Get('doctors/:id/slots')
    async getAvailableSlots(@Param('id') id: string, @Query('date') date: string) {
        return this.customerService.getAvailableSlots(id, date);
    }

    // ========== APPOINTMENTS ==========

    /**
     * Get customer's appointments
     * GET /api/customer/appointments
     */
    @Get('appointments')
    async getAppointments(@Req() req: any) {
        let maKhachHang = req.user?.ma_khach_hang;

        // If user doesn't have a customer record, create one automatically
        if (!maKhachHang) {
            const userId = req.user?.id;
            if (!userId) {
                return [];
            }
            maKhachHang = await this.customerService.createCustomerForUser(userId, {
                hoTen: req.user?.full_name || req.user?.username,
                soDienThoai: req.user?.phone,
            });
        }

        return this.customerService.getCustomerAppointments(maKhachHang);
    }

    /**
     * Book an appointment
     * POST /api/customer/appointments
     */
    @Post('appointments')
    async bookAppointment(
        @Req() req: any,
        @Body()
        dto: {
            maThuCung: number;
            maBacSi?: string;
            maChiNhanh: string;
            maDichVu: string;
            ngayHen: string;
            gioHen: string;
            gioBatDau?: string;
            gioKetThuc?: string;
            ghiChu?: string;
        },
    ) {
        let maKhachHang = req.user?.ma_khach_hang;

        // If user doesn't have a customer record, create one automatically
        if (!maKhachHang) {
            const userId = req.user?.id;
            if (!userId) {
                throw new Error('User not authenticated');
            }
            maKhachHang = await this.customerService.createCustomerForUser(userId, {
                hoTen: req.user?.full_name || req.user?.username,
                soDienThoai: req.user?.phone,
            });
        }

        return this.customerService.bookAppointment({
            maKhachHang,
            ...dto,
        });
    }

    /**
     * Cancel an appointment
     * DELETE /api/customer/appointments/:id
     */
    @Delete('appointments/:id')
    async cancelAppointment(@Req() req: any, @Param('id') id: string) {
        const maKhachHang = req.user?.ma_khach_hang;
        return this.customerService.cancelAppointment(parseInt(id), maKhachHang);
    }

    /**
     * Get all branches
     * GET /api/customer/branches
     */
    @Get('branches')
    async getBranches() {
        return this.customerService.getBranches();
    }

    /**
     * Get services available at a branch
     * GET /api/customer/branches/:maChiNhanh/services
     */
    @Get('branches/:maChiNhanh/services')
    async getBranchServices(@Param('maChiNhanh') maChiNhanh: string) {
        return this.customerService.getBranchServices(maChiNhanh);
    }

    // ========== PETS ==========

    /**
     * Get customer's pets
     * GET /api/customer/pets
     */
    @Get('pets')
    async getPets(@Req() req: any) {
        let maKhachHang = req.user?.ma_khach_hang;

        // If user doesn't have a customer record, create one automatically
        if (!maKhachHang) {
            const userId = req.user?.id;
            if (!userId) {
                return [];
            }

            // Create customer record for this user
            maKhachHang = await this.customerService.createCustomerForUser(userId, {
                hoTen: req.user?.full_name || req.user?.username,
                soDienThoai: req.user?.phone,
            });
        }

        return this.customerService.getCustomerPets(maKhachHang);
    }

    /**
     * Get pet history (exams, prescriptions)
     * GET /api/customer/pets/:id/history
     */
    @Get('pets/:id/history')
    async getPetHistory(@Req() req: any, @Param('id') id: string) {
        const maKhachHang = req.user?.ma_khach_hang;
        return this.customerService.getPetHistory(parseInt(id), maKhachHang);
    }

    /**
     * Get pet breeds
     * GET /api/customer/pets/breeds
     */
    @Get('pets/breeds')
    async getPetBreeds() {
        return this.customerService.getPetBreeds();
    }

    /**
     * Get pet categories (Dog, Cat...)
     * GET /api/customer/pets/categories
     */
    @Get('pets/categories')
    async getPetCategories() {
        return this.customerService.getPetCategories();
    }

    /**
     * Create new pet
     * POST /api/customer/pets
     */
    @Post('pets')
    async createPet(
        @Req() req: any,
        @Body() dto: {
            tenThuCung: string;
            maChungLoai: string;
            gioiTinh: string;
            canNang: number;
            mauSac: string;
            ngaySinh?: string;
        },
    ) {
        console.log('User object:', JSON.stringify(req.user, null, 2));
        let maKhachHang = req.user?.ma_khach_hang;

        // If user doesn't have a customer record, create one automatically
        if (!maKhachHang) {
            const userId = req.user?.id;
            if (!userId) {
                throw new Error('User not authenticated');
            }

            // Create customer record for this user
            maKhachHang = await this.customerService.createCustomerForUser(userId, {
                hoTen: req.user?.full_name || req.user?.username,
                soDienThoai: req.user?.phone,
            });
        }

        return this.customerService.createPet(maKhachHang, dto);
    }

    // ========== ORDERS ==========

    /**
     * Get customer's order history
     * GET /api/customer/orders
     */
    @Get('orders')
    async getOrders(@Req() req: any) {
        let maKhachHang = req.user?.ma_khach_hang;

        // If user doesn't have a customer record, create one automatically
        if (!maKhachHang) {
            const userId = req.user?.id;
            if (!userId) {
                return [];
            }
            maKhachHang = await this.customerService.createCustomerForUser(userId, {
                hoTen: req.user?.full_name || req.user?.username,
                soDienThoai: req.user?.phone,
            });
        }

        return this.customerService.getCustomerOrders(maKhachHang);
    }

    /**
     * Create new order
     * POST /api/customer/orders
     */
    @Post('orders')
    async createOrder(
        @Req() req: any,
        @Body() dto: { items: { maSanPham: string; soLuong: number }[] },
    ) {
        let maKhachHang = req.user?.ma_khach_hang;

        // If user doesn't have a customer record, create one automatically
        if (!maKhachHang) {
            const userId = req.user?.id;
            if (!userId) {
                throw new Error('User not authenticated');
            }
            maKhachHang = await this.customerService.createCustomerForUser(userId, {
                hoTen: req.user?.full_name || req.user?.username,
                soDienThoai: req.user?.phone,
            });
        }

        return this.customerService.createOrder(maKhachHang, dto.items);
    }
}
