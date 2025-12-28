import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AppointmentService, Appointment, CreateAppointmentDto, Doctor } from '../../services/appointment.service';
import { PetService } from '../../services/pet.service';
import { BranchService } from '../../services/branch.service';
import { NotificationService } from '../../services/notification.service';
import { ConfirmationService } from '../../services/confirmation.service';

@Component({
    selector: 'app-appointments',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './appointments.component.html',
    styleUrls: ['./appointments.component.css'],
})
export class AppointmentsComponent implements OnInit, OnDestroy {
    // List view state
    appointments: Appointment[] = [];
    calendarAppointments: Appointment[] = [];
    upcomingAppointments: Appointment[] = [];
    isLoading = false;
    selectedDate: string = '';
    statusFilter: string = '';
    viewMode: 'list' | 'calendar' = 'list';

    // Calendar state
    currentMonth: Date = new Date();
    calendarDays: { date: Date; isCurrentMonth: boolean; isToday: boolean; appointments: Appointment[] }[] = [];
    selectedCalendarDate: Date | null = null;

    // Doctors list
    doctors: Doctor[] = [];

    // Branches and services
    branches: any[] = [];
    services: any[] = [];

    // Walk-in form state
    showWalkInForm = false;
    walkInForm: any = {
        petId: null,
        selectedPet: null,
        maChiNhanh: '',
        maDichVu: '',
        ngayHen: '',
        gioBatDau: '',
        gioKetThuc: '',
        trangThai: 'Đang chờ',
        maBacSi: '',
        ghiChu: '',
    };
    searchedPets: any[] = [];
    isSearchingPets = false;
    isCreating = false;

    // Reminder notification
    showReminders = false;
    reminderInterval: any;

    // Status options
    statusOptions = ['Đã xác nhận', 'Đang chờ', 'Đã hoàn thành', 'Đã hủy'];

    constructor(
        private appointmentService: AppointmentService,
        private petService: PetService,
        private branchService: BranchService,
        private router: Router,
        private notificationService: NotificationService,
        private confirmationService: ConfirmationService,
    ) { }

    ngOnInit(): void {
        this.selectedDate = new Date().toISOString().split('T')[0];
        this.initWalkInForm();
        this.loadAppointments();
        this.loadDoctors();
        this.loadBranches();
        this.loadUpcomingAppointments();
        this.generateCalendar();

        // Set up reminder check every minute
        this.reminderInterval = setInterval(() => {
            this.loadUpcomingAppointments();
        }, 60000);
    }

    ngOnDestroy(): void {
        if (this.reminderInterval) {
            clearInterval(this.reminderInterval);
        }
    }

    // === DATA LOADING ===

    loadAppointments(): void {
        this.isLoading = true;
        const filters: any = {};
        if (this.selectedDate) filters.date = this.selectedDate;
        if (this.statusFilter) filters.status = this.statusFilter;

        this.appointmentService.getAppointments(filters).subscribe({
            next: (data) => {
                // Normalize status values - ensure all have valid status
                this.appointments = data.map(apt => ({
                    ...apt,
                    trangThai: apt.trangThai && this.statusOptions.includes(apt.trangThai)
                        ? apt.trangThai
                        : 'Đang chờ'
                }));
                this.isLoading = false;
            },
            error: (err) => {
                console.error('Error loading appointments:', err);
                this.isLoading = false;
            },
        });
    }

    loadDoctors(): void {
        this.appointmentService.getDoctors().subscribe({
            next: (doctors) => {
                this.doctors = doctors;
            },
            error: (err) => {
                console.error('Error loading doctors:', err);
            },
        });
    }

    loadUpcomingAppointments(): void {
        this.appointmentService.getUpcomingAppointments().subscribe({
            next: (data) => {
                this.upcomingAppointments = data;
                // Show reminder notification if there are urgent appointments
                if (data.some((a) => a.isUrgent)) {
                    this.showReminders = true;
                }
            },
            error: (err) => {
                console.error('Error loading upcoming:', err);
            },
        });
    }

    loadCalendarAppointments(): void {
        const month = `${this.currentMonth.getFullYear()}-${String(this.currentMonth.getMonth() + 1).padStart(2, '0')}`;
        this.appointmentService.getAppointments({ month }).subscribe({
            next: (data) => {
                this.calendarAppointments = data;
                this.generateCalendar();
            },
            error: (err) => {
                console.error('Error loading calendar:', err);
            },
        });
    }

    // === CALENDAR VIEW ===

