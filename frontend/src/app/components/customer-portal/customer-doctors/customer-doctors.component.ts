import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CustomerPortalService, Doctor, DoctorSchedule } from '../../../services/customer-portal.service';

@Component({
    selector: 'app-customer-doctors',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './customer-doctors.component.html',
    styleUrls: ['./customer-doctors.component.css'],
})
export class CustomerDoctorsComponent implements OnInit {
    doctors: Doctor[] = [];
    selectedDoctor: Doctor | null = null;
    schedules: DoctorSchedule[] = [];
    isLoading = false;
    selectedDate = '';

    constructor(private customerService: CustomerPortalService) { }

    ngOnInit(): void {
        this.loadDoctors();
        this.selectedDate = new Date().toISOString().split('T')[0];
    }

    loadDoctors(): void {
        this.isLoading = true;
        this.customerService.getDoctors().subscribe({
            next: (docs) => {
                this.doctors = docs;
                this.isLoading = false;
            },
            error: (err) => {
                console.error('Error loading doctors:', err);
                this.isLoading = false;
            },
        });
    }

    selectDoctor(doc: Doctor): void {
        this.selectedDoctor = doc;
        this.loadSchedule();
    }

    loadSchedule(): void {
        if (!this.selectedDoctor) return;

        this.customerService.getDoctorSchedule(this.selectedDoctor.maNhanVien, this.selectedDate).subscribe({
            next: (schedules) => {
                this.schedules = schedules;
            },
            error: (err) => {
                console.error('Error loading schedule:', err);
                this.schedules = [];
            },
        });
    }

    onDateChange(): void {
        this.loadSchedule();
    }

    formatDate(date: Date | string): string {
        return new Date(date).toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' });
    }

    closeSchedule(): void {
        this.selectedDoctor = null;
        this.schedules = [];
    }
}
