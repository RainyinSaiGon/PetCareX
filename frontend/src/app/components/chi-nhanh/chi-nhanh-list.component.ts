import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChiNhanhService } from '../../services';

@Component({
  selector: 'app-chi-nhanh-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div class="header-content">
          <h2>Quản lý chi nhánh</h2>
          <p class="subtitle">Quản lý thông tin các chi nhánh và kho hàng</p>
        </div>
        <button class="btn-primary" (click)="openModal()">
          + Thêm chi nhánh
        </button>
      </div>

      <!-- Stats -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon blue">CN</div>
          <div class="stat-content">
            <span class="stat-value">{{ chiNhanhs().length }}</span>
            <span class="stat-label">Chi nhánh</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon green">KH</div>
          <div class="stat-content">
            <span class="stat-value">{{ totalKho() }}</span>
            <span class="stat-label">Kho hàng</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon orange">TP</div>
          <div class="stat-content">
            <span class="stat-value">{{ uniqueCities() }}</span>
            <span class="stat-label">Thành phố</span>
          </div>
        </div>
      </div>

      <!-- Branch List -->
      <div class="branches-grid">
        @if (loading()) {
          <div class="loading">
            <span class="spinner"></span>
            <p>Đang tải dữ liệu...</p>
          </div>
        } @else if (chiNhanhs().length === 0) {
          <div class="empty-state">
            <h3>Chưa có chi nhánh</h3>
            <p>Thêm chi nhánh mới để bắt đầu quản lý.</p>
          </div>
        } @else {
          @for (cn of chiNhanhs(); track cn.maChiNhanh) {
            <div class="branch-card">
              <div class="branch-header">
                <div class="branch-icon">CN</div>
                <div class="branch-title">
                  <h3>{{ cn.tenChiNhanh }}</h3>
                  <span class="branch-id">Mã: {{ cn.maChiNhanh }}</span>
                </div>
                <div class="branch-actions">
                  <button class="btn-icon" title="Sửa" (click)="editChiNhanh(cn)">Sửa</button>
                  <button class="btn-icon" title="Xem kho" (click)="viewKho(cn)">Kho</button>
                  <button class="btn-icon delete" title="Xóa" (click)="deleteChiNhanh(cn)">Xóa</button>
                </div>
              </div>
              <div class="branch-body">
                <div class="info-row">
                  <span class="label">Địa chỉ:</span>
                  <span>{{ cn.diaChi || 'Chưa cập nhật địa chỉ' }}</span>
                </div>
                <div class="info-row">
                  <span class="label">Điện thoại:</span>
                  <span>{{ cn.soDienThoai || 'Chưa cập nhật SĐT' }}</span>
                </div>
                <div class="info-row">
                  <span class="label">Email:</span>
                  <span>{{ cn.email || 'Chưa cập nhật email' }}</span>
                </div>
              </div>
              <div class="branch-footer">
                <div class="footer-item">
                  <span class="label">Kho hàng</span>
                  <span class="value">{{ cn.khos?.length || 0 }}</span>
                </div>
                <div class="footer-item">
                  <span class="label">Nhân viên</span>
                  <span class="value">{{ cn.nhanViens?.length || 0 }}</span>
                </div>
              </div>
            </div>
          }
        }
      </div>

      <!-- Modal Add/Edit Branch -->
      @if (showModal()) {
        <div class="modal-overlay" (click)="closeModal()">
          <div class="modal" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h3>{{ isEditing() ? 'Sửa thông tin chi nhánh' : 'Thêm chi nhánh mới' }}</h3>
              <button class="close-btn" (click)="closeModal()">✕</button>
            </div>
            <div class="modal-body">
              <div class="form-group">
                <label>Tên chi nhánh *</label>
                <input type="text" [(ngModel)]="formData.tenChiNhanh" placeholder="Nhập tên chi nhánh">
              </div>
              <div class="form-group">
                <label>Địa chỉ *</label>
                <input type="text" [(ngModel)]="formData.diaChi" placeholder="Nhập địa chỉ">
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Số điện thoại</label>
                  <input type="text" [(ngModel)]="formData.soDienThoai" placeholder="Nhập SĐT">
                </div>
                <div class="form-group">
                  <label>Email</label>
                  <input type="email" [(ngModel)]="formData.email" placeholder="Nhập email">
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn-secondary" (click)="closeModal()">Hủy</button>
              <button class="btn-primary" (click)="saveChiNhanh()">
                {{ isEditing() ? 'Cập nhật' : 'Thêm mới' }}
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Modal View Kho -->
      @if (showKhoModal()) {
        <div class="modal-overlay" (click)="closeKhoModal()">
          <div class="modal kho-modal" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h3>Kho hàng - {{ selectedChiNhanh()?.tenChiNhanh }}</h3>
              <button class="close-btn" (click)="closeKhoModal()">×</button>
            </div>
            <div class="modal-body">
              @if (loadingKho()) {
                <div class="loading">
                  <span class="spinner"></span>
                  <p>Đang tải...</p>
                </div>
              } @else if (khos().length === 0) {
                <div class="empty-state small">
                  <h4>Chưa có kho</h4>
                  <p>Chi nhánh này chưa có kho hàng.</p>
                </div>
              } @else {
                <div class="kho-list">
                  @for (kho of khos(); track kho.maKho) {
                    <div class="kho-item">
                      <div class="kho-info">
                        <span class="kho-icon">KHO</span>
                        <div>
                          <h4>{{ kho.tenKho }}</h4>
                          <span class="kho-id">Mã: {{ kho.maKho }}</span>
                        </div>
                      </div>
                      <div class="kho-stats">
                        <div class="kho-stat">
                          <span class="label">Sản phẩm</span>
                          <span class="value">{{ kho.sanPhams?.length || 0 }}</span>
                        </div>
                        <div class="kho-stat">
                          <span class="label">Vaccine</span>
                          <span class="value">{{ kho.vaccines?.length || 0 }}</span>
                        </div>
                      </div>
                    </div>
                  }
                </div>
              }
            </div>
            <div class="modal-footer">
              <button class="btn-secondary" (click)="closeKhoModal()">Đóng</button>
            </div>
          </div>
        </div>
      }

      <!-- Delete Confirmation Modal -->
      @if (showDeleteModal()) {
        <div class="modal-overlay" (click)="closeDeleteModal()">
          <div class="modal delete-modal" (click)="$event.stopPropagation()">
            <div class="modal-header delete-header">
              <h3>Xác nhận xóa</h3>
              <button class="close-btn" (click)="closeDeleteModal()">×</button>
            </div>
            <div class="modal-body">
              <p class="delete-message">Bạn có chắc chắn muốn xóa chi nhánh <strong>{{ deleteTarget()?.tenChiNhanh }}</strong>?</p>
              <p class="delete-warning">Hành động này không thể hoàn tác!</p>
            </div>
            <div class="modal-footer">
              <button class="btn-secondary" (click)="closeDeleteModal()">Hủy</button>
              <button class="btn-danger" (click)="confirmDelete()" [disabled]="deleting()">
                {{ deleting() ? 'Đang xóa...' : 'Xóa chi nhánh' }}
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Toast -->
      @if (toast()) {
        <div class="toast" [class.success]="toast()?.type === 'success'" [class.error]="toast()?.type === 'error'">
          <span>{{ toast()?.message }}</span>
        </div>
      }
    </div>
  `,
  styles: [`
    .page-container { animation: fadeIn 0.3s ease; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .page-header h2 { margin: 0; font-size: 24px; color: #1a1f3c; }
    .subtitle { margin: 4px 0 0; color: #64748b; font-size: 14px; }
    
    .btn-primary {
      display: flex; align-items: center; gap: 8px;
      padding: 10px 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white; border: none; border-radius: 10px; cursor: pointer;
      font-weight: 500; transition: all 0.2s;
    }
    .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4); }
    
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px; }
    .stat-card {
      background: white; border-radius: 12px; padding: 20px;
      display: flex; align-items: center; gap: 16px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    }
    .stat-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 24px; }
    .stat-icon.blue { background: #e0e7ff; }
    .stat-icon.green { background: #d1fae5; }
    .stat-icon.orange { background: #fef3c7; }
    .stat-value { font-size: 24px; font-weight: 700; color: #1a1f3c; display: block; }
    .stat-label { font-size: 13px; color: #64748b; }
    
    .branches-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 20px; }
    
    .branch-card {
      background: white; border-radius: 16px; overflow: hidden;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
      transition: all 0.2s;
    }
    .branch-card:hover { transform: translateY(-4px); box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1); }
    
    .branch-header {
      display: flex; align-items: center; gap: 12px;
      padding: 16px 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }
    .branch-icon { font-size: 28px; }
    .branch-title { flex: 1; }
    .branch-title h3 { margin: 0; font-size: 16px; font-weight: 600; }
    .branch-id { font-size: 12px; opacity: 0.8; }
    .branch-actions { display: flex; gap: 6px; }
    .branch-actions .btn-icon { background: rgba(255,255,255,0.2); color: white; }
    .branch-actions .btn-icon:hover { background: rgba(255,255,255,0.3); }
    
    .branch-body { padding: 20px; }
    .info-row { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; color: #475569; font-size: 14px; }
    .info-row:last-child { margin-bottom: 0; }
    .info-row .icon { font-size: 16px; }
    
    .branch-footer {
      display: flex; padding: 16px 20px; background: #f8fafc;
      border-top: 1px solid #f1f5f9;
    }
    .footer-item { flex: 1; text-align: center; }
    .footer-item .label { display: block; font-size: 12px; color: #64748b; }
    .footer-item .value { font-size: 18px; font-weight: 600; color: #1a1f3c; }
    
    .btn-icon {
      padding: 6px 10px; background: #f8fafc; border: none; border-radius: 8px;
      cursor: pointer; transition: all 0.2s;
    }
    .btn-icon:hover { background: #e2e8f0; }
    .btn-icon.delete:hover { background: #fee2e2; }
    
    .loading, .empty-state { padding: 60px; text-align: center; color: #64748b; grid-column: 1 / -1; background: white; border-radius: 16px; }
    .empty-state.small { padding: 40px; }
    .spinner {
      width: 40px; height: 40px; border: 3px solid #e2e8f0; border-top-color: #667eea;
      border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 16px; display: block;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .empty-icon { font-size: 48px; display: block; margin-bottom: 16px; }
    
    .modal-overlay {
      position: fixed; inset: 0; background: rgba(0, 0, 0, 0.5);
      display: flex; align-items: center; justify-content: center; z-index: 1000;
    }
    .modal {
      background: white; border-radius: 16px; width: 90%; max-width: 500px;
      max-height: 90vh; overflow-y: auto;
    }
    .kho-modal { max-width: 600px; }
    .modal-header {
      display: flex; justify-content: space-between; align-items: center;
      padding: 20px 24px; border-bottom: 1px solid #f1f5f9;
    }
    .modal-header h3 { margin: 0; font-size: 18px; color: #1a1f3c; }
    .close-btn { background: none; border: none; font-size: 20px; cursor: pointer; color: #64748b; }
    .modal-body { padding: 24px; }
    .modal-footer { display: flex; justify-content: flex-end; gap: 12px; padding: 16px 24px; border-top: 1px solid #f1f5f9; }
    
    .form-group { margin-bottom: 16px; }
    .form-group label { display: block; margin-bottom: 6px; font-weight: 500; color: #475569; font-size: 14px; }
    .form-group input {
      width: 100%; padding: 10px 14px; border: 1px solid #e2e8f0; border-radius: 8px;
      font-size: 14px; outline: none; transition: border-color 0.2s;
    }
    .form-group input:focus { border-color: #667eea; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    
    .btn-secondary {
      padding: 10px 20px; background: #f1f5f9; color: #475569;
      border: none; border-radius: 10px; cursor: pointer; font-weight: 500;
    }
    
    .btn-danger {
      padding: 10px 20px; background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
      color: white; border: none; border-radius: 10px; cursor: pointer; font-weight: 500;
    }
    .btn-danger:disabled { opacity: 0.6; cursor: not-allowed; }
    
    .kho-list { display: flex; flex-direction: column; gap: 12px; }
    .kho-item {
      display: flex; justify-content: space-between; align-items: center;
      padding: 16px; background: #f8fafc; border-radius: 12px;
    }
    .kho-info { display: flex; align-items: center; gap: 12px; }
    .kho-icon { font-size: 24px; }
    .kho-info h4 { margin: 0; font-size: 15px; color: #1a1f3c; }
    .kho-id { font-size: 12px; color: #64748b; }
    .kho-stats { display: flex; gap: 20px; }
    .kho-stat { text-align: center; }
    .kho-stat .label { display: block; font-size: 11px; color: #64748b; }
    .kho-stat .value { font-size: 16px; font-weight: 600; color: #1a1f3c; }

    .delete-modal { max-width: 400px; }
    .delete-header { flex-wrap: wrap; gap: 8px; }
    .delete-icon { font-size: 32px; width: 100%; text-align: center; display: block; }
    .delete-header h3 { width: 100%; text-align: center; margin: 8px 0 0 !important; }
    .delete-message { text-align: center; font-size: 15px; color: #475569; margin-bottom: 8px; }
    .delete-warning { text-align: center; font-size: 13px; color: #ef4444; }

    .toast {
      position: fixed; bottom: 24px; right: 24px; padding: 14px 20px;
      background: #1f2937; color: white; border-radius: 12px;
      display: flex; align-items: center; gap: 10px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15); animation: slideIn 0.3s ease;
      z-index: 2000;
    }
    .toast.success { background: linear-gradient(135deg, #10b981 0%, #059669 100%); }
    .toast.error { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); }
    @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
  `]
})
export class ChiNhanhListComponent implements OnInit {
  chiNhanhs = signal<any[]>([]);
  khos = signal<any[]>([]);
  loading = signal(true);
  loadingKho = signal(false);
  showModal = signal(false);
  showKhoModal = signal(false);
  showDeleteModal = signal(false);
  isEditing = signal(false);
  selectedChiNhanh = signal<any>(null);
  deleteTarget = signal<any>(null);
  deleting = signal(false);
  toast = signal<{ message: string; type: 'success' | 'error' } | null>(null);
  
  formData: any = {};

  constructor(private chiNhanhService: ChiNhanhService) {}

  ngOnInit() { this.loadChiNhanhs(); }

  loadChiNhanhs() {
    this.loading.set(true);
    this.chiNhanhService.getAll().subscribe({
      next: (data: any) => { this.chiNhanhs.set(Array.isArray(data) ? data : data.data || []); this.loading.set(false); },
      error: (err: any) => { console.error('Error:', err); this.loading.set(false); }
    });
  }

  totalKho(): number { return this.chiNhanhs().reduce((sum, cn) => sum + (cn.khos?.length || 0), 0); }

  uniqueCities(): number {
    const cities = new Set(this.chiNhanhs().map(cn => cn.diaChi?.split(',').pop()?.trim()).filter(Boolean));
    return cities.size || this.chiNhanhs().length;
  }

  openModal() { this.isEditing.set(false); this.formData = {}; this.showModal.set(true); }
  editChiNhanh(cn: any) { this.isEditing.set(true); this.formData = { ...cn }; this.showModal.set(true); }
  closeModal() { this.showModal.set(false); this.formData = {}; }

  saveChiNhanh() {
    const request = this.isEditing() ? this.chiNhanhService.update(this.formData.maChiNhanh, this.formData) : this.chiNhanhService.create(this.formData);
    request.subscribe({
      next: () => {
        this.showToast(this.isEditing() ? 'Cập nhật chi nhánh thành công!' : 'Thêm chi nhánh thành công!', 'success');
        this.closeModal();
        this.loadChiNhanhs();
      },
      error: (err: any) => this.showToast('Lỗi: ' + (err.error?.message || 'Vui lòng thử lại'), 'error')
    });
  }

  deleteChiNhanh(cn: any) {
    this.deleteTarget.set(cn);
    this.showDeleteModal.set(true);
  }

  closeDeleteModal() {
    this.showDeleteModal.set(false);
    this.deleteTarget.set(null);
  }

  confirmDelete() {
    const target = this.deleteTarget();
    if (!target) return;
    this.deleting.set(true);
    this.chiNhanhService.delete(target.maChiNhanh).subscribe({
      next: () => {
        this.showToast('Xóa chi nhánh thành công!', 'success');
        this.closeDeleteModal();
        this.loadChiNhanhs();
      },
      error: (err: any) => this.showToast('Lỗi: ' + (err.error?.message || 'Vui lòng thử lại'), 'error'),
      complete: () => this.deleting.set(false)
    });
  }

  showToast(message: string, type: 'success' | 'error') {
    this.toast.set({ message, type });
    setTimeout(() => this.toast.set(null), 3000);
  }

  viewKho(cn: any) {
    this.selectedChiNhanh.set(cn);
    this.loadingKho.set(true);
    this.showKhoModal.set(true);
    // Use cn.khos directly if available, otherwise set empty
    this.khos.set(cn.khos || []);
    this.loadingKho.set(false);
  }

  closeKhoModal() { this.showKhoModal.set(false); this.selectedChiNhanh.set(null); this.khos.set([]); }
}
