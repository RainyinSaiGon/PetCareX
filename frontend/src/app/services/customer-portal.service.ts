import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Product {
    maSanPham: string;
    tenSanPham: string;
    loaiSanPham: string;
    giaTien: number;
    hinhAnh?: string;
    moTa?: string;
    tonKho: number;
}

export interface Doctor {
    maNhanVien: string;
    hoTen: string;
    soDienThoai?: string;
    email?: string;
}

export interface DoctorSchedule {
    type?: 'schedule' | 'appointment';
    maLichLamViec?: number;
    maLichHen?: number;
    ngayLamViec: Date | string;
    gioBatDau: string;
    gioKetThuc: string;
    chiNhanh?: string;
    petName?: string;
    customerName?: string;
    ghiChu?: string;
    bacSi?: { maNhanVien: string; hoTen: string };
}

export interface CustomerAppointment {
    maLichHen: number;
    ngayHen: Date | string;
    gioHen: string;
    gioBatDau?: string;
    gioKetThuc?: string;
    trangThai: string;
    ghiChu?: string;
    thuCung?: { maThuCung: number; tenThuCung: string; chungLoai?: string };
    bacSi?: { maNhanVien: string; hoTen: string };
}

export interface Pet {
    maThuCung: number;
    tenThuCung: string;
    gioiTinh?: string;
    ngaySinh?: Date;
    canNang?: number;
    mauSac?: string;
    loaiThuCung?: string;
    chungLoai?: string;
}

export interface PetHistory {
    pet: { maThuCung: number; tenThuCung: string };
    examinations: {
        maGiayKham: number;
        ngayKham: Date;
        chanDoan?: string;
        trieuChung?: string;
        ghiChu?: string;
        bacSi?: string;
    }[];
    prescriptions: {
        maToaThuoc: number;
        ngayKeToa: Date;
        tongTien: number;
        soLuongThuoc: number;
        medicines?: {
            tenThuoc: string;
            soLuong: number;
            ghiChu?: string;
        }[];
    }[];
}

export interface Order {
    maHoaDon: number;
    ngayLap: Date;
    tongTien: number;
    trangThai: string;
    chiTiet?: { tenSanPham: string; soLuong: number; donGia: number; thanhTien: number }[];
}

export interface CartItem {
    product: Product;
    quantity: number;
}

export interface Branch {
    maChiNhanh: string;
    tenChiNhanh: string;
    diaChi?: string;
}

export interface Service {
    maDichVu: string;
    tenDichVu: string;
    loaiDichVu?: string;
}

@Injectable({
    providedIn: 'root',
})
export class CustomerPortalService {
    private apiUrl = 'http://localhost:3000/api/customer';

    // Local cart storage
    private cart: CartItem[] = [];

    constructor(private http: HttpClient) {
        // Load cart from localStorage
        const savedCart = localStorage.getItem('customer_cart');
        if (savedCart) {
            this.cart = JSON.parse(savedCart);
        }
    }

    // ========== PRODUCTS ==========

    getProducts(filters?: { loai?: string; search?: string; limit?: number }): Observable<Product[]> {
        let params = new HttpParams();
        if (filters?.loai) params = params.set('loai', filters.loai);
        if (filters?.search) params = params.set('search', filters.search);
        if (filters?.limit) params = params.set('limit', filters.limit.toString());
        return this.http.get<Product[]>(`${this.apiUrl}/products`, { params });
    }

    getProductCategories(): Observable<string[]> {
        return this.http.get<string[]>(`${this.apiUrl}/products/categories`);
    }

    getProductById(id: string): Observable<Product> {
        return this.http.get<Product>(`${this.apiUrl}/products/${id}`);
    }

    // ========== CART (LOCAL) ==========

    getCart(): CartItem[] {
        return this.cart;
    }

    addToCart(product: Product, quantity: number = 1): void {
        const existing = this.cart.find((item) => item.product.maSanPham === product.maSanPham);
        if (existing) {
            existing.quantity += quantity;
        } else {
            this.cart.push({ product, quantity });
        }
        this.saveCart();
    }