    generateCalendar(): void {
        const year = this.currentMonth.getFullYear();
        const month = this.currentMonth.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        this.calendarDays = [];

        // Add days from previous month
        const firstDayOfWeek = firstDay.getDay();
        for (let i = firstDayOfWeek - 1; i >= 0; i--) {
            const date = new Date(year, month, -i);
            this.calendarDays.push({
                date,
                isCurrentMonth: false,
                isToday: date.getTime() === today.getTime(),
                appointments: this.getAppointmentsForDate(date),
            });
        }

        // Add days of current month
        for (let day = 1; day <= lastDay.getDate(); day++) {
            const date = new Date(year, month, day);
            this.calendarDays.push({
                date,
                isCurrentMonth: true,
                isToday: date.getTime() === today.getTime(),
                appointments: this.getAppointmentsForDate(date),
            });
        }

        // Add days from next month to complete the grid
        const remainingDays = 42 - this.calendarDays.length;
        for (let i = 1; i <= remainingDays; i++) {
            const date = new Date(year, month + 1, i);
            this.calendarDays.push({
                date,
                isCurrentMonth: false,
                isToday: date.getTime() === today.getTime(),
                appointments: this.getAppointmentsForDate(date),
            });
        }
    }

    getAppointmentsForDate(date: Date): Appointment[] {
        const dateStr = date.toISOString().split('T')[0];
        return this.calendarAppointments.filter((a) => {
            const apptDate = new Date(a.ngayHen).toISOString().split('T')[0];
            return apptDate === dateStr;
        });
    }

