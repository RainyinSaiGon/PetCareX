import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { KhachHangService } from '../../services/khach-hang.service';
import { KhachHang } from '../../models/khach-hang.model';

@Component({
  selector: 'app-khach-hang-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="page-container">
      <!-- Header -->
      <div class="page-header">
        <div class="header-left">
          <h2>Danh sách khách hàng</h2>
          <p class="subtitle">Quản lý thông tin khách hàng</p>
        </div>
        <button class="btn-primary" (click)="showCreateModal = true">
          ➕ Thêm khách hàng
        </button>
      </div>

      <!-- Search & Filter -->
      <div class="search-bar">
        <div class="search-input-wrapper">
          <span class="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Tìm kiếm theo tên hoặc số điện thoại..."
            [(ngModel)]="searchKeyword"
            (input)="onSearch()"
            class="search-input"
          />
        </div>
      </div>

      <!-- Loading -->
      @if (loading()) {
        <div class="loading-container">
          <div class="spinner"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      } @else {
        <!-- Customer Table -->
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Mã KH</th>
                <th>Họ tên</th>
                <th>Số điện thoại</th>
                <th>Email</th>
                <th>Địa chỉ</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              @for (kh of filteredCustomers(); track kh.maKhachHang) {
                <tr>
                  <td class="id-cell">{{ kh.maKhachHang }}</td>
                  <td class="name-cell">
                    <span class="avatar">{{ getInitials(kh.hoTen) }}</span>
                    {{ kh.hoTen }}
                  </td>
                  <td>📱 {{ kh.soDienThoai }}</td>
                  <td>{{ kh.email || '—' }}</td>
                  <td class="address-cell">{{ kh.diaChi || '—' }}</td>
                  <td class="actions-cell">
                    <button class="btn-icon" title="Xem chi tiết" (click)="viewCustomer(kh)">👁️</button>
                    <button class="btn-icon" title="Sửa" (click)="editCustomer(kh)">✏️</button>
                    <button class="btn-icon delete" title="Xóa" (click)="deleteCustomer(kh)">🗑️</button>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="6" class="empty-row">
                    <div class="empty-state">
                      <span class="empty-icon">📭</span>
                      <p>Không tìm thấy khách hàng nào</p>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="pagination">
          <span class="page-info">Hiển thị {{ filteredCustomers().length }} / {{ customers().length }} khách hàng</span>
        </div>
      }

      <!-- Create/Edit Modal -->
      @if (showCreateModal || showEditModal) {
        <div class="modal-overlay" (click)="closeModals()">
          <div class="modal" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h3>{{ showEditModal ? 'Cập nhật khách hàng' : 'Thêm khách hàng mới' }}</h3>
              <button class="btn-close" (click)="closeModals()">✕</button>
            </div>
            <div class="modal-body">
              <div class="form-group">
                <label>Họ tên <span class="required">*</span></label>
                <input type="text" [(ngModel)]="formData.hoTen" placeholder="Nhập họ tên" />
              </div>
              <div class="form-group">
                <label>Số điện thoại <span class="required">*</span></label>
                <input type="tel" [(ngModel)]="formData.soDienThoai" placeholder="Nhập số điện thoại" />
              </div>
              <div class="form-group">
                <label>Email</label>
                <input type="email" [(ngModel)]="formData.email" placeholder="Nhập email" />
              </div>
              <div class="form-group">
                <label>Địa chỉ</label>
                <input type="text" [(ngModel)]="formData.diaChi" placeholder="Nhập địa chỉ" />
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Ngày sinh</label>
                  <input type="date" [(ngModel)]="formData.ngaySinh" />
                </div>
                <div class="form-group">
                  <label>Giới tính</label>
                  <select [(ngModel)]="formData.gioiTinh">
                    <option value="">Chọn giới tính</option>
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn-secondary" (click)="closeModals()">Hủy</button>
              <button class="btn-primary" (click)="saveCustomer()" [disabled]="saving()">
                {{ saving() ? 'Đang lưu...' : (showEditModal ? 'Cập nhật' : 'Thêm mới') }}
              </button>
            </div>
          </div>
        </div>
      }

      <!-- View Modal -->
      @if (showViewModal && selectedCustomer) {
        <div class="modal-overlay" (click)="closeModals()">
          <div class="modal modal-lg" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h3>Chi tiết khách hàng</h3>
              <button class="btn-close" (click)="closeModals()">✕</button>
            </div>
            <div class="modal-body">
              <div class="customer-detail">
                <div class="detail-header">
                  <div class="customer-avatar-lg">{{ getInitials(selectedCustomer.hoTen) }}</div>
                  <div class="customer-info-main">
                    <h4>{{ selectedCustomer.hoTen }}</h4>
                    <p>Mã KH: #{{ selectedCustomer.maKhachHang }}</p>
                  </div>
                </div>
                <div class="detail-grid">
                  <div class="detail-item">
                    <span class="label">📱 Số điện thoại</span>
                    <span class="value">{{ selectedCustomer.soDienThoai }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="label">📧 Email</span>
                    <span class="value">{{ selectedCustomer.email || '—' }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="label">📍 Địa chỉ</span>
                    <span class="value">{{ selectedCustomer.diaChi || '—' }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="label">🎂 Ngày sinh</span>
                    <span class="value">{{ selectedCustomer.ngaySinh ? (selectedCustomer.ngaySinh | date:'dd/MM/yyyy') : '—' }}</span>
                  </div>
                </div>
              </div>

              <!-- Customer Pets -->
              <div class="section-title">🐾 Thú cưng</div>
              @if (customerPets().length === 0) {
                <div class="empty-state small">
                  <p>Chưa có thú cưng nào</p>
                </div>
              } @else {
                <div class="pets-grid">
                  @for (pet of customerPets(); track pet.maThuCung) {
                    <div class="pet-card">
                      <span class="pet-icon">🐕</span>
                      <div class="pet-info">
                        <span class="pet-name">{{ pet.tenThuCung }}</span>
                        <span class="pet-type">{{ pet.chungLoai?.tenChungLoai || 'N/A' }}</span>
                      </div>
                    </div>
                  }
                </div>
              }
            </div>
            <div class="modal-footer">
              <button class="btn-secondary" (click)="closeModals()">Đóng</button>
              <a [routerLink]="['/thu-cung']" [queryParams]="{khachHang: selectedCustomer.maKhachHang}" class="btn-primary">
                Xem thú cưng
              </a>
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
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
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
      transition: transform 0.2s, box-shadow 0.2s;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
    }

    .btn-primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }

    .btn-secondary {
      background: #f1f5f9;
      color: #64748b;
      border: none;
      padding: 12px 24px;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.2s;
    }

    .btn-secondary:hover {
      background: #e2e8f0;
    }

    /* Search Bar */
    .search-bar {
      background: white;
      padding: 16px 20px;
      border-radius: 12px;
      margin-bottom: 20px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    }

    .search-input-wrapper {
      position: relative;
      max-width: 400px;
    }

    .search-icon {
      position: absolute;
      left: 14px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 16px;
    }

    .search-input {
      width: 100%;
      padding: 12px 16px 12px 44px;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      font-size: 14px;
      transition: border-color 0.2s, box-shadow 0.2s;
    }

    .search-input:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    /* Loading */
    .loading-container {
      text-align: center;
      padding: 60px 20px;
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

    /* Table */
    .table-container {
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    }

    .data-table {
      width: 100%;
      border-collapse: collapse;
    }

    .data-table th {
      background: #f8fafc;
      padding: 14px 16px;
      text-align: left;
      font-size: 13px;
      font-weight: 600;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .data-table td {
      padding: 16px;
      border-top: 1px solid #f1f5f9;
      font-size: 14px;
      color: #1a1f3c;
    }

    .data-table tbody tr:hover {
      background: #f8fafc;
    }

    .id-cell {
      font-weight: 600;
      color: #667eea;
    }

    .name-cell {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 13px;
      font-weight: 600;
    }

    .address-cell {
      max-width: 200px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .actions-cell {
      display: flex;
      gap: 8px;
    }

    .btn-icon {
      width: 32px;
      height: 32px;
      border: none;
      background: #f1f5f9;
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
      transition: background 0.2s;
    }

    .btn-icon:hover {
      background: #e2e8f0;
    }

    .btn-icon.delete:hover {
      background: #fee2e2;
    }

    .empty-row td {
      padding: 60px 20px !important;
    }

    .empty-state {
      text-align: center;
      color: #94a3b8;
    }

    .empty-state.small {
      padding: 20px;
    }

    .empty-icon {
      font-size: 48px;
      display: block;
      margin-bottom: 12px;
    }

    /* Pagination */
    .pagination {
      padding: 16px 20px;
      background: white;
      border-radius: 0 0 12px 12px;
      border-top: 1px solid #f1f5f9;
    }

    .page-info {
      font-size: 13px;
      color: #64748b;
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
      animation: fadeIn 0.2s ease;
    }

    .modal {
      background: white;
      border-radius: 16px;
      width: 100%;
      max-width: 500px;
      max-height: 90vh;
      overflow-y: auto;
      animation: slideUp 0.3s ease;
    }

    .modal-lg {
      max-width: 700px;
    }

    @keyframes slideUp {
      from { transform: translateY(20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
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
      color: #1a1f3c;
    }

    .btn-close {
      width: 32px;
      height: 32px;
      border: none;
      background: #f1f5f9;
      border-radius: 8px;
      cursor: pointer;
      font-size: 16px;
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

    /* Form */
    .form-group {
      margin-bottom: 20px;
    }

    .form-group label {
      display: block;
      font-size: 14px;
      font-weight: 500;
      color: #374151;
      margin-bottom: 8px;
    }

    .required {
      color: #ef4444;
    }

    .form-group input,
    .form-group select {
      width: 100%;
      padding: 12px 14px;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      font-size: 14px;
      transition: border-color 0.2s, box-shadow 0.2s;
    }

    .form-group input:focus,
    .form-group select:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    /* Customer Detail */
    .customer-detail {
      margin-bottom: 24px;
    }

    .detail-header {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 24px;
    }

    .customer-avatar-lg {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      font-weight: 600;
    }

    .customer-info-main h4 {
      margin: 0 0 4px;
      font-size: 20px;
      color: #1a1f3c;
    }

    .customer-info-main p {
      margin: 0;
      color: #64748b;
      font-size: 14px;
    }

    .detail-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .detail-item {
      background: #f8fafc;
      padding: 16px;
      border-radius: 10px;
    }

    .detail-item .label {
      display: block;
      font-size: 13px;
      color: #64748b;
      margin-bottom: 4px;
    }

    .detail-item .value {
      font-size: 15px;
      color: #1a1f3c;
      font-weight: 500;
    }

    .section-title {
      font-size: 16px;
      font-weight: 600;
      color: #1a1f3c;
      margin-bottom: 16px;
    }

    .pets-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 12px;
    }

    .pet-card {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      background: #f8fafc;
      border-radius: 10px;
    }

    .pet-icon {
      font-size: 24px;
    }

    .pet-info {
      display: flex;
      flex-direction: column;
    }

    .pet-name {
      font-weight: 500;
      color: #1a1f3c;
    }

    .pet-type {
      font-size: 12px;
      color: #64748b;
    }
  `],
})
export class KhachHangListComponent implements OnInit {
  private khachHangService = inject(KhachHangService);

  customers = signal<KhachHang[]>([]);
  filteredCustomers = signal<KhachHang[]>([]);
  customerPets = signal<any[]>([]);
  loading = signal(true);
  saving = signal(false);

  searchKeyword = '';
  showCreateModal = false;
  showEditModal = false;
  showViewModal = false;
  selectedCustomer: KhachHang | null = null;

  formData = {
    hoTen: '',
    soDienThoai: '',
    email: '',
    diaChi: '',
    ngaySinh: '',
    gioiTinh: '',
  };

  ngOnInit() {
    this.loadCustomers();
  }

  loadCustomers() {
    this.loading.set(true);
    this.khachHangService.getAll().subscribe({
      next: (data) => {
        this.customers.set(data);
        this.filteredCustomers.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  onSearch() {
    const keyword = this.searchKeyword.toLowerCase();
    if (!keyword) {
      this.filteredCustomers.set(this.customers());
      return;
    }
    const filtered = this.customers().filter(
      (kh) =>
        kh.hoTen.toLowerCase().includes(keyword) ||
        kh.soDienThoai.includes(keyword)
    );
    this.filteredCustomers.set(filtered);
  }

  getInitials(name: string): string {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return parts[0][0] + parts[parts.length - 1][0];
    }
    return name.substring(0, 2).toUpperCase();
  }

  viewCustomer(kh: KhachHang) {
    this.selectedCustomer = kh;
    this.showViewModal = true;
    this.loadCustomerPets(kh.maKhachHang);
  }

  loadCustomerPets(maKhachHang: number) {
    this.khachHangService.getPets(maKhachHang).subscribe({
      next: (pets) => this.customerPets.set(pets),
      error: () => this.customerPets.set([]),
    });
  }

  editCustomer(kh: KhachHang) {
    this.selectedCustomer = kh;
    this.formData = {
      hoTen: kh.hoTen,
      soDienThoai: kh.soDienThoai,
      email: kh.email || '',
      diaChi: kh.diaChi || '',
      ngaySinh: kh.ngaySinh ? new Date(kh.ngaySinh).toISOString().split('T')[0] : '',
      gioiTinh: kh.gioiTinh || '',
    };
    this.showEditModal = true;
  }

  deleteCustomer(kh: KhachHang) {
    if (confirm(`Bạn có chắc muốn xóa khách hàng "${kh.hoTen}"?`)) {
      this.khachHangService.delete(kh.maKhachHang).subscribe({
        next: () => this.loadCustomers(),
        error: (err) => alert('Lỗi: ' + err.message),
      });
    }
  }

  saveCustomer() {
    if (!this.formData.hoTen || !this.formData.soDienThoai) {
      alert('Vui lòng nhập họ tên và số điện thoại');
      return;
    }

    this.saving.set(true);

    if (this.showEditModal && this.selectedCustomer) {
      this.khachHangService
        .update(this.selectedCustomer.maKhachHang, this.formData)
        .subscribe({
          next: () => {
            this.loadCustomers();
            this.closeModals();
            this.saving.set(false);
          },
          error: () => this.saving.set(false),
        });
    } else {
      this.khachHangService.create(this.formData).subscribe({
        next: () => {
          this.loadCustomers();
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
    this.showViewModal = false;
    this.selectedCustomer = null;
    this.customerPets.set([]);
    this.formData = {
      hoTen: '',
      soDienThoai: '',
      email: '',
      diaChi: '',
      ngaySinh: '',
      gioiTinh: '',
    };
  }
}
