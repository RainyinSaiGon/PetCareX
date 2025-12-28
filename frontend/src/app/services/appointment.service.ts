import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Doctor {
    maNhanVien: string;
    hoTen: string;
}

export interface Appointment {
    maLichHen: number;
    ngayHen: string | Date;
    gioHen: string;
    trangThai: string;
    ghiChu?: string;
    isToday?: boolean;
    isTomorrow?: boolean;
    isUrgent?: boolean;
    khachHang: {
        maKhachHang: number;
        hoTen: string;
        soDienThoai: string;
    } | null;
    thuCung: {
        maThuCung: number;
        tenThuCung: string;
        chungLoai: string;
    } | null;
    bacSi: {
        maNhanVien: string;
        hoTen: string;
    } | null;
}

export interface CreateAppointmentDto {
    maKhachHang: number;
    maThuCung: number;
    maBacSi?: string;
    maChiNhanh?: string;
    maDichVu?: string;
    ngayHen: string;
    gioHen: string;
    gioBatDau?: string;
    gioKetThuc?: string;
    trangThai?: string;
    ghiChu?: string;
}

@Injectable({
    providedIn: 'root',
})
export class AppointmentService {
    private apiUrl = 'http://localhost:3000/api/appointments';

    constructor(private http: HttpClient) { }

    /**
     * Get list of doctors for assignment
     */
    getDoctors(): Observable<Doctor[]> {
        return this.http.get<Doctor[]>(`${this.apiUrl}/doctors`);
    }

    /**
     * Get list of branches
     */
    getBranches(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/branches`);
    }

    /**
     * Get services (optionally by branch)
     */
    getServices(maChiNhanh?: string): Observable<any[]> {
        let params = new HttpParams();
        if (maChiNhanh) params = params.set('maChiNhanh', maChiNhanh);
        return this.http.get<any[]>(`${this.apiUrl}/services`, { params });
    }

    /**
     * Get upcoming appointments for reminders
     */
    getUpcomingAppointments(): Observable<Appointment[]> {
        return this.http.get<Appointment[]>(`${this.apiUrl}/upcoming`);
    }

    /**
     * Get all appointments with optional filters
     */
    getAppointments(filters?: { date?: string; status?: string; maBacSi?: string; month?: string }): Observable<Appointment[]> {
        let params = new HttpParams();
        if (filters?.date) params = params.set('date', filters.date);
        if (filters?.status) params = params.set('status', filters.status);
        if (filters?.maBacSi) params = params.set('maBacSi', filters.maBacSi);
        if (filters?.month) params = params.set('month', filters.month);
        return this.http.get<Appointment[]>(this.apiUrl, { params });
    }

    /**
     * Get today's appointments
     */
    getTodayAppointments(): Observable<Appointment[]> {
        return this.http.get<Appointment[]>(`${this.apiUrl}/today`);
    }

    /**
     * Get appointment by ID
     */
    getAppointmentById(id: number): Observable<Appointment> {
        return this.http.get<Appointment>(`${this.apiUrl}/${id}`);
    }

    /**
     * Create new appointment
     */
    createAppointment(dto: CreateAppointmentDto): Observable<Appointment> {
        return this.http.post<Appointment>(this.apiUrl, dto);
    }

    /**
     * Update appointment
     */
    updateAppointment(id: number, dto: Partial<{ trangThai: string; ngayHen: string; gioHen: string; maBacSi: string; ghiChu: string }>): Observable<Appointment> {
        return this.http.patch<Appointment>(`${this.apiUrl}/${id}`, dto);
    }

    /**
     * Delete appointment
     */
    deleteAppointment(id: number): Observable<{ success: boolean; message: string }> {
        return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/${id}`);
    }
}