    prevMonth(): void {
        this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() - 1, 1);
        this.loadCalendarAppointments();
    }

    nextMonth(): void {
        this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + 1, 1);
        this.loadCalendarAppointments();
    }

    selectCalendarDate(day: { date: Date; appointments: Appointment[] }): void {
        this.selectedCalendarDate = day.date;
        this.selectedDate = day.date.toISOString().split('T')[0];
        this.loadAppointments();
    }

    switchToListView(): void {
        this.viewMode = 'list';
        this.loadAppointments();
    }

    switchToCalendarView(): void {
        this.viewMode = 'calendar';
        this.loadCalendarAppointments();
    }

    // === PET SEARCH ===

    searchPets(): void {
        const query = this.walkInForm.petSearchQuery.trim();
        console.log('searchPets called with query:', query);

        if (!query || query.length < 2) {
            console.log('Query too short, clearing results');
            this.searchedPets = [];
            return;
        }

        this.isSearchingPets = true;
        console.log('Calling petService.searchPets...');

        this.petService.searchPets(query).subscribe({
            next: (pets: any[]) => {
                console.log('searchPets response:', pets);
                this.searchedPets = pets;
                this.isSearchingPets = false;
            },
            error: (err) => {
                console.error('searchPets error:', err);
                this.searchedPets = [];
                this.isSearchingPets = false;
            },
        });
    }

    selectPet(pet: any): void {
        this.walkInForm.selectedPet = pet;
        this.walkInForm.petId = pet.MaThuCung;
        this.searchedPets = [];
    }

    clearPetSelection(): void {
        this.walkInForm.selectedPet = null;
        this.walkInForm.petId = null;
    }

    lookupPetById(): void {
        if (!this.walkInForm.petId) {
            this.notificationService.warning('Vui lòng nhập mã thú cưng');
            return;
        }

        this.isSearchingPets = true;
        this.petService.getPetById(this.walkInForm.petId).subscribe({
            next: (pet: any) => {
                console.log('Pet found:', pet);
                this.walkInForm.selectedPet = pet;
                this.isSearchingPets = false;
            },
            error: (err) => {
                console.error('Pet lookup error:', err);
                this.notificationService.error('Không tìm thấy thú cưng với mã này');
                this.isSearchingPets = false;
            },
        });
    }

    // === WALK-IN FORM ===

    initWalkInForm(): void {
        const now = new Date();
        const currentTime = now.toTimeString().slice(0, 5);
        this.walkInForm = {
            petId: null,
            selectedPet: null,
            maChiNhanh: '',
            maDichVu: '',
            ngayHen: now.toISOString().split('T')[0],
            gioBatDau: currentTime,
            gioKetThuc: this.calculateEndTime(currentTime),
            trangThai: 'Đang chờ',
            maBacSi: '',
            ghiChu: '',
        };
    }

    openWalkInForm(date?: Date): void {
        this.showWalkInForm = true;
        const targetDate = date || new Date();
        const currentTime = new Date().toTimeString().slice(0, 5);
        this.walkInForm = {
            petId: null,
            selectedPet: null,
            maChiNhanh: '',
            maDichVu: '',
            ngayHen: targetDate.toISOString().split('T')[0],
            gioBatDau: currentTime,
            gioKetThuc: this.calculateEndTime(currentTime),
            trangThai: 'Đang chờ',
            maBacSi: '',
            ghiChu: '',
        };
        this.services = [];
    }

    closeWalkInForm(): void {
        this.showWalkInForm = false;
        this.clearPetSelection();
    }

    createWalkInAppointment(): void {
        if (!this.walkInForm.selectedPet) {
            this.notificationService.warning('Vui lòng chọn thú cưng');
            return;
        }

        this.isCreating = true;
        const dto: CreateAppointmentDto = {
            maKhachHang: this.walkInForm.selectedPet.MaKhachHang,
            maThuCung: this.walkInForm.selectedPet.MaThuCung,
            maChiNhanh: this.walkInForm.maChiNhanh || undefined,
            maDichVu: this.walkInForm.maDichVu || undefined,
            ngayHen: this.walkInForm.ngayHen,
            gioHen: this.walkInForm.gioBatDau,
            gioBatDau: this.walkInForm.gioBatDau,
            gioKetThuc: this.walkInForm.gioKetThuc,
            trangThai: this.walkInForm.trangThai,
            maBacSi: this.walkInForm.maBacSi || undefined,
            ghiChu: this.walkInForm.ghiChu || undefined,
        };

        this.appointmentService.createAppointment(dto).subscribe({
            next: () => {
                this.closeWalkInForm();
                this.loadAppointments();
                if (this.viewMode === 'calendar') {
                    this.loadCalendarAppointments();
                }
                this.loadUpcomingAppointments();
                this.isCreating = false;
                this.notificationService.success('Tạo lịch hẹn thành công');
            },
            error: (err) => {
                console.error('Error creating appointment:', err);
                this.notificationService.error('Không thể tạo lịch hẹn');
                this.isCreating = false;
            },
        });
    }

    // === BRANCH & SERVICE ===

    loadBranches(): void {
        this.appointmentService.getBranches().subscribe({
            next: (data) => {
                this.branches = data;
            },
            error: (err) => {
                console.error('Error loading branches:', err);
            },
        });
    }

    loadServices(maChiNhanh: string): void {
        if (!maChiNhanh) {
            this.services = [];
            return;
        }
        this.appointmentService.getServices(maChiNhanh).subscribe({
            next: (data) => {
                this.services = data || [];
            },
            error: (err) => {
                console.error('Error loading services:', err);
                this.services = [];
            },
        });
    }

    onBranchChange(): void {
        this.walkInForm.maDichVu = '';
        this.loadServices(this.walkInForm.maChiNhanh);
    }

    calculateEndTime(startTime: string): string {
        if (!startTime) return '';
        const [hours, minutes] = startTime.split(':').map(Number);
        const endMinutes = hours * 60 + minutes + 20;
        const endHours = Math.floor(endMinutes / 60) % 24;
        const endMins = endMinutes % 60;
        return `${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}`;
    }

    onStartTimeChange(): void {
        this.walkInForm.gioKetThuc = this.calculateEndTime(this.walkInForm.gioBatDau);
    }

    // === APPOINTMENT ACTIONS ===

    updateStatus(appointment: Appointment, newStatus: string): void {
        this.appointmentService.updateAppointment(appointment.maLichHen, { trangThai: newStatus }).subscribe({
            next: () => {
                this.loadAppointments();
                this.loadUpcomingAppointments();
            },
            error: (err) => {
                console.error('Error updating status:', err);
            },
        });
    }

    deleteAppointment(appointment: Appointment): void {
        this.confirmationService.confirm({
            title: 'Xóa lịch hẹn',
            message: `Bạn có chắc chắn muốn xóa lịch hẹn #${appointment.maLichHen}?`,
            confirmText: 'Xóa',
            cancelText: 'Hủy',
            type: 'danger'
        }).subscribe((confirmed) => {
            if (!confirmed) return;

            this.appointmentService.deleteAppointment(appointment.maLichHen).subscribe({
                next: () => {
                    this.loadAppointments();
                    if (this.viewMode === 'calendar') {
                        this.loadCalendarAppointments();
                    }
                    this.loadUpcomingAppointments();
                    this.notificationService.success(`Đã xóa lịch hẹn #${appointment.maLichHen}`);
                },
                error: (err) => {
                    console.error('Error deleting appointment:', err);
                    this.notificationService.error('Không thể xóa lịch hẹn');
                },
            });
        });
    }

    // === EXAMINATION LINK ===

    createExamination(appointment: Appointment): void {
        if (appointment.thuCung) {
            // Mark as completed first
            this.appointmentService.updateAppointment(appointment.maLichHen, { trangThai: 'Đã hoàn thành' }).subscribe({
                next: () => {
                    this.router.navigate(['/doctor/examinations/new', appointment.thuCung?.maThuCung]);
                },
                error: () => {
                    // Navigate anyway even if update fails
                    this.router.navigate(['/doctor/examinations/new', appointment.thuCung?.maThuCung]);
                },
            });
        }
    }

    // === REMINDERS ===

    toggleReminders(): void {
        this.showReminders = !this.showReminders;
    }

    dismissReminder(appointment: Appointment): void {
        this.upcomingAppointments = this.upcomingAppointments.filter((a) => a.maLichHen !== appointment.maLichHen);
    }

    // === HELPERS ===

    formatDate(date: string | Date): string {
        return new Date(date).toLocaleDateString('vi-VN');
    }

    formatMonthYear(): string {
        return this.currentMonth.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' });
    }

    getStatusClass(status: string): string {
        switch (status) {
            case 'Đã hoàn thành':
                return 'status-completed';
            case 'Đang chờ':
                return 'status-waiting';
            case 'Đã xác nhận':
                return 'status-confirmed';
            case 'Đã hủy':
                return 'status-cancelled';
            default:
                return 'status-pending';
        }
    }

    getUrgentCount(): number {
        return this.upcomingAppointments.filter((a) => a.isUrgent).length;
    }
}
