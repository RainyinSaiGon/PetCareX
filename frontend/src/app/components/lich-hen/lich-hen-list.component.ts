import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LichHenService } from '../../services/lich-hen.service';
import { KhachHangService } from '../../services/khach-hang.service';
import { NhanVienService } from '../../services/nhan-vien.service';
import { ChiNhanhService } from '../../services/chi-nhanh.service';
import { LichHen, CreateLichHenDto } from '../../models/lich-hen.model';

@Component({
  selector: 'app-lich-hen-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="page-container">
      <!-- Header -->
      <div class="page-header">
        <div class="header-left">
          <h2>Quản lý lịch hẹn</h2>
          <p class="subtitle">Đặt lịch và quản lý các cuộc hẹn</p>
        </div>
        <button class="btn-primary" (click)="showCreateModal = true">
          + Đặt lịch mới
        </button>
      </div>

      <!-- Filters -->
      <div class="filter-bar">
        <div class="filter-group">
          <label>Ngày:</label>
          <input type="date" [(ngModel)]="filterDate" (change)="applyFilters()" />
        </div>
        <div class="filter-group">
          <label>Trạng thái:</label>
          <select [(ngModel)]="filterStatus" (change)="applyFilters()">
            <option value="">Tất cả</option>
            <option value="Chờ xác nhận">Chờ xác nhận</option>
            <option value="Đã xác nhận">Đã xác nhận</option>
            <option value="Hoàn thành">Hoàn thành</option>
            <option value="Đã hủy">Đã hủy</option>
          </select>
        </div>
        <button class="btn-reset" (click)="resetFilters()">Đặt lại</button>
      </div>

      <!-- Stats -->
      <div class="stats-row">
        <div class="stat-item pending">
          <span class="stat-count">{{ countByStatus('Chờ xác nhận') }}</span>
          <span class="stat-label">Chờ xác nhận</span>
        </div>
        <div class="stat-item confirmed">
          <span class="stat-count">{{ countByStatus('Đã xác nhận') }}</span>
          <span class="stat-label">Đã xác nhận</span>
        </div>
        <div class="stat-item completed">
          <span class="stat-count">{{ countByStatus('Hoàn thành') }}</span>
          <span class="stat-label">Hoàn thành</span>
        </div>
        <div class="stat-item cancelled">
          <span class="stat-count">{{ countByStatus('Đã hủy') }}</span>
          <span class="stat-label">Đã hủy</span>
        </div>
      </div>

      <!-- Loading -->
      @if (loading()) {
        <div class="loading-container">
          <div class="spinner"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      } @else {
        <!-- Appointments List -->
        <div class="appointments-list">
          @for (apt of filteredAppointments(); track apt.maLichHen) {
            <div class="appointment-card" [class]="apt.trangThai | lowercase">
              <div class="appointment-date">
                <span class="day">{{ apt.ngayHen | date:'dd' }}</span>
                <span class="month">{{ apt.ngayHen | date:'MMM' }}</span>
                <span class="time">{{ apt.ngayHen | date:'HH:mm' }}</span>
              </div>
              <div class="appointment-info">
                <div class="info-row">
                  <span class="customer-name">KH: {{ apt.khachHang?.hoTen || 'N/A' }}</span>
                  <span class="customer-phone">SĐT: {{ apt.khachHang?.soDienThoai || 'N/A' }}</span>
                </div>
                <div class="info-row">
                  <span class="pet-name">TC: {{ apt.thuCung?.tenThuCung || 'N/A' }}</span>
                  <span class="doctor-name">BS: {{ apt.bacSi?.hoTen || 'Chưa phân công' }}</span>
                </div>
                @if (apt.ghiChu) {
                  <div class="note">Ghi chú: {{ apt.ghiChu }}</div>
                }
              </div>
              <div class="appointment-status">
                <span class="status-badge" [class]="getStatusClass(apt.trangThai)">
                  {{ apt.trangThai }}
                </span>
              </div>
              <div class="appointment-actions">
                @if (apt.trangThai === 'Chờ xác nhận') {
                  <button class="btn-action confirm" (click)="confirmAppointment(apt)" title="Xác nhận">OK</button>
                  <button class="btn-action cancel" (click)="cancelAppointment(apt)" title="Hủy">Hủy</button>
                }
                @if (apt.trangThai === 'Đã xác nhận') {
                  <button class="btn-action complete" (click)="completeAppointment(apt)" title="Hoàn thành">HT</button>
                  <button class="btn-action cancel" (click)="cancelAppointment(apt)" title="Hủy">Hủy</button>
                }
                <button class="btn-action edit" (click)="editAppointment(apt)" title="Sửa">Sửa</button>
              </div>
            </div>
          } @empty {
            <div class="empty-state">
              <p>Không có lịch hẹn nào</p>
            </div>
          }
        </div>
      }

      <!-- Create/Edit Modal -->
      @if (showCreateModal || showEditModal) {
        <div class="modal-overlay" (click)="closeModals()">
          <div class="modal" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h3>{{ showEditModal ? 'Cập nhật lịch hẹn' : 'Đặt lịch hẹn mới' }}</h3>
              <button class="btn-close" (click)="closeModals()">×</button>
            </div>
            <div class="modal-body">
              <div class="form-group">
                <label>Mã lịch hẹn <span class="required">*</span></label>
                <input type="text" [(ngModel)]="formData.maLichHen" placeholder="VD: LH0001" [disabled]="showEditModal" />
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Ngày hẹn <span class="required">*</span></label>
                  <input type="datetime-local" [(ngModel)]="formData.ngayHen" />
                </div>
                <div class="form-group">
                  <label>Trạng thái</label>
                  <select [(ngModel)]="formData.trangThai">
                    <option value="Chờ xác nhận">Chờ xác nhận</option>
                    <option value="Đã xác nhận">Đã xác nhận</option>
                    <option value="Hoàn thành">Hoàn thành</option>
                    <option value="Đã hủy">Đã hủy</option>
                  </select>
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Mã khách hàng <span class="required">*</span></label>
                  <input type="number" [(ngModel)]="formData.maKhachHang" placeholder="Nhập mã KH" />
                </div>
                <div class="form-group">
                  <label>Mã thú cưng <span class="required">*</span></label>
                  <input type="number" [(ngModel)]="formData.maThuCung" placeholder="Nhập mã thú cưng" />
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Bác sĩ phụ trách</label>
                  <select [(ngModel)]="formData.maBacSi">
                    <option value="">Chọn bác sĩ</option>
                    @for (bs of doctors(); track bs.maNhanVien) {
                      <option [value]="bs.maNhanVien">{{ bs.hoTen }}</option>
                    }
                  </select>
                </div>
                <div class="form-group">
                  <label>Chi nhánh</label>
                  <select [(ngModel)]="formData.maChiNhanh">
                    <option value="">Chọn chi nhánh</option>
                    @for (cn of branches(); track cn.maChiNhanh) {
                      <option [value]="cn.maChiNhanh">{{ cn.tenChiNhanh }}</option>
                    }
                  </select>
                </div>
              </div>
              <div class="form-group">
                <label>Ghi chú</label>
                <textarea [(ngModel)]="formData.ghiChu" rows="3" placeholder="Nhập ghi chú..."></textarea>
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn-secondary" (click)="closeModals()">Hủy</button>
              <button class="btn-primary" (click)="saveAppointment()" [disabled]="saving()">
                {{ saving() ? 'Đang lưu...' : (showEditModal ? 'Cập nhật' : 'Đặt lịch') }}
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .page-container {
      animation: fadeIn 0.3s ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .page-header h2 {
      margin: 0;
      font-size: 24px;
      color: #1a1f3c;
    }

    .subtitle {
      margin: 4px 0 0;
      color: #64748b;
      font-size: 14px;
    }

    .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
    }

    .btn-secondary {
      background: #f1f5f9;
      color: #64748b;
      border: none;
      padding: 12px 24px;
      border-radius: 10px;
      font-size: 14px;
      cursor: pointer;
    }

    /* Filter Bar */
    .filter-bar {
      background: white;
      padding: 16px 20px;
      border-radius: 12px;
      margin-bottom: 20px;
      display: flex;
      gap: 20px;
      align-items: center;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    }

    .filter-group {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .filter-group label {
      font-size: 14px;
      color: #64748b;
    }

    .filter-group input,
    .filter-group select {
      padding: 10px 14px;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      font-size: 14px;
    }

    .btn-reset {
      margin-left: auto;
      padding: 10px 16px;
      border: none;
      background: #f1f5f9;
      border-radius: 8px;
      font-size: 14px;
      cursor: pointer;
    }

    /* Stats */
    .stats-row {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      margin-bottom: 24px;
    }

    .stat-item {
      background: white;
      padding: 16px 20px;
      border-radius: 12px;
      display: flex;
      flex-direction: column;
      align-items: center;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    }

    .stat-count {
      font-size: 28px;
      font-weight: 700;
    }

    .stat-label {
      font-size: 13px;
      color: #64748b;
      margin-top: 4px;
    }

    .stat-item.pending .stat-count { color: #f59e0b; }
    .stat-item.confirmed .stat-count { color: #3b82f6; }
    .stat-item.completed .stat-count { color: #10b981; }
    .stat-item.cancelled .stat-count { color: #ef4444; }

    /* Loading */
    .loading-container {
      text-align: center;
      padding: 60px;
      color: #64748b;
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid #e2e8f0;
      border-top-color: #667eea;
      border-radius: 50%;
      margin: 0 auto 16px;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* Appointments List */
    .appointments-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .appointment-card {
      background: white;
      border-radius: 12px;
      padding: 20px;
      display: flex;
      align-items: center;
      gap: 20px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
      border-left: 4px solid #e2e8f0;
      transition: transform 0.2s;
    }

    .appointment-card:hover {
      transform: translateX(4px);
    }

    .appointment-card.chờ.xác.nhận { border-left-color: #f59e0b; }
    .appointment-card.đã.xác.nhận { border-left-color: #3b82f6; }
    .appointment-card.hoàn.thành { border-left-color: #10b981; }
    .appointment-card.đã.hủy { border-left-color: #ef4444; }

    .appointment-date {
      display: flex;
      flex-direction: column;
      align-items: center;
      min-width: 70px;
      padding: 12px;
      background: #f8fafc;
      border-radius: 10px;
    }

    .appointment-date .day {
      font-size: 24px;
      font-weight: 700;
      color: #1a1f3c;
    }

    .appointment-date .month {
      font-size: 12px;
      color: #64748b;
      text-transform: uppercase;
    }

    .appointment-date .time {
      font-size: 14px;
      font-weight: 600;
      color: #667eea;
      margin-top: 4px;
    }

    .appointment-info {
      flex: 1;
    }

    .info-row {
      display: flex;
      gap: 20px;
      margin-bottom: 6px;
    }

    .info-row span {
      font-size: 14px;
      color: #374151;
    }

    .customer-name {
      font-weight: 500;
    }

    .note {
      font-size: 13px;
      color: #64748b;
      margin-top: 8px;
      padding: 8px 12px;
      background: #f8fafc;
      border-radius: 6px;
    }

    .appointment-status {
      min-width: 120px;
      text-align: center;
    }

    .status-badge {
      display: inline-block;
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 500;
    }

    .status-badge.pending { background: #fef3c7; color: #d97706; }
    .status-badge.confirmed { background: #dbeafe; color: #2563eb; }
    .status-badge.completed { background: #dcfce7; color: #16a34a; }
    .status-badge.cancelled { background: #fee2e2; color: #dc2626; }

    .appointment-actions {
      display: flex;
      gap: 8px;
    }

    .btn-action {
      width: 36px;
      height: 36px;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.2s;
    }

    .btn-action.confirm { background: #dcfce7; color: #16a34a; }
    .btn-action.confirm:hover { background: #16a34a; color: white; }
    .btn-action.complete { background: #dbeafe; color: #2563eb; }
    .btn-action.complete:hover { background: #2563eb; color: white; }
    .btn-action.cancel { background: #fee2e2; color: #dc2626; }
    .btn-action.cancel:hover { background: #dc2626; color: white; }
    .btn-action.edit { background: #f1f5f9; color: #64748b; }
    .btn-action.edit:hover { background: #e2e8f0; }

    .empty-state {
      text-align: center;
      padding: 60px;
      color: #94a3b8;
    }

    .empty-icon {
      font-size: 64px;
      display: block;
      margin-bottom: 16px;
    }

    /* Modal */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal {
      background: white;
      border-radius: 16px;
      width: 100%;
      max-width: 600px;
      max-height: 90vh;
      overflow-y: auto;
    }

    .modal-header {
      padding: 20px 24px;
      border-bottom: 1px solid #f1f5f9;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .modal-header h3 {
      margin: 0;
      font-size: 18px;
    }

    .btn-close {
      width: 32px;
      height: 32px;
      border: none;
      background: #f1f5f9;
      border-radius: 8px;
      cursor: pointer;
    }

    .modal-body {
      padding: 24px;
    }

    .modal-footer {
      padding: 16px 24px;
      border-top: 1px solid #f1f5f9;
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    }

    .form-group {
      margin-bottom: 20px;
    }

    .form-group label {
      display: block;
      font-size: 14px;
      font-weight: 500;
      margin-bottom: 8px;
    }

    .required { color: #ef4444; }

    .form-group input,
    .form-group select,
    .form-group textarea {
      width: 100%;
      padding: 12px 14px;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      font-size: 14px;
    }

    .form-group input:focus,
    .form-group select:focus,
    .form-group textarea:focus {
      outline: none;
      border-color: #667eea;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    @media (max-width: 768px) {
      .stats-row {
        grid-template-columns: repeat(2, 1fr);
      }

      .filter-bar {
        flex-wrap: wrap;
      }

      .appointment-card {
        flex-wrap: wrap;
      }

      .form-row {
        grid-template-columns: 1fr;
      }
    }
  `],
})
export class LichHenListComponent implements OnInit {
  private lichHenService = inject(LichHenService);
  private nhanVienService = inject(NhanVienService);
  private chiNhanhService = inject(ChiNhanhService);

  appointments = signal<LichHen[]>([]);
  filteredAppointments = signal<LichHen[]>([]);
  doctors = signal<any[]>([]);
  branches = signal<any[]>([]);
  loading = signal(true);
  saving = signal(false);

  filterDate = '';
  filterStatus = '';
  showCreateModal = false;
  showEditModal = false;
  selectedAppointment: LichHen | null = null;

  formData: CreateLichHenDto = {
    maLichHen: '',
    ngayHen: '',
    trangThai: 'Chờ xác nhận',
    ghiChu: '',
    maKhachHang: 0,
    maThuCung: 0,
    maBacSi: '',
    maChiNhanh: '',
  };

  ngOnInit() {
    this.loadAppointments();
    this.loadDoctors();
    this.loadBranches();
  }

  loadAppointments() {
    this.loading.set(true);
    this.lichHenService.getAll().subscribe({
      next: (data) => {
        this.appointments.set(data);
        this.filteredAppointments.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  loadDoctors() {
    this.nhanVienService.getAllBacSi().subscribe({
      next: (data) => this.doctors.set(data),
      error: () => {},
    });
  }

  loadBranches() {
    this.chiNhanhService.getAll().subscribe({
      next: (data) => this.branches.set(data),
      error: () => {},
    });
  }

  applyFilters() {
    let filtered = this.appointments();

    if (this.filterDate) {
      filtered = filtered.filter((apt) => {
        const aptDate = new Date(apt.ngayHen).toISOString().split('T')[0];
        return aptDate === this.filterDate;
      });
    }

    if (this.filterStatus) {
      filtered = filtered.filter((apt) => apt.trangThai === this.filterStatus);
    }

    this.filteredAppointments.set(filtered);
  }

  resetFilters() {
    this.filterDate = '';
    this.filterStatus = '';
    this.filteredAppointments.set(this.appointments());
  }

  countByStatus(status: string): number {
    return this.appointments().filter((apt) => apt.trangThai === status).length;
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      'Chờ xác nhận': 'pending',
      'Đã xác nhận': 'confirmed',
      'Hoàn thành': 'completed',
      'Đã hủy': 'cancelled',
    };
    return map[status] || '';
  }

  confirmAppointment(apt: LichHen) {
    this.lichHenService.confirm(apt.maLichHen).subscribe({
      next: () => this.loadAppointments(),
      error: (err) => alert('Lỗi: ' + err.message),
    });
  }

  completeAppointment(apt: LichHen) {
    this.lichHenService.complete(apt.maLichHen).subscribe({
      next: () => this.loadAppointments(),
      error: (err) => alert('Lỗi: ' + err.message),
    });
  }

  cancelAppointment(apt: LichHen) {
    if (confirm('Bạn có chắc muốn hủy lịch hẹn này?')) {
      this.lichHenService.cancel(apt.maLichHen).subscribe({
        next: () => this.loadAppointments(),
        error: (err) => alert('Lỗi: ' + err.message),
      });
    }
  }

  editAppointment(apt: LichHen) {
    this.selectedAppointment = apt;
    this.formData = {
      maLichHen: apt.maLichHen,
      ngayHen: new Date(apt.ngayHen).toISOString().slice(0, 16),
      trangThai: apt.trangThai,
      ghiChu: apt.ghiChu || '',
      maKhachHang: apt.maKhachHang,
      maThuCung: apt.maThuCung,
      maBacSi: apt.maBacSi || '',
      maChiNhanh: apt.maChiNhanh || '',
    };
    this.showEditModal = true;
  }

  saveAppointment() {
    if (!this.formData.maLichHen || !this.formData.ngayHen || !this.formData.maKhachHang || !this.formData.maThuCung) {
      alert('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    this.saving.set(true);

    if (this.showEditModal) {
      this.lichHenService.update(this.formData.maLichHen, this.formData).subscribe({
        next: () => {
          this.loadAppointments();
          this.closeModals();
          this.saving.set(false);
        },
        error: () => this.saving.set(false),
      });
    } else {
      this.lichHenService.create(this.formData).subscribe({
        next: () => {
          this.loadAppointments();
          this.closeModals();
          this.saving.set(false);
        },
        error: () => this.saving.set(false),
      });
    }
  }

  closeModals() {
    this.showCreateModal = false;
    this.showEditModal = false;
    this.selectedAppointment = null;
    this.formData = {
      maLichHen: '',
      ngayHen: '',
      trangThai: 'Chờ xác nhận',
      ghiChu: '',
      maKhachHang: 0,
      maThuCung: 0,
      maBacSi: '',
      maChiNhanh: '',
    };
  }
}
