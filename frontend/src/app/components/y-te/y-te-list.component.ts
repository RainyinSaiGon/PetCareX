import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { YTeService, ThuCungService, NhanVienService } from '../../services';
import { GiayKhamBenhTongQuat, GiayTiemPhong, Vaccine, ToaThuoc } from '../../models/y-te.model';
import { ThuCung } from '../../models/thu-cung.model';
import { NhanVien } from '../../models/nhan-vien.model';

interface KhamBenhUI extends GiayKhamBenhTongQuat { maPhieuKham?: number; createdAt?: Date; }
interface TiemPhongUI extends GiayTiemPhong { maPhieuTiem?: number; createdAt?: Date; }
interface FormErrors { [key: string]: string; }

@Component({
  selector: 'app-y-te-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div class="header-content">
          <h2>Dịch vụ Y tế</h2>
          <p class="subtitle">Quản lý khám bệnh, tiêm phòng và hồ sơ y tế</p>
        </div>
        <button class="btn-primary" (click)="openCreateModal()">
          <span>{{ activeTab() === 'kham-benh' ? '+ Tạo phiếu khám' : '+ Tạo phiếu tiêm' }}</span>
        </button>
      </div>

      <div class="tabs">
        <button class="tab" [class.active]="activeTab() === 'kham-benh'" (click)="setActiveTab('kham-benh')">
          Khám bệnh @if (khamBenhs().length) { <span class="tab-count">{{ khamBenhs().length }}</span> }
        </button>
        <button class="tab" [class.active]="activeTab() === 'tiem-phong'" (click)="setActiveTab('tiem-phong')">
          Tiêm phòng @if (tiemPhongs().length) { <span class="tab-count">{{ tiemPhongs().length }}</span> }
        </button>
        <button class="tab" [class.active]="activeTab() === 'toa-thuoc'" (click)="setActiveTab('toa-thuoc')">
          Toa thuốc @if (toaThuocs().length) { <span class="tab-count">{{ toaThuocs().length }}</span> }
        </button>
      </div>

      <div class="stats-grid">
        <div class="stat-card"><div class="stat-icon blue">KB</div><div class="stat-content"><span class="stat-value">{{ khamBenhs().length }}</span><span class="stat-label">Lượt khám</span></div></div>
        <div class="stat-card"><div class="stat-icon green">TP</div><div class="stat-content"><span class="stat-value">{{ tiemPhongs().length }}</span><span class="stat-label">Lượt tiêm</span></div></div>
        <div class="stat-card"><div class="stat-icon orange">TT</div><div class="stat-content"><span class="stat-value">{{ toaThuocs().length }}</span><span class="stat-label">Toa thuốc</span></div></div>
      </div>

      <div class="filters-section">
        <div class="search-box">
          <input type="text" [(ngModel)]="searchTerm" placeholder="Tìm kiếm...">
        </div>
        <button class="btn-filter" (click)="clearFilters()">Xóa lọc</button>
      </div>

      @if (activeTab() === 'kham-benh') {
        <div class="table-container">
          @if (loading()) {
            <div class="loading"><span class="spinner"></span><p>Đang tải...</p></div>
          } @else if (khamBenhs().length === 0) {
            <div class="empty-state"><h3>Chưa có hồ sơ khám bệnh</h3></div>
          } @else {
            <table>
              <thead><tr><th>Mã</th><th>Thú cưng</th><th>Nhiệt độ</th><th>Mô tả</th><th>Ngày khám</th><th>Thao tác</th></tr></thead>
              <tbody>
                @for (kb of khamBenhs(); track kb.maGiayKhamTongQuat || $index) {
                  <tr>
                    <td><span class="badge id">#{{ kb.maGiayKhamTongQuat }}</span></td>
                    <td><div class="pet-info"><span>{{ kb.thuCung?.tenThuCung || 'N/A' }}</span></div></td>
                    <td>@if (kb.nhietDo) { <span class="temp-badge" [class.warning]="kb.nhietDo > 39.5">{{ kb.nhietDo }}°C</span> } @else { -- }</td>
                    <td class="truncate">{{ kb.moTa || '--' }}</td>
                    <td>{{ formatDate(kb.ngayKham) }}</td>
                    <td><div class="actions"><button class="btn-icon" (click)="viewKhamDetail(kb)">Xem</button><button class="btn-icon" (click)="editKhamBenh(kb)">Sửa</button><button class="btn-icon delete" (click)="confirmDeleteKham(kb)">Xóa</button></div></td>
                  </tr>
                }
              </tbody>
            </table>
          }
        </div>
      }

      @if (activeTab() === 'tiem-phong') {
        <div class="table-container">
          @if (loadingTiemPhong()) {
            <div class="loading"><span class="spinner"></span><p>Đang tải...</p></div>
          } @else if (tiemPhongs().length === 0) {
            <div class="empty-state"><h3>Chưa có hồ sơ tiêm phòng</h3></div>
          } @else {
            <table>
              <thead><tr><th>Mã</th><th>Thú cưng</th><th>Vaccine</th><th>Liều</th><th>Ngày tiêm</th><th>Bác sĩ</th><th>Thao tác</th></tr></thead>
              <tbody>
                @for (tp of tiemPhongs(); track tp.maGiayTiem || $index) {
                  <tr>
                    <td><span class="badge id">#{{ tp.maGiayTiem }}</span></td>
                    <td><div class="pet-info"><span>{{ tp.thuCung?.tenThuCung || 'N/A' }}</span></div></td>
                    <td><span class="badge vaccine">{{ tp.vaccine?.tenVaccine || 'N/A' }}</span></td>
                    <td>{{ tp.lieuLuong ? tp.lieuLuong + ' ml' : '--' }}</td>
                    <td>{{ formatDate(tp.ngayTiem) }}</td>
                    <td>{{ tp.bacSi?.hoTen || 'N/A' }}</td>
                    <td><div class="actions"><button class="btn-icon" (click)="viewTiemDetail(tp)">Xem</button><button class="btn-icon" (click)="editTiemPhong(tp)">Sửa</button><button class="btn-icon delete" (click)="confirmDeleteTiem(tp)">Xóa</button></div></td>
                  </tr>
                }
              </tbody>
            </table>
          }
        </div>
      }

      @if (activeTab() === 'toa-thuoc') {
        <div class="table-container">
          @if (loadingToaThuoc()) {
            <div class="loading"><span class="spinner"></span><p>Đang tải...</p></div>
          } @else if (toaThuocs().length === 0) {
            <div class="empty-state"><h3>Chưa có toa thuốc</h3></div>
          } @else {
            <table>
              <thead><tr><th>Số toa</th><th>Thú cưng</th><th>Bác sĩ</th><th>Ngày kê</th><th>Thao tác</th></tr></thead>
              <tbody>
                @for (tt of toaThuocs(); track tt.soToaThuoc || $index) {
                  <tr>
                    <td><span class="badge id">{{ tt.soToaThuoc }}</span></td>
                    <td>{{ tt.thuCung?.tenThuCung || 'N/A' }}</td>
                    <td>{{ tt.bacSi?.hoTen || 'N/A' }}</td>
                    <td>{{ formatDate(tt.ngayKeDon) }}</td>
                    <td><div class="actions"><button class="btn-icon" (click)="viewToaThuocDetail(tt)">Xem</button></div></td>
                  </tr>
                }
              </tbody>
            </table>
          }
        </div>
      }

      @if (toastMessage()) {
        <div class="toast" [class.success]="toastType() === 'success'" [class.error]="toastType() === 'error'">
          <span>{{ toastMessage() }}</span>
        </div>
      }

      @if (showKhamDetailModal()) {
        <div class="modal-overlay" (click)="closeKhamDetailModal()">
          <div class="modal" (click)="$event.stopPropagation()">
            <div class="modal-header"><h3>Chi tiết khám bệnh</h3><button class="close-btn" (click)="closeKhamDetailModal()">×</button></div>
            <div class="modal-body">
              @if (selectedKhamBenh()) {
                <div class="detail-grid">
                  <div class="detail-item"><label>Mã phiếu</label><span>#{{ selectedKhamBenh()!.maGiayKhamTongQuat }}</span></div>
                  <div class="detail-item"><label>Ngày khám</label><span>{{ formatDate(selectedKhamBenh()!.ngayKham) }}</span></div>
                  <div class="detail-item"><label>Thú cưng</label><span>{{ selectedKhamBenh()!.thuCung?.tenThuCung || 'N/A' }}</span></div>
                  <div class="detail-item"><label>Nhiệt độ</label><span>{{ selectedKhamBenh()!.nhietDo ? selectedKhamBenh()!.nhietDo + '°C' : 'N/A' }}</span></div>
                </div>
                <div class="detail-full"><label>Mô tả</label><p>{{ selectedKhamBenh()!.moTa || 'Không có' }}</p></div>
              }
            </div>
            <div class="modal-footer"><button class="btn-secondary" (click)="closeKhamDetailModal()">Đóng</button></div>
          </div>
        </div>
      }

      @if (showTiemDetailModal()) {
        <div class="modal-overlay" (click)="closeTiemDetailModal()">
          <div class="modal" (click)="$event.stopPropagation()">
            <div class="modal-header"><h3>Chi tiết tiêm phòng</h3><button class="close-btn" (click)="closeTiemDetailModal()">×</button></div>
            <div class="modal-body">
              @if (selectedTiemPhong()) {
                <div class="detail-grid">
                  <div class="detail-item"><label>Mã phiếu</label><span>#{{ selectedTiemPhong()!.maGiayTiem }}</span></div>
                  <div class="detail-item"><label>Ngày tiêm</label><span>{{ formatDate(selectedTiemPhong()!.ngayTiem) }}</span></div>
                  <div class="detail-item"><label>Thú cưng</label><span>{{ selectedTiemPhong()!.thuCung?.tenThuCung || 'N/A' }}</span></div>
                  <div class="detail-item"><label>Vaccine</label><span>{{ selectedTiemPhong()!.vaccine?.tenVaccine || 'N/A' }}</span></div>
                  <div class="detail-item"><label>Liều lượng</label><span>{{ selectedTiemPhong()!.lieuLuong }} ml</span></div>
                  <div class="detail-item"><label>Bác sĩ</label><span>{{ selectedTiemPhong()!.bacSi?.hoTen || 'N/A' }}</span></div>
                </div>
              }
            </div>
            <div class="modal-footer"><button class="btn-secondary" (click)="closeTiemDetailModal()">Đóng</button></div>
          </div>
        </div>
      }

      @if (showToaThuocDetailModal()) {
        <div class="modal-overlay" (click)="closeToaThuocDetailModal()">
          <div class="modal" (click)="$event.stopPropagation()">
            <div class="modal-header"><h3>Chi tiết toa thuốc</h3><button class="close-btn" (click)="closeToaThuocDetailModal()">×</button></div>
            <div class="modal-body">
              @if (selectedToaThuoc()) {
                <div class="detail-grid">
                  <div class="detail-item"><label>Số toa</label><span>{{ selectedToaThuoc()!.soToaThuoc }}</span></div>
                  <div class="detail-item"><label>Ngày kê</label><span>{{ formatDate(selectedToaThuoc()!.ngayKeDon) }}</span></div>
                  <div class="detail-item"><label>Thú cưng</label><span>{{ selectedToaThuoc()!.thuCung?.tenThuCung || 'N/A' }}</span></div>
                  <div class="detail-item"><label>Bác sĩ</label><span>{{ selectedToaThuoc()!.bacSi?.hoTen || 'N/A' }}</span></div>
                </div>
              }
            </div>
            <div class="modal-footer"><button class="btn-secondary" (click)="closeToaThuocDetailModal()">Đóng</button></div>
          </div>
        </div>
      }

      @if (showKhamFormModal()) {
        <div class="modal-overlay" (click)="closeKhamFormModal()">
          <div class="modal" (click)="$event.stopPropagation()">
            <div class="modal-header"><h3>{{ editingKhamBenh() ? '✏️ Cập nhật' : '➕ Tạo phiếu khám' }}</h3><button class="close-btn" (click)="closeKhamFormModal()">✕</button></div>
            <div class="modal-body">
              <div class="form-group">
                <label>Thú cưng <span class="required">*</span></label>
                <select [(ngModel)]="khamBenhForm.maThuCung" class="form-control" [class.error]="formErrors['maThuCung']">
                  <option [ngValue]="undefined">-- Chọn thú cưng --</option>
                  @for (tc of thuCungs(); track tc.maThuCung) { <option [ngValue]="tc.maThuCung">{{ tc.tenThuCung }}</option> }
                </select>
                @if (formErrors['maThuCung']) { <span class="error-text">{{ formErrors['maThuCung'] }}</span> }
              </div>
              <div class="form-row">
                <div class="form-group"><label>Nhiệt độ (°C)</label><input type="number" step="0.1" [(ngModel)]="khamBenhForm.nhietDo" class="form-control"></div>
                <div class="form-group"><label>Ngày khám</label><input type="date" [(ngModel)]="khamBenhForm.ngayKham" class="form-control"></div>
              </div>
              <div class="form-group"><label>Mô tả</label><textarea [(ngModel)]="khamBenhForm.moTa" class="form-control" rows="3"></textarea></div>
            </div>
            <div class="modal-footer">
              <button class="btn-secondary" (click)="closeKhamFormModal()">Hủy</button>
              <button class="btn-primary" (click)="saveKhamBenh()" [disabled]="savingKham()">{{ savingKham() ? 'Đang lưu...' : 'Lưu' }}</button>
            </div>
          </div>
        </div>
      }

      @if (showTiemFormModal()) {
        <div class="modal-overlay" (click)="closeTiemFormModal()">
          <div class="modal" (click)="$event.stopPropagation()">
            <div class="modal-header"><h3>{{ editingTiemPhong() ? '✏️ Cập nhật' : '➕ Tạo phiếu tiêm' }}</h3><button class="close-btn" (click)="closeTiemFormModal()">✕</button></div>
            <div class="modal-body">
              <div class="form-row">
                <div class="form-group">
                  <label>Thú cưng <span class="required">*</span></label>
                  <select [(ngModel)]="tiemPhongForm.maThuCung" class="form-control" [class.error]="formErrors['maThuCung']">
                    <option [ngValue]="undefined">-- Chọn --</option>
                    @for (tc of thuCungs(); track tc.maThuCung) { <option [ngValue]="tc.maThuCung">{{ tc.tenThuCung }}</option> }
                  </select>
                </div>
                <div class="form-group">
                  <label>Vaccine <span class="required">*</span></label>
                  <select [(ngModel)]="tiemPhongForm.maVaccine" class="form-control" [class.error]="formErrors['maVaccine']">
                    <option value="">-- Chọn --</option>
                    @for (vc of vaccines(); track vc.maVaccine) { <option [value]="vc.maVaccine">{{ vc.tenVaccine }}</option> }
                  </select>
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Bác sĩ <span class="required">*</span></label>
                  <select [(ngModel)]="tiemPhongForm.maBacSi" class="form-control" [class.error]="formErrors['maBacSi']">
                    <option value="">-- Chọn --</option>
                    @for (bs of bacSis(); track bs.maNhanVien) { <option [value]="bs.maNhanVien">{{ bs.hoTen }}</option> }
                  </select>
                </div>
                <div class="form-group"><label>Liều lượng (ml)</label><input type="number" step="0.1" [(ngModel)]="tiemPhongForm.lieuLuong" class="form-control"></div>
              </div>
              <div class="form-group"><label>Ngày tiêm</label><input type="date" [(ngModel)]="tiemPhongForm.ngayTiem" class="form-control"></div>
            </div>
            <div class="modal-footer">
              <button class="btn-secondary" (click)="closeTiemFormModal()">Hủy</button>
              <button class="btn-primary" (click)="saveTiemPhong()" [disabled]="savingTiem()">{{ savingTiem() ? 'Đang lưu...' : 'Lưu' }}</button>
            </div>
          </div>
        </div>
      }

      @if (showDeleteModal()) {
        <div class="modal-overlay" (click)="closeDeleteModal()">
          <div class="modal" (click)="$event.stopPropagation()">
            <div class="modal-header danger"><h3>⚠️ Xác nhận xóa</h3><button class="close-btn" (click)="closeDeleteModal()">✕</button></div>
            <div class="modal-body"><div class="confirm-content"><span class="confirm-icon">🗑️</span><p>Bạn có chắc chắn muốn xóa?</p><p class="warning-text">Hành động này không thể hoàn tác.</p></div></div>
            <div class="modal-footer"><button class="btn-secondary" (click)="closeDeleteModal()">Hủy</button><button class="btn-danger" (click)="confirmDelete()" [disabled]="deleting()">{{ deleting() ? 'Đang xóa...' : 'Xóa' }}</button></div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .page-container { animation: fadeIn 0.3s ease; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
    .page-header h2 { margin: 0; font-size: 24px; color: #1a1f3c; }
    .subtitle { margin: 4px 0 0; color: #64748b; font-size: 14px; }
    .btn-primary { display: flex; align-items: center; gap: 8px; padding: 12px 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 10px; cursor: pointer; font-weight: 500; }
    .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4); }
    .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
    .tabs { display: flex; gap: 8px; margin-bottom: 24px; flex-wrap: wrap; }
    .tab { padding: 12px 20px; background: white; border: none; border-radius: 10px; cursor: pointer; font-weight: 500; color: #64748b; box-shadow: 0 2px 10px rgba(0,0,0,0.05); display: flex; align-items: center; gap: 8px; }
    .tab:hover { background: #f8fafc; }
    .tab.active { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
    .tab-count { background: rgba(255,255,255,0.2); padding: 2px 8px; border-radius: 20px; font-size: 12px; }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px; }
    .stat-card { background: white; border-radius: 12px; padding: 20px; display: flex; align-items: center; gap: 16px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
    .stat-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 24px; }
    .stat-icon.blue { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
    .stat-icon.green { background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); }
    .stat-icon.orange { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }
    .stat-value { font-size: 24px; font-weight: 700; color: #1a1f3c; display: block; }
    .stat-label { font-size: 13px; color: #64748b; }
    .filters-section { display: flex; gap: 16px; margin-bottom: 24px; flex-wrap: wrap; }
    .search-box { flex: 1; min-width: 250px; position: relative; background: white; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
    .search-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); }
    .search-box input { width: 100%; padding: 12px 12px 12px 42px; border: none; border-radius: 10px; font-size: 14px; outline: none; box-sizing: border-box; }
    .btn-filter { padding: 12px 16px; background: #f1f5f9; border: none; border-radius: 10px; cursor: pointer; font-size: 14px; }
    .table-container { background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
    table { width: 100%; border-collapse: collapse; }
    th { background: #f8fafc; padding: 14px 16px; text-align: left; font-weight: 600; color: #475569; font-size: 13px; }
    td { padding: 14px 16px; border-top: 1px solid #f1f5f9; }
    tr:hover { background: #fafbfc; }
    .truncate { max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .pet-info { display: flex; align-items: center; gap: 8px; }
    .badge { padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 500; }
    .badge.id { background: #f1f5f9; color: #64748b; }
    .badge.vaccine { background: #dbeafe; color: #1d4ed8; }
    .temp-badge { padding: 4px 10px; border-radius: 6px; font-size: 12px; background: #d1fae5; color: #059669; }
    .temp-badge.warning { background: #fef3c7; color: #d97706; }
    .actions { display: flex; gap: 8px; }
    .btn-icon { padding: 6px 10px; background: #f8fafc; border: none; border-radius: 8px; cursor: pointer; }
    .btn-icon:hover { background: #e2e8f0; }
    .btn-icon.delete:hover { background: #fee2e2; }
    .loading, .empty-state { padding: 60px; text-align: center; color: #64748b; }
    .spinner { width: 40px; height: 40px; border: 3px solid #e2e8f0; border-top-color: #667eea; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 16px; display: block; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .empty-icon { font-size: 48px; display: block; margin-bottom: 16px; }
    .toast { position: fixed; bottom: 24px; right: 24px; padding: 16px 24px; border-radius: 12px; color: white; font-weight: 500; z-index: 2000; display: flex; align-items: center; gap: 10px; }
    .toast.success { background: linear-gradient(135deg, #10b981 0%, #059669 100%); }
    .toast.error { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); }
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal { background: white; border-radius: 16px; width: 90%; max-width: 600px; max-height: 90vh; overflow-y: auto; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid #f1f5f9; }
    .modal-header.danger { background: #fef2f2; }
    .modal-header h3 { margin: 0; font-size: 18px; color: #1a1f3c; }
    .close-btn { background: none; border: none; font-size: 20px; cursor: pointer; color: #64748b; }
    .modal-body { padding: 24px; }
    .modal-footer { display: flex; justify-content: flex-end; gap: 12px; padding: 16px 24px; border-top: 1px solid #f1f5f9; }
    .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .detail-item label { display: block; font-size: 11px; color: #64748b; margin-bottom: 4px; text-transform: uppercase; }
    .detail-item span { font-size: 14px; color: #1a1f3c; font-weight: 500; }
    .detail-full { margin-top: 16px; }
    .detail-full label { display: block; font-size: 11px; color: #64748b; margin-bottom: 4px; text-transform: uppercase; }
    .detail-full p { margin: 0; padding: 12px; background: #f8fafc; border-radius: 8px; }
    .form-group { margin-bottom: 16px; }
    .form-group label { display: block; margin-bottom: 6px; font-weight: 500; color: #374151; font-size: 14px; }
    .required { color: #ef4444; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .form-control { width: 100%; padding: 10px 14px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box; }
    .form-control:focus { outline: none; border-color: #667eea; }
    .form-control.error { border-color: #ef4444; }
    .error-text { color: #ef4444; font-size: 12px; margin-top: 4px; }
    textarea.form-control { resize: vertical; min-height: 80px; }
    .btn-secondary { padding: 10px 20px; background: #f1f5f9; color: #475569; border: none; border-radius: 10px; cursor: pointer; font-weight: 500; }
    .btn-danger { padding: 10px 20px; background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; border: none; border-radius: 10px; cursor: pointer; font-weight: 500; }
    .btn-danger:disabled { opacity: 0.6; cursor: not-allowed; }
    .confirm-content { text-align: center; padding: 20px 0; }
    .confirm-icon { font-size: 48px; display: block; margin-bottom: 16px; }
    .warning-text { color: #dc2626; font-size: 14px; }
    @media (max-width: 768px) { .page-header { flex-direction: column; gap: 16px; } .form-row { grid-template-columns: 1fr; } .detail-grid { grid-template-columns: 1fr; } }
  `]
})
export class YTeListComponent implements OnInit {
  private yTeService = inject(YTeService);
  private thuCungService = inject(ThuCungService);
  private nhanVienService = inject(NhanVienService);

  activeTab = signal<'kham-benh' | 'tiem-phong' | 'toa-thuoc'>('kham-benh');
  khamBenhs = signal<KhamBenhUI[]>([]);
  tiemPhongs = signal<TiemPhongUI[]>([]);
  toaThuocs = signal<ToaThuoc[]>([]);
  thuCungs = signal<ThuCung[]>([]);
  vaccines = signal<Vaccine[]>([]);
  bacSis = signal<NhanVien[]>([]);

  loading = signal(true);
  loadingTiemPhong = signal(true);
  loadingToaThuoc = signal(true);
  savingKham = signal(false);
  savingTiem = signal(false);
  deleting = signal(false);

  searchTerm = '';

  showKhamDetailModal = signal(false);
  showTiemDetailModal = signal(false);
  showToaThuocDetailModal = signal(false);
  showKhamFormModal = signal(false);
  showTiemFormModal = signal(false);
  showDeleteModal = signal(false);

  selectedKhamBenh = signal<KhamBenhUI | null>(null);
  selectedTiemPhong = signal<TiemPhongUI | null>(null);
  selectedToaThuoc = signal<ToaThuoc | null>(null);
  editingKhamBenh = signal<KhamBenhUI | null>(null);
  editingTiemPhong = signal<TiemPhongUI | null>(null);
  deleteTarget = signal<KhamBenhUI | TiemPhongUI | null>(null);
  deleteType = signal<'kham' | 'tiem'>('kham');

  khamBenhForm: Partial<KhamBenhUI> = {};
  tiemPhongForm: Partial<TiemPhongUI & { maThuCung?: number }> = {};
  formErrors: FormErrors = {};

  toastMessage = signal('');
  toastType = signal<'success' | 'error'>('success');

  ngOnInit() { this.loadAllData(); this.loadReferenceData(); }

  loadAllData() { this.loadKhamBenhs(); this.loadTiemPhongs(); this.loadToaThuocs(); }

  loadReferenceData() {
    this.thuCungService.getAll().subscribe({ next: (d) => this.thuCungs.set(Array.isArray(d) ? d : []), error: () => {} });
    this.yTeService.getAllVaccines().subscribe({ next: (d) => this.vaccines.set(Array.isArray(d) ? d : []), error: () => {} });
    this.nhanVienService.getAll().subscribe({ next: (d) => this.bacSis.set(Array.isArray(d) ? d : []), error: () => {} });
  }

  setActiveTab(tab: 'kham-benh' | 'tiem-phong' | 'toa-thuoc') { this.activeTab.set(tab); }

  loadKhamBenhs() {
    this.loading.set(true);
    this.yTeService.getAllKhamTongQuat().subscribe({
      next: (r: any) => { this.khamBenhs.set(Array.isArray(r) ? r : r.data || []); this.loading.set(false); },
      error: () => { this.khamBenhs.set([]); this.loading.set(false); }
    });
  }

  loadTiemPhongs() {
    this.loadingTiemPhong.set(true);
    this.yTeService.getAllTiemPhong().subscribe({
      next: (r: any) => { this.tiemPhongs.set(Array.isArray(r) ? r : r.data || []); this.loadingTiemPhong.set(false); },
      error: () => { this.tiemPhongs.set([]); this.loadingTiemPhong.set(false); }
    });
  }

  loadToaThuocs() {
    this.loadingToaThuoc.set(true);
    this.yTeService.getAllToaThuoc().subscribe({
      next: (r: any) => { this.toaThuocs.set(Array.isArray(r) ? r : r.data || []); this.loadingToaThuoc.set(false); },
      error: () => { this.toaThuocs.set([]); this.loadingToaThuoc.set(false); }
    });
  }

  clearFilters() { this.searchTerm = ''; }

  viewKhamDetail(kb: KhamBenhUI) { this.selectedKhamBenh.set(kb); this.showKhamDetailModal.set(true); }
  closeKhamDetailModal() { this.showKhamDetailModal.set(false); this.selectedKhamBenh.set(null); }
  viewTiemDetail(tp: TiemPhongUI) { this.selectedTiemPhong.set(tp); this.showTiemDetailModal.set(true); }
  closeTiemDetailModal() { this.showTiemDetailModal.set(false); this.selectedTiemPhong.set(null); }
  viewToaThuocDetail(tt: ToaThuoc) { this.selectedToaThuoc.set(tt); this.showToaThuocDetailModal.set(true); }
  closeToaThuocDetailModal() { this.showToaThuocDetailModal.set(false); this.selectedToaThuoc.set(null); }

  openCreateModal() {
    if (this.activeTab() === 'kham-benh') {
      this.editingKhamBenh.set(null); this.khamBenhForm = {}; this.formErrors = {}; this.showKhamFormModal.set(true);
    } else if (this.activeTab() === 'tiem-phong') {
      this.editingTiemPhong.set(null); this.tiemPhongForm = {}; this.formErrors = {}; this.showTiemFormModal.set(true);
    }
  }

  editKhamBenh(kb: KhamBenhUI) { this.editingKhamBenh.set(kb); this.khamBenhForm = { ...kb, maThuCung: kb.thuCung?.maThuCung || kb.maThuCung }; this.formErrors = {}; this.showKhamFormModal.set(true); }
  editTiemPhong(tp: TiemPhongUI) { this.editingTiemPhong.set(tp); this.tiemPhongForm = { ...tp, maThuCung: tp.thuCung?.maThuCung }; this.formErrors = {}; this.showTiemFormModal.set(true); }
  closeKhamFormModal() { this.showKhamFormModal.set(false); this.editingKhamBenh.set(null); this.khamBenhForm = {}; }
  closeTiemFormModal() { this.showTiemFormModal.set(false); this.editingTiemPhong.set(null); this.tiemPhongForm = {}; }

  saveKhamBenh() {
    this.formErrors = {};
    if (!this.khamBenhForm.maThuCung) { this.formErrors['maThuCung'] = 'Vui lòng chọn thú cưng'; return; }
    this.savingKham.set(true);
    const data = { nhietDo: this.khamBenhForm.nhietDo, moTa: this.khamBenhForm.moTa, maThuCung: this.khamBenhForm.maThuCung };
    const op = this.editingKhamBenh() ? this.yTeService.updateKhamTongQuat(this.editingKhamBenh()!.maGiayKhamTongQuat!, data) : this.yTeService.createKhamTongQuat(data);
    op.subscribe({
      next: () => { this.showToast(this.editingKhamBenh() ? 'Cập nhật thành công!' : 'Tạo thành công!', 'success'); this.closeKhamFormModal(); this.loadKhamBenhs(); },
      error: (e) => this.showToast('Lỗi: ' + (e.error?.message || 'Thử lại'), 'error'),
      complete: () => this.savingKham.set(false)
    });
  }

  saveTiemPhong() {
    this.formErrors = {};
    if (!this.tiemPhongForm.maThuCung) { this.formErrors['maThuCung'] = 'Chọn thú cưng'; return; }
    if (!this.tiemPhongForm.maVaccine) { this.formErrors['maVaccine'] = 'Chọn vaccine'; return; }
    if (!this.tiemPhongForm.maBacSi) { this.formErrors['maBacSi'] = 'Chọn bác sĩ'; return; }
    this.savingTiem.set(true);
    const ngayTiemStr = this.tiemPhongForm.ngayTiem ? (typeof this.tiemPhongForm.ngayTiem === 'string' ? this.tiemPhongForm.ngayTiem : new Date(this.tiemPhongForm.ngayTiem).toISOString().split('T')[0]) : undefined;
    const data = { maVaccine: this.tiemPhongForm.maVaccine!, maBacSi: this.tiemPhongForm.maBacSi!, lieuLuong: this.tiemPhongForm.lieuLuong, ngayTiem: ngayTiemStr, maGiayKhamTongQuat: 0 };
    const op = this.editingTiemPhong() ? this.yTeService.updateTiemPhong(this.editingTiemPhong()!.maGiayTiem!, data) : this.yTeService.createTiemPhong(data);
    op.subscribe({
      next: () => { this.showToast(this.editingTiemPhong() ? 'Cập nhật thành công!' : 'Tạo thành công!', 'success'); this.closeTiemFormModal(); this.loadTiemPhongs(); },
      error: (e) => this.showToast('Lỗi: ' + (e.error?.message || 'Thử lại'), 'error'),
      complete: () => this.savingTiem.set(false)
    });
  }

  confirmDeleteKham(kb: KhamBenhUI) { this.deleteTarget.set(kb); this.deleteType.set('kham'); this.showDeleteModal.set(true); }
  confirmDeleteTiem(tp: TiemPhongUI) { this.deleteTarget.set(tp); this.deleteType.set('tiem'); this.showDeleteModal.set(true); }
  closeDeleteModal() { this.showDeleteModal.set(false); this.deleteTarget.set(null); }

  confirmDelete() {
    const target = this.deleteTarget(); if (!target) return;
    this.deleting.set(true);
    if (this.deleteType() === 'kham') {
      this.yTeService.deleteKhamTongQuat((target as KhamBenhUI).maGiayKhamTongQuat!).subscribe({
        next: () => { this.showToast('Xóa thành công!', 'success'); this.closeDeleteModal(); this.loadKhamBenhs(); },
        error: (e) => this.showToast('Lỗi: ' + (e.error?.message || 'Thử lại'), 'error'),
        complete: () => this.deleting.set(false)
      });
    } else {
      this.yTeService.deleteTiemPhong((target as TiemPhongUI).maGiayTiem!).subscribe({
        next: () => { this.showToast('Xóa thành công!', 'success'); this.closeDeleteModal(); this.loadTiemPhongs(); },
        error: (e) => this.showToast('Lỗi: ' + (e.error?.message || 'Thử lại'), 'error'),
        complete: () => this.deleting.set(false)
      });
    }
  }

  formatDate(date: Date | string | undefined): string { return date ? new Date(date).toLocaleDateString('vi-VN') : 'N/A'; }
  showToast(message: string, type: 'success' | 'error') { this.toastMessage.set(message); this.toastType.set(type); setTimeout(() => this.toastMessage.set(''), 3000); }
}
