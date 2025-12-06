import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HoaDonService } from '../../services/hoa-don.service';
import { HoaDon, CreateHoaDonDto } from '../../models/hoa-don.model';

@Component({
  selector: 'app-hoa-don-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="page-container">
      <!-- Header -->
      <div class="page-header">
        <div class="header-left">
          <h2>📄 Quản lý hóa đơn</h2>
          <p class="subtitle">Xem và quản lý các hóa đơn</p>
        </div>
        <button class="btn-primary" (click)="showCreateModal = true">
          ➕ Tạo hóa đơn
        </button>
      </div>

      <!-- Filter & Stats -->
      <div class="filter-stats">
        <div class="filter-bar">
          <div class="filter-group">
            <label>Từ ngày:</label>
            <input type="date" [(ngModel)]="filterStartDate" (change)="applyFilters()" />
          </div>
          <div class="filter-group">
            <label>Đến ngày:</label>
            <input type="date" [(ngModel)]="filterEndDate" (change)="applyFilters()" />
          </div>
          <button class="btn-reset" (click)="resetFilters()">🔄 Đặt lại</button>
        </div>
        <div class="stats-summary">
          <div class="stat">
            <span class="stat-label">Tổng hóa đơn:</span>
            <span class="stat-value">{{ filteredInvoices().length }}</span>
          </div>
          <div class="stat">
            <span class="stat-label">Tổng doanh thu:</span>
            <span class="stat-value revenue">{{ formatCurrency(totalRevenue()) }}</span>
          </div>
        </div>
      </div>

      <!-- Loading -->
      @if (loading()) {
        <div class="loading-container">
          <div class="spinner"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      } @else {
        <!-- Invoices Table -->
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Mã HĐ</th>
                <th>Ngày lập</th>
                <th>Khách hàng</th>
                <th>Nhân viên</th>
                <th>Giảm giá</th>
                <th>Tổng tiền</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              @for (inv of filteredInvoices(); track inv.maHoaDon) {
                <tr>
                  <td class="id-cell">#{{ inv.maHoaDon }}</td>
                  <td>{{ inv.ngayLap | date:'dd/MM/yyyy HH:mm' }}</td>
                  <td>{{ inv.khachHang?.hoTen || 'N/A' }}</td>
                  <td>{{ inv.nhanVien?.hoTen || 'N/A' }}</td>
                  <td>{{ formatCurrency(inv.giamGia || 0) }}</td>
                  <td class="amount-cell">{{ formatCurrency(inv.tongTien) }}</td>
                  <td class="actions-cell">
                    <button class="btn-icon" title="Xem chi tiết" (click)="viewInvoice(inv)">👁️</button>
                    <button class="btn-icon" title="In hóa đơn" (click)="printInvoice(inv)">🖨️</button>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="7" class="empty-row">
                    <div class="empty-state">
                      <span class="empty-icon">📄</span>
                      <p>Không có hóa đơn nào</p>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }

      <!-- Create Modal -->
      @if (showCreateModal) {
        <div class="modal-overlay" (click)="closeModals()">
          <div class="modal modal-lg" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h3>Tạo hóa đơn mới</h3>
              <button class="btn-close" (click)="closeModals()">✕</button>
            </div>
            <div class="modal-body">
              <div class="form-row">
                <div class="form-group">
                  <label>Mã khách hàng <span class="required">*</span></label>
                  <input type="number" [(ngModel)]="createForm.maKhachHang" placeholder="Nhập mã KH" />
                </div>
                <div class="form-group">
                  <label>Mã nhân viên <span class="required">*</span></label>
                  <input type="text" [(ngModel)]="createForm.maNhanVien" placeholder="VD: NV001" />
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Ngày lập</label>
                  <input type="datetime-local" [(ngModel)]="createForm.ngayLap" />
                </div>
                <div class="form-group">
                  <label>Giảm giá</label>
                  <input type="number" [(ngModel)]="createForm.giamGia" placeholder="0" />
                </div>
              </div>

              <!-- Products Section -->
              <div class="section">
                <h4>🛒 Sản phẩm</h4>
                <div class="items-list">
                  @for (item of createForm.sanPhams; track $index) {
                    <div class="item-row">
                      <input type="text" [(ngModel)]="item.maSanPham" placeholder="Mã SP" />
                      <input type="number" [(ngModel)]="item.soLuong" placeholder="SL" min="1" />
                      <input type="number" [(ngModel)]="item.donGia" placeholder="Đơn giá" />
                      <button class="btn-remove" (click)="removeProduct($index)">✕</button>
                    </div>
                  }
                  <button class="btn-add" (click)="addProduct()">+ Thêm sản phẩm</button>
                </div>
              </div>

              <!-- Services Section -->
              <div class="section">
                <h4>🏥 Dịch vụ y tế</h4>
                <div class="items-list">
                  @for (item of createForm.dichVuYTes; track $index) {
                    <div class="item-row">
                      <input type="text" [(ngModel)]="item.maDichVuYTe" placeholder="Mã DV" />
                      <input type="number" [(ngModel)]="item.soLuong" placeholder="SL" min="1" />
                      <input type="number" [(ngModel)]="item.donGia" placeholder="Đơn giá" />
                      <button class="btn-remove" (click)="removeService($index)">✕</button>
                    </div>
                  }
                  <button class="btn-add" (click)="addService()">+ Thêm dịch vụ</button>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn-secondary" (click)="closeModals()">Hủy</button>
              <button class="btn-primary" (click)="createInvoice()" [disabled]="saving()">
                {{ saving() ? 'Đang tạo...' : 'Tạo hóa đơn' }}
              </button>
            </div>
          </div>
        </div>
      }

      <!-- View Modal -->
      @if (showViewModal && selectedInvoice) {
        <div class="modal-overlay" (click)="closeModals()">
          <div class="modal modal-lg" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h3>Chi tiết hóa đơn #{{ selectedInvoice.maHoaDon }}</h3>
              <button class="btn-close" (click)="closeModals()">✕</button>
            </div>
            <div class="modal-body">
              <div class="invoice-detail">
                <div class="invoice-header">
                  <div class="invoice-logo">🐾 PetCareX</div>
                  <div class="invoice-info">
                    <p><strong>Mã hóa đơn:</strong> #{{ selectedInvoice.maHoaDon }}</p>
                    <p><strong>Ngày:</strong> {{ selectedInvoice.ngayLap | date:'dd/MM/yyyy HH:mm' }}</p>
                  </div>
                </div>

                <div class="customer-info">
                  <h4>Thông tin khách hàng</h4>
                  <p><strong>Họ tên:</strong> {{ selectedInvoice.khachHang?.hoTen || 'N/A' }}</p>
                  <p><strong>Nhân viên:</strong> {{ selectedInvoice.nhanVien?.hoTen || 'N/A' }}</p>
                </div>

                @if (selectedInvoice.ctSanPhams?.length) {
                  <div class="items-section">
                    <h4>Sản phẩm</h4>
                    <table class="items-table">
                      <thead>
                        <tr>
                          <th>Sản phẩm</th>
                          <th>SL</th>
                          <th>Đơn giá</th>
                          <th>Thành tiền</th>
                        </tr>
                      </thead>
                      <tbody>
                        @for (item of selectedInvoice.ctSanPhams; track item.maSanPham) {
                          <tr>
                            <td>{{ item.sanPham?.tenSanPham || item.maSanPham }}</td>
                            <td>{{ item.soLuong }}</td>
                            <td>{{ formatCurrency(item.donGia) }}</td>
                            <td>{{ formatCurrency(item.soLuong * item.donGia) }}</td>
                          </tr>
                        }
                      </tbody>
                    </table>
                  </div>
                }

                @if (selectedInvoice.ctDichVuYTes?.length) {
                  <div class="items-section">
                    <h4>Dịch vụ y tế</h4>
                    <table class="items-table">
                      <thead>
                        <tr>
                          <th>Dịch vụ</th>
                          <th>SL</th>
                          <th>Đơn giá</th>
                          <th>Thành tiền</th>
                        </tr>
                      </thead>
                      <tbody>
                        @for (item of selectedInvoice.ctDichVuYTes; track item.maDichVuYTe) {
                          <tr>
                            <td>{{ item.dichVuYTe?.tenDichVuYTe || item.maDichVuYTe }}</td>
                            <td>{{ item.soLuong }}</td>
                            <td>{{ formatCurrency(item.donGia) }}</td>
                            <td>{{ formatCurrency(item.soLuong * item.donGia) }}</td>
                          </tr>
                        }
                      </tbody>
                    </table>
                  </div>
                }

                <div class="invoice-summary">
                  <div class="summary-row">
                    <span>Giảm giá:</span>
                    <span>{{ formatCurrency(selectedInvoice.giamGia || 0) }}</span>
                  </div>
                  <div class="summary-row total">
                    <span>Tổng cộng:</span>
                    <span>{{ formatCurrency(selectedInvoice.tongTien) }}</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn-secondary" (click)="closeModals()">Đóng</button>
              <button class="btn-primary" (click)="printInvoice(selectedInvoice)">🖨️ In hóa đơn</button>
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

    .btn-primary:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
    }

    .btn-primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
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

    /* Filter & Stats */
    .filter-stats {
      background: white;
      padding: 20px;
      border-radius: 12px;
      margin-bottom: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    }

    .filter-bar {
      display: flex;
      gap: 16px;
      align-items: center;
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

    .filter-group input {
      padding: 10px 14px;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      font-size: 14px;
    }

    .btn-reset {
      padding: 10px 16px;
      border: none;
      background: #f1f5f9;
      border-radius: 8px;
      cursor: pointer;
    }

    .stats-summary {
      display: flex;
      gap: 30px;
    }

    .stat {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .stat-label {
      font-size: 14px;
      color: #64748b;
    }

    .stat-value {
      font-size: 18px;
      font-weight: 700;
      color: #1a1f3c;
    }

    .stat-value.revenue {
      color: #16a34a;
    }

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
    }

    .data-table td {
      padding: 16px;
      border-top: 1px solid #f1f5f9;
      font-size: 14px;
    }

    .data-table tbody tr:hover {
      background: #f8fafc;
    }

    .id-cell {
      font-weight: 600;
      color: #667eea;
    }

    .amount-cell {
      font-weight: 600;
      color: #16a34a;
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
    }

    .btn-icon:hover {
      background: #e2e8f0;
    }

    .empty-row td {
      padding: 60px !important;
    }

    .empty-state {
      text-align: center;
      color: #94a3b8;
    }

    .empty-icon {
      font-size: 48px;
      display: block;
      margin-bottom: 12px;
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

    .modal-lg {
      max-width: 800px;
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

    /* Form */
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

    .form-group input {
      width: 100%;
      padding: 12px 14px;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      font-size: 14px;
    }

    .form-group input:focus {
      outline: none;
      border-color: #667eea;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .section {
      margin-top: 24px;
      padding-top: 24px;
      border-top: 1px solid #f1f5f9;
    }

    .section h4 {
      margin: 0 0 16px;
      font-size: 15px;
      color: #1a1f3c;
    }

    .items-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .item-row {
      display: grid;
      grid-template-columns: 2fr 1fr 2fr auto;
      gap: 12px;
      align-items: center;
    }

    .item-row input {
      padding: 10px 12px;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      font-size: 14px;
    }

    .btn-remove {
      width: 32px;
      height: 32px;
      border: none;
      background: #fee2e2;
      color: #dc2626;
      border-radius: 8px;
      cursor: pointer;
    }

    .btn-add {
      padding: 10px;
      border: 2px dashed #e2e8f0;
      background: transparent;
      border-radius: 8px;
      color: #64748b;
      cursor: pointer;
      font-size: 14px;
    }

    .btn-add:hover {
      border-color: #667eea;
      color: #667eea;
    }

    /* Invoice Detail */
    .invoice-detail {
      padding: 20px;
      background: #f8fafc;
      border-radius: 12px;
    }

    .invoice-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 1px solid #e2e8f0;
    }

    .invoice-logo {
      font-size: 24px;
      font-weight: 700;
      color: #667eea;
    }

    .invoice-info p {
      margin: 4px 0;
      font-size: 14px;
      color: #64748b;
    }

    .customer-info {
      margin-bottom: 24px;
    }

    .customer-info h4 {
      margin: 0 0 12px;
      font-size: 15px;
      color: #1a1f3c;
    }

    .customer-info p {
      margin: 4px 0;
      font-size: 14px;
    }

    .items-section {
      margin-bottom: 24px;
    }

    .items-section h4 {
      margin: 0 0 12px;
      font-size: 15px;
      color: #1a1f3c;
    }

    .items-table {
      width: 100%;
      border-collapse: collapse;
      background: white;
      border-radius: 8px;
      overflow: hidden;
    }

    .items-table th {
      background: #f1f5f9;
      padding: 10px 12px;
      text-align: left;
      font-size: 12px;
      font-weight: 600;
      color: #64748b;
    }

    .items-table td {
      padding: 10px 12px;
      font-size: 14px;
      border-top: 1px solid #f1f5f9;
    }

    .invoice-summary {
      margin-top: 24px;
      padding-top: 16px;
      border-top: 2px solid #e2e8f0;
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      font-size: 14px;
    }

    .summary-row.total {
      font-size: 18px;
      font-weight: 700;
      color: #16a34a;
      margin-top: 8px;
      padding-top: 12px;
      border-top: 1px solid #e2e8f0;
    }
  `],
})
export class HoaDonListComponent implements OnInit {
  private hoaDonService = inject(HoaDonService);

  invoices = signal<HoaDon[]>([]);
  filteredInvoices = signal<HoaDon[]>([]);
  totalRevenue = signal(0);
  loading = signal(true);
  saving = signal(false);

  filterStartDate = '';
  filterEndDate = '';
  showCreateModal = false;
  showViewModal = false;
  selectedInvoice: HoaDon | null = null;

  createForm: CreateHoaDonDto = {
    maKhachHang: 0,
    maNhanVien: '',
    ngayLap: '',
    giamGia: 0,
    sanPhams: [],
    dichVuYTes: [],
  };

  ngOnInit() {
    this.loadInvoices();
  }

  loadInvoices() {
    this.loading.set(true);
    this.hoaDonService.getAll().subscribe({
      next: (data) => {
        this.invoices.set(data);
        this.filteredInvoices.set(data);
        this.calculateTotalRevenue(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  calculateTotalRevenue(invoices: HoaDon[]) {
    const total = invoices.reduce((sum, inv) => sum + (inv.tongTien || 0), 0);
    this.totalRevenue.set(total);
  }

  applyFilters() {
    let filtered = this.invoices();

    if (this.filterStartDate) {
      filtered = filtered.filter(
        (inv) => new Date(inv.ngayLap) >= new Date(this.filterStartDate)
      );
    }

    if (this.filterEndDate) {
      filtered = filtered.filter(
        (inv) => new Date(inv.ngayLap) <= new Date(this.filterEndDate + 'T23:59:59')
      );
    }

    this.filteredInvoices.set(filtered);
    this.calculateTotalRevenue(filtered);
  }

  resetFilters() {
    this.filterStartDate = '';
    this.filterEndDate = '';
    this.filteredInvoices.set(this.invoices());
    this.calculateTotalRevenue(this.invoices());
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount || 0);
  }

  viewInvoice(inv: HoaDon) {
    this.hoaDonService.getWithDetails(inv.maHoaDon).subscribe({
      next: (data) => {
        this.selectedInvoice = data;
        this.showViewModal = true;
      },
      error: () => {
        this.selectedInvoice = inv;
        this.showViewModal = true;
      },
    });
  }

  printInvoice(inv: HoaDon) {
    alert(`In hóa đơn #${inv.maHoaDon} - Tính năng đang phát triển`);
  }

  addProduct() {
    this.createForm.sanPhams = this.createForm.sanPhams || [];
    this.createForm.sanPhams.push({ maSanPham: '', soLuong: 1, donGia: 0 });
  }

  removeProduct(index: number) {
    this.createForm.sanPhams?.splice(index, 1);
  }

  addService() {
    this.createForm.dichVuYTes = this.createForm.dichVuYTes || [];
    this.createForm.dichVuYTes.push({ maDichVuYTe: '', soLuong: 1, donGia: 0 });
  }

  removeService(index: number) {
    this.createForm.dichVuYTes?.splice(index, 1);
  }

  createInvoice() {
    if (!this.createForm.maKhachHang || !this.createForm.maNhanVien) {
      alert('Vui lòng điền đầy đủ thông tin');
      return;
    }

    this.saving.set(true);
    this.hoaDonService.create(this.createForm).subscribe({
      next: () => {
        this.loadInvoices();
        this.closeModals();
        this.saving.set(false);
      },
      error: () => this.saving.set(false),
    });
  }

  closeModals() {
    this.showCreateModal = false;
    this.showViewModal = false;
    this.selectedInvoice = null;
    this.createForm = {
      maKhachHang: 0,
      maNhanVien: '',
      ngayLap: '',
      giamGia: 0,
      sanPhams: [],
      dichVuYTes: [],
    };
  }
}
