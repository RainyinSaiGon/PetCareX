import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SanPhamService } from '../../services';
import { SanPham, CreateSanPhamDto, UpdateSanPhamDto, LOAI_SAN_PHAM, getSanPhamColor } from '../../models/san-pham.model';

@Component({
  selector: 'app-san-pham-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div class="header-content">
          <h2>Quản lý sản phẩm</h2>
          <p class="subtitle">Quản lý kho và sản phẩm bán lẻ cho thú cưng</p>
        </div>
        <div class="header-actions">
          <button class="btn-secondary" (click)="toggleView()">
            {{ viewMode() === 'grid' ? 'Danh sách' : 'Lưới' }}
          </button>
          <button class="btn-primary" (click)="openModal()">
            + Thêm sản phẩm
          </button>
        </div>
      </div>

      <!-- Filters -->
      <div class="filters-section">
        <div class="search-box">
          <input 
            type="text" 
            [(ngModel)]="searchTerm" 
            (ngModelChange)="onSearch()"
            placeholder="Tìm kiếm theo tên sản phẩm, mã..."
          >
        </div>
        <div class="filter-group">
          <select [(ngModel)]="selectedLoai" (ngModelChange)="filterByLoai()">
            <option value="">Tất cả loại sản phẩm</option>
            @for (loai of loaiSanPhams; track loai.value) {
              <option [value]="loai.value">{{ loai.label }}</option>
            }
          </select>
          <select [(ngModel)]="sortBy" (ngModelChange)="sortProducts()">
            <option value="tenSanPham">Sắp xếp theo tên</option>
            <option value="giaTienSanPham-asc">Giá: Thấp → Cao</option>
            <option value="giaTienSanPham-desc">Giá: Cao → Thấp</option>
            <option value="maSanPham">Mã sản phẩm</option>
          </select>
        </div>
      </div>

      <!-- Stats -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon blue">SP</div>
          <div class="stat-content">
            <span class="stat-value">{{ sanPhams().length }}</span>
            <span class="stat-label">Tổng sản phẩm</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon green">GT</div>
          <div class="stat-content">
            <span class="stat-value">{{ formatCurrency(totalValue()) }}</span>
            <span class="stat-label">Tổng giá trị</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon orange">DM</div>
          <div class="stat-content">
            <span class="stat-value">{{ uniqueCategories() }}</span>
            <span class="stat-label">Danh mục</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon purple">TB</div>
          <div class="stat-content">
            <span class="stat-value">{{ formatCurrency(avgPrice()) }}</span>
            <span class="stat-label">Giá trung bình</span>
          </div>
        </div>
      </div>

      <!-- Products Content -->
      <div class="products-section">
        @if (loading()) {
          <div class="loading">
            <span class="spinner"></span>
            <p>Đang tải dữ liệu...</p>
          </div>
        } @else if (filteredProducts().length === 0) {
          <div class="empty-state">
            <h3>{{ searchTerm || selectedLoai ? 'Không tìm thấy sản phẩm' : 'Chưa có sản phẩm' }}</h3>
            <p>{{ searchTerm || selectedLoai ? 'Thử tìm kiếm với từ khóa khác.' : 'Thêm sản phẩm mới để bắt đầu bán hàng.' }}</p>
            @if (searchTerm || selectedLoai) {
              <button class="btn-secondary" (click)="clearFilters()">Xóa bộ lọc</button>
            }
          </div>
        } @else {
          <!-- Grid View -->
          @if (viewMode() === 'grid') {
            <div class="products-grid">
              @for (sp of filteredProducts(); track sp.maSanPham) {
                <div class="product-card" [class.selected]="selectedSanPham()?.maSanPham === sp.maSanPham">
                  <div class="product-image" [style.background]="getGradient(sp.loaiSanPham)">
                    <span class="product-badge">{{ sp.maSanPham }}</span>
                  </div>
                  <div class="product-body">
                    <span class="product-category" [style.color]="getCategoryColor(sp.loaiSanPham)">
                      {{ sp.loaiSanPham || 'Khác' }}
                    </span>
                    <h3 class="product-name" [title]="sp.tenSanPham">{{ sp.tenSanPham }}</h3>
                    <p class="product-desc">{{ sp.moTa || 'Chưa có mô tả sản phẩm' }}</p>
                    <div class="product-footer">
                      <span class="price">{{ formatCurrency(sp.giaTienSanPham) }}</span>
                    </div>
                  </div>
                  <div class="product-actions">
                    <button class="btn-icon edit" title="Sửa" (click)="editSanPham(sp)">Sửa</button>
                    <button class="btn-icon view" title="Xem chi tiết" (click)="viewDetail(sp)">Xem</button>
                    <button class="btn-icon delete" title="Xóa" (click)="deleteSanPham(sp)">Xóa</button>
                  </div>
                </div>
              }
            </div>
          } @else {
            <!-- Table View -->
            <div class="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Mã SP</th>
                    <th>Tên sản phẩm</th>
                    <th>Loại</th>
                    <th>Giá bán</th>
                    <th>Mô tả</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  @for (sp of filteredProducts(); track sp.maSanPham) {
                    <tr [class.selected]="selectedSanPham()?.maSanPham === sp.maSanPham">
                      <td><span class="badge id">{{ sp.maSanPham }}</span></td>
                      <td>
                        <div class="product-info-cell">
                          <span class="product-name-text">{{ sp.tenSanPham }}</span>
                        </div>
                      </td>
                      <td><span class="badge category" [style.background]="getCategoryColor(sp.loaiSanPham) + '20'" [style.color]="getCategoryColor(sp.loaiSanPham)">{{ sp.loaiSanPham || 'Khác' }}</span></td>
                      <td><span class="price">{{ formatCurrency(sp.giaTienSanPham) }}</span></td>
                      <td class="desc-cell">{{ sp.moTa || '-' }}</td>
                      <td>
                        <div class="actions">
                          <button class="btn-icon edit" title="Sửa" (click)="editSanPham(sp)">Sửa</button>
                          <button class="btn-icon view" title="Xem" (click)="viewDetail(sp)">Xem</button>
                          <button class="btn-icon delete" title="Xóa" (click)="deleteSanPham(sp)">Xóa</button>
                        </div>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        }
      </div>

      <!-- Pagination -->
      @if (totalPages() > 1) {
        <div class="pagination">
          <button class="page-btn" [disabled]="currentPage() === 1" (click)="goToPage(1)">«</button>
          <button class="page-btn" [disabled]="currentPage() === 1" (click)="goToPage(currentPage() - 1)">Trước</button>
          <div class="page-numbers">
            @for (page of getPageNumbers(); track page) {
              <button 
                class="page-num" 
                [class.active]="page === currentPage()"
                (click)="goToPage(page)">
                {{ page }}
              </button>
            }
          </div>
          <button class="page-btn" [disabled]="currentPage() === totalPages()" (click)="goToPage(currentPage() + 1)">Sau</button>
          <button class="page-btn" [disabled]="currentPage() === totalPages()" (click)="goToPage(totalPages())">»</button>
          <span class="page-info">{{ currentPage() }} / {{ totalPages() }} ({{ filteredProducts().length }} sản phẩm)</span>
        </div>
      }

      <!-- Modal Add/Edit -->
      @if (showModal()) {
        <div class="modal-overlay" (click)="closeModal()">
          <div class="modal" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h3>{{ isEditing() ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới' }}</h3>
              <button class="close-btn" (click)="closeModal()">×</button>
            </div>
            <div class="modal-body">
              <div class="form-group" [class.error]="formErrors['maSanPham']">
                <label>Mã sản phẩm * <span class="hint">(5 ký tự)</span></label>
                <input 
                  type="text" 
                  [(ngModel)]="formData.maSanPham" 
                  placeholder="VD: SP001"
                  maxlength="5"
                  [disabled]="isEditing()"
                  (input)="validateForm()">
                @if (formErrors['maSanPham']) {
                  <span class="error-msg">{{ formErrors['maSanPham'] }}</span>
                }
              </div>
              <div class="form-group" [class.error]="formErrors['tenSanPham']">
                <label>Tên sản phẩm *</label>
                <input 
                  type="text" 
                  [(ngModel)]="formData.tenSanPham" 
                  placeholder="Nhập tên sản phẩm"
                  maxlength="50"
                  (input)="validateForm()">
                @if (formErrors['tenSanPham']) {
                  <span class="error-msg">{{ formErrors['tenSanPham'] }}</span>
                }
              </div>
              <div class="form-row">
                <div class="form-group" [class.error]="formErrors['giaTienSanPham']">
                  <label>Giá bán (VNĐ) *</label>
                  <input 
                    type="number" 
                    [(ngModel)]="formData.giaTienSanPham" 
                    placeholder="0"
                    min="0"
                    (input)="validateForm()">
                  @if (formErrors['giaTienSanPham']) {
                    <span class="error-msg">{{ formErrors['giaTienSanPham'] }}</span>
                  }
                </div>
                <div class="form-group">
                  <label>Loại sản phẩm *</label>
                  <select [(ngModel)]="formData.loaiSanPham">
                    <option value="">Chọn loại sản phẩm</option>
                    @for (loai of loaiSanPhams; track loai.value) {
                      <option [value]="loai.value">{{ loai.label }}</option>
                    }
                  </select>
                </div>
              </div>
              <div class="form-group">
                <label>Mô tả sản phẩm</label>
                <textarea 
                  [(ngModel)]="formData.moTa" 
                  placeholder="Mô tả chi tiết về sản phẩm..." 
                  rows="4"
                  maxlength="200"></textarea>
                <span class="char-count">{{ (formData.moTa?.length || 0) }}/200</span>
              </div>
              
              <!-- Preview -->
              <div class="preview-section">
                <h4>Xem trước</h4>
                <div class="preview-card">
                  <div class="preview-icon" [style.background]="getGradient(formData.loaiSanPham || '')">
                  </div>
                  <div class="preview-info">
                    <span class="preview-name">{{ formData.tenSanPham || 'Tên sản phẩm' }}</span>
                    <span class="preview-category">{{ formData.loaiSanPham || 'Chưa chọn loại' }}</span>
                    <span class="preview-price">{{ formatCurrency(formData.giaTienSanPham || 0) }}</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn-secondary" (click)="closeModal()">Hủy</button>
              <button 
                class="btn-primary" 
                (click)="saveSanPham()"
                [disabled]="!isFormValid()">
                {{ isEditing() ? 'Cập nhật' : 'Thêm mới' }}
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Detail Modal -->
      @if (showDetailModal()) {
        <div class="modal-overlay" (click)="closeDetailModal()">
          <div class="modal detail-modal" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h3>Chi tiết sản phẩm</h3>
              <button class="close-btn" (click)="closeDetailModal()">×</button>
            </div>
            <div class="modal-body">
              @if (selectedSanPham()) {
                <div class="detail-hero">
                  <div class="detail-icon" [style.background]="getGradient(selectedSanPham()!.loaiSanPham)">
                  </div>
                  <div class="detail-main">
                    <h2>{{ selectedSanPham()!.tenSanPham }}</h2>
                    <span class="detail-category">{{ selectedSanPham()!.loaiSanPham || 'Khác' }}</span>
                    <span class="detail-price">{{ formatCurrency(selectedSanPham()!.giaTienSanPham) }}</span>
                  </div>
                </div>
                <div class="detail-grid">
                  <div class="detail-item">
                    <label>Mã sản phẩm</label>
                    <span class="badge id">{{ selectedSanPham()!.maSanPham }}</span>
                  </div>
                  <div class="detail-item">
                    <label>Loại sản phẩm</label>
                    <span>{{ selectedSanPham()!.loaiSanPham || 'Khác' }}</span>
                  </div>
                  <div class="detail-item">
                    <label>Giá bán</label>
                    <span class="price-large">{{ formatCurrency(selectedSanPham()!.giaTienSanPham) }}</span>
                  </div>
                  <div class="detail-item full">
                    <label>Mô tả</label>
                    <p class="description">{{ selectedSanPham()!.moTa || 'Chưa có mô tả cho sản phẩm này.' }}</p>
                  </div>
                </div>
              }
            </div>
            <div class="modal-footer">
              <button class="btn-secondary" (click)="closeDetailModal()">Đóng</button>
              <button class="btn-primary" (click)="editFromDetail()">Chỉnh sửa</button>
            </div>
          </div>
        </div>
      }

      <!-- Delete Confirmation Modal -->
      @if (showDeleteModal()) {
        <div class="modal-overlay" (click)="closeDeleteModal()">
          <div class="modal delete-modal" (click)="$event.stopPropagation()">
            <div class="modal-header delete">
              <h3>Xác nhận xóa</h3>
              <button class="close-btn" (click)="closeDeleteModal()">×</button>
            </div>
            <div class="modal-body">
              <div class="delete-warning">
                <p>Bạn có chắc chắn muốn xóa sản phẩm:</p>
                <strong>{{ productToDelete?.tenSanPham }}</strong>
                <p class="warning-note">Hành động này không thể hoàn tác!</p>
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn-secondary" (click)="closeDeleteModal()">Hủy</button>
              <button class="btn-danger" (click)="confirmDelete()">Xác nhận xóa</button>
            </div>
          </div>
        </div>
      }

      <!-- Toast Notification -->
      @if (toast().show) {
        <div class="toast" [class]="toast().type">
          <span class="toast-message">{{ toast().message }}</span>
        </div>
      }
    </div>
  `,
  styles: [`
    .page-container { animation: fadeIn 0.3s ease; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 16px; }
    .page-header h2 { margin: 0; font-size: 24px; color: #1a1f3c; }
    .subtitle { margin: 4px 0 0; color: #64748b; font-size: 14px; }
    .header-actions { display: flex; gap: 12px; }
    
    .btn-primary { display: flex; align-items: center; gap: 8px; padding: 10px 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 10px; cursor: pointer; font-weight: 500; transition: all 0.2s; }
    .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4); }
    .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
    .btn-secondary { display: flex; align-items: center; gap: 8px; padding: 10px 20px; background: #f1f5f9; color: #475569; border: none; border-radius: 10px; cursor: pointer; font-weight: 500; transition: all 0.2s; }
    .btn-secondary:hover { background: #e2e8f0; }
    .btn-danger { display: flex; align-items: center; gap: 8px; padding: 10px 20px; background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; border: none; border-radius: 10px; cursor: pointer; font-weight: 500; transition: all 0.2s; }
    .btn-danger:hover { transform: translateY(-2px); box-shadow: 0 4px 15px rgba(239, 68, 68, 0.4); }
    
    .filters-section { display: flex; gap: 16px; margin-bottom: 24px; flex-wrap: wrap; }
    .search-box { flex: 1; min-width: 280px; position: relative; background: white; border-radius: 10px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05); }
    .search-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); }
    .search-box input { width: 100%; padding: 12px 12px 12px 42px; border: none; border-radius: 10px; font-size: 14px; outline: none; }
    .filter-group { display: flex; gap: 12px; flex-wrap: wrap; }
    .filter-group select { padding: 12px 16px; border: 1px solid #e2e8f0; border-radius: 10px; background: white; font-size: 14px; cursor: pointer; outline: none; min-width: 180px; }
    .filter-group select:focus { border-color: #667eea; }
    
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px; }
    .stat-card { background: white; border-radius: 12px; padding: 20px; display: flex; align-items: center; gap: 16px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05); transition: all 0.2s; }
    .stat-card:hover { transform: translateY(-2px); box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1); }
    .stat-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 24px; }
    .stat-icon.blue { background: #e0e7ff; }
    .stat-icon.green { background: #d1fae5; }
    .stat-icon.orange { background: #fef3c7; }
    .stat-icon.purple { background: #f3e8ff; }
    .stat-value { font-size: 22px; font-weight: 700; color: #1a1f3c; display: block; }
    .stat-label { font-size: 13px; color: #64748b; }
    
    .products-section { margin-bottom: 24px; }
    .products-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; }
    
    .product-card { background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05); transition: all 0.2s; position: relative; }
    .product-card:hover { transform: translateY(-4px); box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1); }
    .product-card.selected { ring: 2px solid #667eea; }
    
    .product-image { height: 140px; display: flex; align-items: center; justify-content: center; position: relative; }
    .product-emoji { font-size: 56px; }
    .product-badge { position: absolute; top: 12px; right: 12px; background: rgba(255,255,255,0.9); padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; color: #475569; }
    
    .product-body { padding: 16px; }
    .product-category { font-size: 12px; text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px; }
    .product-name { margin: 8px 0; font-size: 16px; color: #1a1f3c; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .product-desc { font-size: 13px; color: #64748b; margin: 0 0 12px; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; min-height: 36px; }
    .product-footer { display: flex; justify-content: space-between; align-items: center; }
    .price { font-size: 18px; font-weight: 700; color: #667eea; }
    
    .product-actions { display: flex; justify-content: center; gap: 8px; padding: 12px; border-top: 1px solid #f1f5f9; background: #fafbfc; }
    .btn-icon { padding: 8px 14px; background: white; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer; transition: all 0.2s; font-size: 14px; }
    .btn-icon:hover { transform: scale(1.05); }
    .btn-icon.edit:hover { background: #e0e7ff; border-color: #667eea; }
    .btn-icon.view:hover { background: #d1fae5; border-color: #10b981; }
    .btn-icon.delete:hover { background: #fee2e2; border-color: #ef4444; }
    
    /* Table View */
    .table-container { background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05); }
    table { width: 100%; border-collapse: collapse; }
    th { background: #f8fafc; padding: 14px 16px; text-align: left; font-weight: 600; color: #475569; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; }
    td { padding: 14px 16px; border-top: 1px solid #f1f5f9; }
    tr:hover { background: #fafbfc; }
    tr.selected { background: #f0f4ff; }
    
    .badge { display: inline-block; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 500; }
    .badge.id { background: #e0e7ff; color: #4338ca; }
    .badge.category { padding: 4px 12px; }
    
    .product-info-cell { display: flex; align-items: center; gap: 10px; }
    .product-icon { font-size: 24px; }
    .product-name-text { font-weight: 500; color: #1a1f3c; }
    .desc-cell { max-width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: #64748b; }
    
    .actions { display: flex; gap: 6px; }
    
    /* Pagination */
    .pagination { display: flex; align-items: center; justify-content: center; gap: 8px; padding: 20px; background: white; border-radius: 12px; margin-top: 20px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05); }
    .page-btn { padding: 8px 12px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer; transition: all 0.2s; }
    .page-btn:hover:not(:disabled) { background: #e2e8f0; }
    .page-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .page-numbers { display: flex; gap: 4px; }
    .page-num { width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer; font-weight: 500; transition: all 0.2s; }
    .page-num:hover { background: #e2e8f0; }
    .page-num.active { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-color: transparent; }
    .page-info { margin-left: 16px; font-size: 13px; color: #64748b; }
    
    /* Loading & Empty States */
    .loading, .empty-state { background: white; border-radius: 16px; padding: 60px; text-align: center; color: #64748b; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05); }
    .spinner { width: 40px; height: 40px; border: 3px solid #e2e8f0; border-top-color: #667eea; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 16px; display: block; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .empty-icon { font-size: 48px; display: block; margin-bottom: 16px; }
    .empty-state h3 { margin: 0 0 8px; color: #1a1f3c; }
    .empty-state p { margin: 0 0 16px; }
    
    /* Modal Styles */
    .modal-overlay { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(4px); }
    .modal { background: white; border-radius: 20px; width: 90%; max-width: 560px; max-height: 90vh; overflow-y: auto; animation: modalIn 0.3s ease; }
    @keyframes modalIn { from { opacity: 0; transform: scale(0.95) translateY(20px); } to { opacity: 1; transform: scale(1) translateY(0); } }
    .modal.detail-modal { max-width: 600px; }
    .modal.delete-modal { max-width: 440px; }
    
    .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid #f1f5f9; }
    .modal-header.delete { background: #fef2f2; border-bottom-color: #fee2e2; }
    .modal-header h3 { margin: 0; font-size: 18px; color: #1a1f3c; }
    .close-btn { background: none; border: none; font-size: 20px; cursor: pointer; color: #64748b; padding: 4px; border-radius: 8px; transition: all 0.2s; }
    .close-btn:hover { background: #f1f5f9; color: #1a1f3c; }
    
    .modal-body { padding: 24px; }
    .modal-footer { display: flex; justify-content: flex-end; gap: 12px; padding: 16px 24px; border-top: 1px solid #f1f5f9; background: #fafbfc; border-radius: 0 0 20px 20px; }
    
    /* Form Styles */
    .form-group { margin-bottom: 20px; position: relative; }
    .form-group label { display: block; margin-bottom: 8px; font-weight: 500; color: #475569; font-size: 14px; }
    .form-group .hint { font-weight: normal; color: #94a3b8; font-size: 12px; }
    .form-group input, .form-group select, .form-group textarea { width: 100%; padding: 12px 16px; border: 2px solid #e2e8f0; border-radius: 10px; font-size: 14px; outline: none; transition: all 0.2s; font-family: inherit; }
    .form-group input:focus, .form-group select:focus, .form-group textarea:focus { border-color: #667eea; box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1); }
    .form-group input:disabled { background: #f8fafc; color: #94a3b8; }
    .form-group.error input, .form-group.error select { border-color: #ef4444; }
    .form-group .error-msg { color: #ef4444; font-size: 12px; margin-top: 4px; display: block; }
    .form-group .char-count { position: absolute; right: 12px; bottom: 8px; font-size: 11px; color: #94a3b8; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    
    /* Preview Section */
    .preview-section { margin-top: 24px; padding-top: 20px; border-top: 2px dashed #e2e8f0; }
    .preview-section h4 { margin: 0 0 12px; font-size: 14px; color: #64748b; font-weight: 500; }
    .preview-card { display: flex; align-items: center; gap: 16px; padding: 16px; background: #f8fafc; border-radius: 12px; }
    .preview-icon { width: 60px; height: 60px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 28px; }
    .preview-info { flex: 1; }
    .preview-name { display: block; font-weight: 600; color: #1a1f3c; margin-bottom: 4px; }
    .preview-category { display: block; font-size: 12px; color: #64748b; margin-bottom: 4px; }
    .preview-price { font-weight: 700; color: #667eea; }
    
    /* Detail Modal */
    .detail-hero { display: flex; align-items: center; gap: 20px; padding: 20px; background: #f8fafc; border-radius: 12px; margin-bottom: 24px; }
    .detail-icon { width: 80px; height: 80px; border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 40px; }
    .detail-main h2 { margin: 0 0 8px; font-size: 20px; color: #1a1f3c; }
    .detail-category { display: inline-block; background: #e0e7ff; color: #4338ca; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 500; margin-right: 12px; }
    .detail-price { font-size: 20px; font-weight: 700; color: #667eea; }
    
    .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .detail-item { padding: 16px; background: #f8fafc; border-radius: 10px; }
    .detail-item label { display: block; font-size: 12px; color: #64748b; margin-bottom: 8px; font-weight: 500; }
    .detail-item span { font-size: 15px; color: #1a1f3c; font-weight: 500; }
    .detail-item.full { grid-column: 1 / -1; }
    .detail-item .description { margin: 0; line-height: 1.6; font-weight: normal; }
    .price-large { color: #667eea; font-size: 18px; }
    
    /* Delete Modal */
    .delete-warning { text-align: center; padding: 20px; }
    .warning-icon { font-size: 48px; display: block; margin-bottom: 16px; }
    .delete-warning p { margin: 8px 0; color: #64748b; }
    .delete-warning strong { display: block; font-size: 18px; color: #1a1f3c; margin: 12px 0; }
    .warning-note { color: #ef4444 !important; font-size: 13px; }
    
    /* Toast */
    .toast { position: fixed; bottom: 24px; right: 24px; display: flex; align-items: center; gap: 12px; padding: 16px 24px; background: white; border-radius: 12px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15); animation: toastIn 0.3s ease, toastOut 0.3s ease 2.7s forwards; z-index: 2000; }
    @keyframes toastIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes toastOut { from { opacity: 1; transform: translateY(0); } to { opacity: 0; transform: translateY(20px); } }
    .toast.success { border-left: 4px solid #10b981; }
    .toast.error { border-left: 4px solid #ef4444; }
    .toast.info { border-left: 4px solid #3b82f6; }
    .toast-icon { font-size: 20px; }
    .toast-message { font-weight: 500; color: #1a1f3c; }
  `]
})
export class SanPhamListComponent implements OnInit {
  // Signals for reactive state
  sanPhams = signal<SanPham[]>([]);
  filteredProducts = signal<SanPham[]>([]);
  loading = signal(true);
  showModal = signal(false);
  showDetailModal = signal(false);
  showDeleteModal = signal(false);
  isEditing = signal(false);
  selectedSanPham = signal<SanPham | null>(null);
  viewMode = signal<'grid' | 'table'>('grid');
  currentPage = signal(1);
  totalPages = signal(1);
  toast = signal<{show: boolean; message: string; type: 'success' | 'error' | 'info'}>({show: false, message: '', type: 'info'});

  // Filter state
  searchTerm = '';
  selectedLoai = '';
  sortBy = 'tenSanPham';
  itemsPerPage = 12;
  
  // Form state
  formData: CreateSanPhamDto = { maSanPham: '', tenSanPham: '', giaTienSanPham: 0, loaiSanPham: '' };
  formErrors: Record<string, string> = {};
  productToDelete: SanPham | null = null;
  
  // Constants
  loaiSanPhams = LOAI_SAN_PHAM;

  // Computed values
  totalValue = computed(() => this.sanPhams().reduce((sum, sp) => sum + (sp.giaTienSanPham || 0), 0));
  avgPrice = computed(() => {
    const products = this.sanPhams();
    return products.length > 0 ? this.totalValue() / products.length : 0;
  });
  uniqueCategories = computed(() => new Set(this.sanPhams().map(sp => sp.loaiSanPham)).size);

  constructor(private sanPhamService: SanPhamService) {}

  ngOnInit() { this.loadSanPhams(); }

  loadSanPhams() {
    this.loading.set(true);
    this.sanPhamService.getAll().subscribe({
      next: (data) => {
        const products = Array.isArray(data) ? data : (data as any).data || [];
        this.sanPhams.set(products);
        this.applyFilters();
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading products:', err);
        this.showToast('Không thể tải danh sách sản phẩm', 'error');
        this.loading.set(false);
      }
    });
  }

  applyFilters() {
    let result = [...this.sanPhams()];
    
    // Search filter
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(sp => 
        sp.tenSanPham?.toLowerCase().includes(term) ||
        sp.maSanPham?.toLowerCase().includes(term) ||
        sp.loaiSanPham?.toLowerCase().includes(term)
      );
    }
    
    // Category filter
    if (this.selectedLoai) {
      result = result.filter(sp => sp.loaiSanPham === this.selectedLoai);
    }
    
    // Sorting
    this.sortProducts(result);
    
    this.filteredProducts.set(result);
    this.totalPages.set(Math.ceil(result.length / this.itemsPerPage) || 1);
    if (this.currentPage() > this.totalPages()) {
      this.currentPage.set(1);
    }
  }

  sortProducts(products?: SanPham[]) {
    const list = products || [...this.filteredProducts()];
    switch (this.sortBy) {
      case 'tenSanPham':
        list.sort((a, b) => (a.tenSanPham || '').localeCompare(b.tenSanPham || ''));
        break;
      case 'giaTienSanPham-asc':
        list.sort((a, b) => (a.giaTienSanPham || 0) - (b.giaTienSanPham || 0));
        break;
      case 'giaTienSanPham-desc':
        list.sort((a, b) => (b.giaTienSanPham || 0) - (a.giaTienSanPham || 0));
        break;
      case 'maSanPham':
        list.sort((a, b) => (a.maSanPham || '').localeCompare(b.maSanPham || ''));
        break;
    }
    if (!products) {
      this.filteredProducts.set(list);
    }
  }

  onSearch() { this.applyFilters(); }
  filterByLoai() { this.applyFilters(); }
  clearFilters() { this.searchTerm = ''; this.selectedLoai = ''; this.applyFilters(); }
  toggleView() { this.viewMode.update(v => v === 'grid' ? 'table' : 'grid'); }

  // Pagination
  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  getPageNumbers(): number[] {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: number[] = [];
    const maxVisible = 5;
    
    let start = Math.max(1, current - Math.floor(maxVisible / 2));
    let end = Math.min(total, start + maxVisible - 1);
    
    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  // Modal handlers
  openModal() {
    this.isEditing.set(false);
    this.formData = { maSanPham: '', tenSanPham: '', giaTienSanPham: 0, loaiSanPham: '', moTa: '' };
    this.formErrors = {};
    this.showModal.set(true);
  }

  editSanPham(sp: SanPham) {
    this.isEditing.set(true);
    this.formData = { 
      maSanPham: sp.maSanPham, 
      tenSanPham: sp.tenSanPham, 
      giaTienSanPham: sp.giaTienSanPham, 
      loaiSanPham: sp.loaiSanPham,
      moTa: sp.moTa || ''
    };
    this.formErrors = {};
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.formData = { maSanPham: '', tenSanPham: '', giaTienSanPham: 0, loaiSanPham: '' };
    this.formErrors = {};
  }

  viewDetail(sp: SanPham) {
    this.selectedSanPham.set(sp);
    this.showDetailModal.set(true);
  }

  closeDetailModal() {
    this.showDetailModal.set(false);
    this.selectedSanPham.set(null);
  }

  editFromDetail() {
    const sp = this.selectedSanPham();
    if (sp) {
      this.closeDetailModal();
      this.editSanPham(sp);
    }
  }

  deleteSanPham(sp: SanPham) {
    this.productToDelete = sp;
    this.showDeleteModal.set(true);
  }

  closeDeleteModal() {
    this.showDeleteModal.set(false);
    this.productToDelete = null;
  }

  confirmDelete() {
    if (this.productToDelete) {
      this.sanPhamService.delete(this.productToDelete.maSanPham).subscribe({
        next: () => {
          this.showToast(`Đã xóa sản phẩm ${this.productToDelete?.tenSanPham}`, 'success');
          this.closeDeleteModal();
          this.loadSanPhams();
        },
        error: (err) => {
          console.error('Error deleting product:', err);
          this.showToast('Không thể xóa sản phẩm. Vui lòng thử lại.', 'error');
        }
      });
    }
  }

  // Form validation
  validateForm() {
    this.formErrors = {};
    
    if (!this.formData.maSanPham || this.formData.maSanPham.length !== 5) {
      this.formErrors['maSanPham'] = 'Mã sản phẩm phải có đúng 5 ký tự';
    }
    if (!this.formData.tenSanPham || this.formData.tenSanPham.trim().length === 0) {
      this.formErrors['tenSanPham'] = 'Vui lòng nhập tên sản phẩm';
    }
    if (!this.formData.giaTienSanPham || this.formData.giaTienSanPham < 0) {
      this.formErrors['giaTienSanPham'] = 'Giá sản phẩm phải lớn hơn 0';
    }
  }

  isFormValid(): boolean {
    this.validateForm();
    return Object.keys(this.formErrors).length === 0 && 
           !!this.formData.maSanPham && 
           !!this.formData.tenSanPham && 
           this.formData.giaTienSanPham > 0;
  }

  saveSanPham() {
    if (!this.isFormValid()) return;

    const data: CreateSanPhamDto = {
      maSanPham: this.formData.maSanPham.toUpperCase(),
      tenSanPham: this.formData.tenSanPham.trim(),
      giaTienSanPham: Number(this.formData.giaTienSanPham),
      loaiSanPham: this.formData.loaiSanPham || 'Khác',
      moTa: this.formData.moTa?.trim()
    };

    const request = this.isEditing() 
      ? this.sanPhamService.update(this.formData.maSanPham, data)
      : this.sanPhamService.create(data);

    request.subscribe({
      next: () => {
        this.showToast(this.isEditing() ? 'Cập nhật sản phẩm thành công!' : 'Thêm sản phẩm mới thành công!', 'success');
        this.closeModal();
        this.loadSanPhams();
      },
      error: (err) => {
        console.error('Error saving product:', err);
        this.showToast('Không thể lưu sản phẩm. Vui lòng thử lại.', 'error');
      }
    });
  }

  // Utility functions
  formatCurrency(value: number): string {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0);
  }

  getCategoryColor(loaiSanPham: string): string {
    const loai = LOAI_SAN_PHAM.find(l => l.value === loaiSanPham);
    return loai?.color || '#6b7280';
  }

  getGradient(loaiSanPham: string): string {
    const color = this.getCategoryColor(loaiSanPham);
    return `linear-gradient(135deg, ${color}20 0%, ${color}40 100%)`;
  }

  showToast(message: string, type: 'success' | 'error' | 'info') {
    this.toast.set({ show: true, message, type });
    setTimeout(() => this.toast.set({ show: false, message: '', type: 'info' }), 3000);
  }
}
