import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface InvoiceFilter {
    search?: string;
    startDate?: string;
    endDate?: string;
    status?: string;
    maChiNhanh?: string;
    minAmount?: number;
    maxAmount?: number;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
}

export interface Invoice {
    maHoaDon: number;
    ngayLap: Date;
    giamGia: number;
    tongTien: number;
    trangThai: string;
    khachHang: {
        maKhachHang: number;
        hoTen: string;
        soDienThoai: string;
    } | null;
    nhanVien: {
        maNhanVien: string;
        hoTen: string;
    } | null;
    chiNhanh: {
        maChiNhanh: string;
        tenChiNhanh: string;
    } | null;
}

export interface InvoiceDetail extends Invoice {
    sanPhams: {
        maSanPham: string;
        tenSanPham: string;
        soLuong: number;
        donGia: number;
        thanhTien: number;
    }[];
    dichVus: {
        maDichVu: string;
        tenDichVu: string;
        soTien: number;
    }[];
}

export interface InvoiceStatistics {
    totalCount: number;
    totalRevenue: number;
    todayRevenue: number;
    todayCount: number;
    pendingCount: number;
    averageOrderValue: number;
    statusBreakdown: { status: string; count: number }[];
}

export interface InvoiceListResponse {
    invoices: Invoice[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

@Injectable({
    providedIn: 'root'
})
export class InvoiceService {
    private apiUrl = 'http://localhost:3000/admin/invoices';

    constructor(private http: HttpClient) { }

    getInvoices(filters: InvoiceFilter = {}): Observable<InvoiceListResponse> {
        let params = new HttpParams();

        if (filters.search) params = params.set('search', filters.search);
        if (filters.startDate) params = params.set('startDate', filters.startDate);
        if (filters.endDate) params = params.set('endDate', filters.endDate);
        if (filters.status) params = params.set('status', filters.status);
        if (filters.maChiNhanh) params = params.set('maChiNhanh', filters.maChiNhanh);
        if (filters.minAmount !== undefined) params = params.set('minAmount', filters.minAmount.toString());
        if (filters.maxAmount !== undefined) params = params.set('maxAmount', filters.maxAmount.toString());
        if (filters.page) params = params.set('page', filters.page.toString());
        if (filters.limit) params = params.set('limit', filters.limit.toString());
        if (filters.sortBy) params = params.set('sortBy', filters.sortBy);
        if (filters.sortOrder) params = params.set('sortOrder', filters.sortOrder);

        return this.http.get<InvoiceListResponse>(this.apiUrl, { params });
    }

    getInvoiceById(maHoaDon: number): Observable<InvoiceDetail> {
        return this.http.get<InvoiceDetail>(`${this.apiUrl}/${maHoaDon}`);
    }

    getStatistics(): Observable<InvoiceStatistics> {
        return this.http.get<InvoiceStatistics>(`${this.apiUrl}/statistics`);
    }

    getBranches(): Observable<{ maChiNhanh: string; tenChiNhanh: string }[]> {
        return this.http.get<{ maChiNhanh: string; tenChiNhanh: string }[]>(`${this.apiUrl}/branches`);
    }

    updateStatus(maHoaDon: number, status: string): Observable<any> {
        return this.http.put(`${this.apiUrl}/${maHoaDon}/status`, { status });
    }
}