    updateCartQuantity(maSanPham: string, quantity: number): void {
        const item = this.cart.find((i) => i.product.maSanPham === maSanPham);
        if (item) {
            item.quantity = quantity;
            if (quantity <= 0) {
                this.removeFromCart(maSanPham);
            } else {
                this.saveCart();
            }
        }
    }

    removeFromCart(maSanPham: string): void {
        this.cart = this.cart.filter((item) => item.product.maSanPham !== maSanPham);
        this.saveCart();
    }

    clearCart(): void {
        this.cart = [];
        this.saveCart();
    }

    getCartTotal(): number {
        return this.cart.reduce((sum, item) => sum + item.product.giaTien * item.quantity, 0);
    }

    getCartCount(): number {
        return this.cart.reduce((sum, item) => sum + item.quantity, 0);
    }

    private saveCart(): void {
        localStorage.setItem('customer_cart', JSON.stringify(this.cart));
    }

    // ========== ORDERS ==========

    placeOrder(): Observable<{ maHoaDon: number; tongTien: number; message: string }> {
        const items = this.cart.map((item) => ({
            maSanPham: item.product.maSanPham,
            soLuong: item.quantity,
        }));
        return this.http.post<{ maHoaDon: number; tongTien: number; message: string }>(`${this.apiUrl}/orders`, { items });
    }

    getOrders(): Observable<Order[]> {
        return this.http.get<Order[]>(`${this.apiUrl}/orders`);
    }

    // ========== DOCTORS ==========

    getDoctors(): Observable<Doctor[]> {
        return this.http.get<Doctor[]>(`${this.apiUrl}/doctors`);
    }

    getDoctorSchedule(maBacSi: string, date?: string): Observable<DoctorSchedule[]> {
        let params = new HttpParams();
        if (date) params = params.set('date', date);
        return this.http.get<DoctorSchedule[]>(`${this.apiUrl}/doctors/${maBacSi}/schedule`, { params });
    }

    getAvailableSlots(maBacSi: string, date: string): Observable<string[]> {
        return this.http.get<string[]>(`${this.apiUrl}/doctors/${maBacSi}/slots?date=${date}`);
    }

    // ========== APPOINTMENTS ==========

    getAppointments(): Observable<CustomerAppointment[]> {
        return this.http.get<CustomerAppointment[]>(`${this.apiUrl}/appointments`);
    }

    bookAppointment(dto: {
        maThuCung: number;
        maBacSi?: string;
        maChiNhanh: string;
        maDichVu: string;
        ngayHen: string;
        gioHen: string;
        gioBatDau?: string;
        gioKetThuc?: string;
        ghiChu?: string
    }): Observable<{ maLichHen: number; message: string }> {
        return this.http.post<{ maLichHen: number; message: string }>(`${this.apiUrl}/appointments`, dto);
    }

    cancelAppointment(maLichHen: number): Observable<{ success: boolean; message: string }> {
        return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/appointments/${maLichHen}`);
    }

    // ========== PETS ==========

    getPets(): Observable<Pet[]> {
        return this.http.get<Pet[]>(`${this.apiUrl}/pets`);
    }

    getPetBreeds(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/pets/breeds`);
    }

    getPetCategories(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/pets/categories`);
    }

    createPet(data: any): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/pets`, data);
    }

    getPetHistory(maThuCung: number): Observable<PetHistory> {
        return this.http.get<PetHistory>(`${this.apiUrl}/pets/${maThuCung}/history`);
    }

    // ========== BRANCHES AND SERVICES ==========

    getBranches(): Observable<Branch[]> {
        return this.http.get<Branch[]>(`${this.apiUrl}/branches`);
    }

    getBranchServices(maChiNhanh: string): Observable<Service[]> {
        return this.http.get<Service[]>(`${this.apiUrl}/branches/${maChiNhanh}/services`);
    }
}
