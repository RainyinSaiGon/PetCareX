import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CustomerPortalService, CustomerAppointment, Pet, Doctor, Branch, Service } from '../../../services/customer-portal.service';
import { NotificationService } from '../../../services/notification.service';

@Component({
    selector: 'app-customer-appointments',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './customer-appointments.component.html',
    styleUrls: ['./customer-appointments.component.css'],
})
export class CustomerAppointmentsComponent implements OnInit {
    appointments: CustomerAppointment[] = [];
    pets: Pet[] = [];
    doctors: Doctor[] = [];
    branches: Branch[] = [];
    services: Service[] = [];
    availableSlots: string[] = [];

    isLoading = false;
    showBookingForm = false;
    isBooking = false;

    bookingForm = {
        maThuCung: 0,
        maBacSi: '',
        maChiNhanh: '',
        maDichVu: '',
        ngayHen: '',
        gioHen: '',
        gioBatDau: '',
        gioKetThuc: '',
        ghiChu: '',
    };

    constructor(
        private customerService: CustomerPortalService,
        private notificationService: NotificationService,
    ) { }

    ngOnInit(): void {
        this.loadAppointments();
        this.loadPets();
        this.loadDoctors();
        this.loadBranches();
        this.bookingForm.ngayHen = new Date().toISOString().split('T')[0];
    }

    loadAppointments(): void {
        this.isLoading = true;
        this.customerService.getAppointments().subscribe({
            next: (data) => {
                this.appointments = data;
                this.isLoading = false;
            },
            error: (err) => {
                console.error('Error loading appointments:', err);
                this.isLoading = false;
            },
        });
    }

    loadPets(): void {
        this.customerService.getPets().subscribe({
            next: (pets) => {
                this.pets = pets;
                if (pets.length > 0) {
                    this.bookingForm.maThuCung = pets[0].maThuCung;
                }
            },
            error: (err) => console.error('Error loading pets:', err),
        });
    }

    loadDoctors(): void {
        this.customerService.getDoctors().subscribe({
            next: (docs) => {
                this.doctors = docs;
            },
            error: (err) => console.error('Error loading doctors:', err),
        });
    }

    loadAvailableSlots(): void {
        if (this.bookingForm.maBacSi && this.bookingForm.ngayHen) {
            this.customerService.getAvailableSlots(this.bookingForm.maBacSi, this.bookingForm.ngayHen).subscribe({
                next: (slots) => {
                    this.availableSlots = slots;
                    if (slots.length > 0) {
                        this.bookingForm.gioHen = slots[0];
                    }
                },
                error: (err) => {
                    console.error('Error loading slots:', err);
                    this.availableSlots = [];
                },
            });
        }
    }

    loadBranches(): void {
        this.customerService.getBranches().subscribe({
            next: (branches) => {
                this.branches = branches;
                if (branches.length > 0) {
                    this.bookingForm.maChiNhanh = branches[0].maChiNhanh;
                    this.onBranchChange();
                }
            },
            error: (err) => console.error('Error loading branches:', err),
        });
    }

    onBranchChange(): void {
        if (this.bookingForm.maChiNhanh) {
            this.customerService.getBranchServices(this.bookingForm.maChiNhanh).subscribe({
                next: (services) => {
                    this.services = services;
                    if (services.length > 0) {
                        this.bookingForm.maDichVu = services[0].maDichVu;
                    } else {
                        this.bookingForm.maDichVu = '';
                    }
                },
                error: (err) => {
                    console.error('Error loading services:', err);
                    this.services = [];
                    this.bookingForm.maDichVu = '';
                },
            });
        } else {
            this.services = [];
            this.bookingForm.maDichVu = '';
        }
    }

    onDateOrDoctorChange(): void {
        this.loadAvailableSlots();
    }

    openBookingForm(): void {
        this.showBookingForm = true;
        this.loadAvailableSlots();
    }

    closeBookingForm(): void {
        this.showBookingForm = false;
    }

    bookAppointment(): void {
        if (!this.bookingForm.maThuCung || !this.bookingForm.maChiNhanh || !this.bookingForm.maDichVu || !this.bookingForm.ngayHen || !this.bookingForm.gioBatDau) {
            this.notificationService.warning('Vui lòng điền đầy đủ thông tin');
            return;
        }

        // Set gioHen for backward compatibility
        this.bookingForm.gioHen = this.bookingForm.gioBatDau;

        this.isBooking = true;
        this.customerService.bookAppointment(this.bookingForm).subscribe({
            next: () => {
                this.closeBookingForm();
                this.loadAppointments();
                this.isBooking = false;
                this.notificationService.success('Đặt lịch thành công!');
            },
            error: (err) => {
                console.error('Error booking:', err);
                this.notificationService.error('Không thể đặt lịch. Vui lòng thử lại.');
                this.isBooking = false;
            },
        });
    }

    onStartTimeChange(): void {
        if (this.bookingForm.gioBatDau && !this.bookingForm.gioKetThuc) {
            // Auto-calculate end time (start time + 20 minutes)
            const [hours, minutes] = this.bookingForm.gioBatDau.split(':').map(Number);
            const endDate = new Date();
            endDate.setHours(hours, minutes + 20, 0, 0);
            this.bookingForm.gioKetThuc = endDate.toTimeString().slice(0, 5);
        }
    }

    cancelAppointment(apt: CustomerAppointment): void {
        if (!confirm('Bạn có chắc muốn hủy lịch hẹn này?')) return;

        this.customerService.cancelAppointment(apt.maLichHen).subscribe({
            next: () => {
                this.loadAppointments();
            },
            error: (err) => console.error('Error cancelling:', err),
        });
    }

    formatDate(date: Date | string): string {
        return new Date(date).toLocaleDateString('vi-VN');
    }

    formatTimeRange(apt: CustomerAppointment): string {
        // Show time range if available, otherwise fall back to single time
        if (apt.gioBatDau && apt.gioKetThuc) {
            return `${apt.gioBatDau} - ${apt.gioKetThuc}`;
        }
        return apt.gioHen || '';
    }

    getStatusClass(status: string): string {
        switch (status) {
            case 'Đã hoàn thành': return 'completed';
            case 'Chờ xác nhận': return 'pending';
            case 'Đã xác nhận': return 'confirmed';
            case 'Đã hủy': return 'cancelled';
            default: return 'waiting';
        }
    }

    getUpcoming(): CustomerAppointment[] {
        return this.appointments.filter(a => a.trangThai !== 'Đã hoàn thành' && a.trangThai !== 'Đã hủy');
    }

    getPast(): CustomerAppointment[] {
        return this.appointments.filter(a => a.trangThai === 'Đã hoàn thành' || a.trangThai === 'Đã hủy');
    }
}
