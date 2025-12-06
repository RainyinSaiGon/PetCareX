import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NhanVienService, ChiNhanhService } from '../../services';

@Component({
  selector: 'app-nhan-vien-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-6 space-y-6 animate-fade-in">
      <!-- Page Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 class="text-2xl font-bold text-slate-800">Quản lý nhân viên</h2>
          <p class="text-slate-500 text-sm mt-1">Quản lý thông tin nhân viên và bác sĩ</p>
        </div>
        <button 
          class="inline-flex items-center justify-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all shadow-sm hover:shadow-md"
          (click)="openModal()"
        >
          <span class="mr-2 text-lg">+</span> Thêm nhân viên
        </button>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-white rounded-xl p-6 shadow-sm border border-slate-100 flex items-center gap-4 transition-transform hover:-translate-y-1">
          <div class="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-xl">NV</div>
          <div>
            <span class="block text-2xl font-bold text-slate-800">{{ totalNhanVien() }}</span>
            <span class="text-sm text-slate-500">Tổng nhân viên</span>
          </div>
        </div>
        <div class="bg-white rounded-xl p-6 shadow-sm border border-slate-100 flex items-center gap-4 transition-transform hover:-translate-y-1">
          <div class="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-green-600 font-bold text-xl">BS</div>
          <div>
            <span class="block text-2xl font-bold text-slate-800">{{ totalBacSi() }}</span>
            <span class="text-sm text-slate-500">Bác sĩ</span>
          </div>
        </div>
        <div class="bg-white rounded-xl p-6 shadow-sm border border-slate-100 flex items-center gap-4 transition-transform hover:-translate-y-1">
          <div class="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 font-bold text-xl">LNV</div>
          <div>
            <span class="block text-2xl font-bold text-slate-800">{{ loaiNhanViens().length }}</span>
            <span class="text-sm text-slate-500">Loại nhân viên</span>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4">
        <div class="flex-1 relative">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span class="text-slate-400">🔍</span>
          </div>
          <input 
            type="text" 
            [(ngModel)]="searchTerm" 
            (ngModelChange)="onSearch()"
            class="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-shadow"
            placeholder="Tìm kiếm theo tên, email, SĐT..."
          >
        </div>
        <div class="flex gap-4">
          <select 
            [(ngModel)]="selectedLoai" 
            (ngModelChange)="loadNhanViens()"
            class="block w-full pl-3 pr-10 py-2 text-base border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-lg"
          >
            <option value="">Tất cả loại nhân viên</option>
            @for (loai of loaiNhanViens(); track loai.maLoaiNhanVien) {
              <option [value]="loai.maLoaiNhanVien">{{ loai.tenLoai }}</option>
            }
          </select>
          <select 
            [(ngModel)]="selectedChiNhanh" 
            (ngModelChange)="loadNhanViens()"
            class="block w-full pl-3 pr-10 py-2 text-base border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-lg"
          >
            <option value="">Tất cả chi nhánh</option>
            @for (cn of chiNhanhs; track cn.maChiNhanh) {
              <option [value]="cn.maChiNhanh">{{ cn.tenChiNhanh }}</option>
            }
          </select>
        </div>
      </div>

      <!-- Table -->
      <div class="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        @if (loading()) {
          <div class="p-12 text-center">
            <div class="inline-block w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
            <p class="text-slate-500">Đang tải dữ liệu...</p>
          </div>
        } @else if (nhanViens().length === 0) {
          <div class="p-12 text-center">
            <p class="text-slate-500 text-lg mb-2">Chưa có nhân viên</p>
            <p class="text-slate-400 text-sm">Bắt đầu thêm nhân viên mới để quản lý.</p>
          </div>
        } @else {
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-slate-200">
              <thead class="bg-slate-50">
                <tr>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Mã NV</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Họ tên</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Email</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Điện thoại</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Loại NV</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Chi nhánh</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Ngày vào làm</th>
                  <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Thao tác</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-slate-200">
                @for (nv of nhanViens(); track nv.maNhanVien) {
                  <tr class="hover:bg-slate-50 transition-colors">
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      <span class="px-2 py-1 bg-slate-100 rounded text-xs font-mono">{{ nv.maNhanVien }}</span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="flex items-center">
                        <div class="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                          {{ getInitials(nv.hoTen) }}
                        </div>
                        <div class="ml-3">
                          <div class="text-sm font-medium text-slate-900">{{ nv.hoTen }}</div>
                        </div>
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{{ nv.email }}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{{ nv.soDienThoai }}</td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span 
                        class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                        [class.bg-green-100]="nv.loaiNhanVien?.tenLoai?.includes('Bác sĩ')"
                        [class.text-green-800]="nv.loaiNhanVien?.tenLoai?.includes('Bác sĩ')"
                        [class.bg-blue-100]="!nv.loaiNhanVien?.tenLoai?.includes('Bác sĩ')"
                        [class.text-blue-800]="!nv.loaiNhanVien?.tenLoai?.includes('Bác sĩ')"
                      >
                        {{ nv.loaiNhanVien?.tenLoai || 'N/A' }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{{ nv.chiNhanh?.tenChiNhanh || 'N/A' }}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{{ formatDate(nv.ngayVaoLam) }}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div class="flex justify-end gap-2">
                        <button class="text-indigo-600 hover:text-indigo-900 p-1 hover:bg-indigo-50 rounded" title="Xem chi tiết" (click)="viewDetail(nv)">Xem</button>
                        <button class="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded" title="Sửa" (click)="editNhanVien(nv)">Sửa</button>
                        <button class="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded" title="Xóa" (click)="deleteNhanVien(nv)">Xóa</button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>

      <!-- Pagination -->
      @if (totalPages() > 1) {
        <div class="flex justify-center items-center gap-4 mt-6">
          <button 
            [disabled]="currentPage() === 1" 
            (click)="goToPage(currentPage() - 1)"
            class="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Trước
          </button>
          <span class="text-sm text-slate-600">Trang {{ currentPage() }} / {{ totalPages() }}</span>
          <button 
            [disabled]="currentPage() === totalPages()" 
            (click)="goToPage(currentPage() + 1)"
            class="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Sau
          </button>
        </div>
      }

      <!-- Modal -->
      @if (showModal()) {
        <div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in" (click)="closeModal()">
          <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" (click)="$event.stopPropagation()">
            <div class="flex justify-between items-center p-6 border-b border-slate-100">
              <h3 class="text-xl font-bold text-slate-800">{{ isEditing() ? 'Sửa thông tin nhân viên' : 'Thêm nhân viên mới' }}</h3>
              <button class="text-slate-400 hover:text-slate-600 transition-colors text-2xl leading-none" (click)="closeModal()">×</button>
            </div>
            <div class="p-6 space-y-4">
              <div class="space-y-1">
                <label class="block text-sm font-medium text-slate-700">Họ tên <span class="text-red-500">*</span></label>
                <input type="text" [(ngModel)]="formData.hoTen" class="block w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2.5 px-3 border" placeholder="Nhập họ tên">
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-1">
                  <label class="block text-sm font-medium text-slate-700">Email <span class="text-red-500">*</span></label>
                  <input type="email" [(ngModel)]="formData.email" class="block w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2.5 px-3 border" placeholder="Nhập email">
                </div>
                <div class="space-y-1">
                  <label class="block text-sm font-medium text-slate-700">Số điện thoại <span class="text-red-500">*</span></label>
                  <input type="text" [(ngModel)]="formData.soDienThoai" class="block w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2.5 px-3 border" placeholder="Nhập SĐT">
                </div>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-1">
                  <label class="block text-sm font-medium text-slate-700">CCCD</label>
                  <input type="text" [(ngModel)]="formData.cccd" class="block w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2.5 px-3 border" placeholder="Nhập CCCD">
                </div>
                <div class="space-y-1">
                  <label class="block text-sm font-medium text-slate-700">Ngày sinh</label>
                  <input type="date" [(ngModel)]="formData.ngaySinh" class="block w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2.5 px-3 border">
                </div>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-1">
                  <label class="block text-sm font-medium text-slate-700">Loại nhân viên <span class="text-red-500">*</span></label>
                  <select [(ngModel)]="formData.maLoaiNhanVien" class="block w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2.5 px-3 border">
                    <option value="">Chọn loại nhân viên</option>
                    @for (loai of loaiNhanViens(); track loai.maLoaiNhanVien) {
                      <option [value]="loai.maLoaiNhanVien">{{ loai.tenLoai }}</option>
                    }
                  </select>
                </div>
                <div class="space-y-1">
                  <label class="block text-sm font-medium text-slate-700">Chi nhánh <span class="text-red-500">*</span></label>
                  <select [(ngModel)]="formData.maChiNhanh" class="block w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2.5 px-3 border">
                    <option value="">Chọn chi nhánh</option>
                    @for (cn of chiNhanhs; track cn.maChiNhanh) {
                      <option [value]="cn.maChiNhanh">{{ cn.tenChiNhanh }}</option>
                    }
                  </select>
                </div>
              </div>
              <div class="space-y-1">
                <label class="block text-sm font-medium text-slate-700">Địa chỉ</label>
                <input type="text" [(ngModel)]="formData.diaChi" class="block w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2.5 px-3 border" placeholder="Nhập địa chỉ">
              </div>
              @if (!isEditing()) {
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg border border-slate-100">
                  <div class="space-y-1">
                    <label class="block text-sm font-medium text-slate-700">Tên tài khoản <span class="text-red-500">*</span></label>
                    <input type="text" [(ngModel)]="formData.tenTaiKhoan" class="block w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2.5 px-3 border" placeholder="Nhập tên tài khoản">
                  </div>
                  <div class="space-y-1">
                    <label class="block text-sm font-medium text-slate-700">Mật khẩu <span class="text-red-500">*</span></label>
                    <input type="password" [(ngModel)]="formData.matKhau" class="block w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2.5 px-3 border" placeholder="Nhập mật khẩu">
                  </div>
                </div>
              }
            </div>
            <div class="flex justify-end gap-3 p-6 border-t border-slate-100 bg-slate-50 rounded-b-2xl">
              <button class="px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-medium transition-colors" (click)="closeModal()">Hủy</button>
              <button class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium shadow-sm transition-colors" (click)="saveNhanVien()">
                {{ isEditing() ? 'Cập nhật' : 'Thêm mới' }}
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Detail Modal -->
      @if (showDetailModal()) {
        <div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in" (click)="closeDetailModal()">
          <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl" (click)="$event.stopPropagation()">
            <div class="flex justify-between items-center p-6 border-b border-slate-100">
              <h3 class="text-xl font-bold text-slate-800">Chi tiết nhân viên</h3>
              <button class="text-slate-400 hover:text-slate-600 transition-colors text-2xl leading-none" (click)="closeDetailModal()">×</button>
            </div>
            <div class="p-6">
              @if (selectedNhanVien()) {
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div class="space-y-1">
                    <label class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Mã nhân viên</label>
                    <p class="text-slate-900 font-medium">{{ selectedNhanVien()!.maNhanVien }}</p>
                  </div>
                  <div class="space-y-1">
                    <label class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Họ tên</label>
                    <p class="text-slate-900 font-medium">{{ selectedNhanVien()!.hoTen }}</p>
                  </div>
                  <div class="space-y-1">
                    <label class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</label>
                    <p class="text-slate-900 font-medium">{{ selectedNhanVien()!.email }}</p>
                  </div>
                  <div class="space-y-1">
                    <label class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Số điện thoại</label>
                    <p class="text-slate-900 font-medium">{{ selectedNhanVien()!.soDienThoai }}</p>
                  </div>
                  <div class="space-y-1">
                    <label class="text-xs font-semibold text-slate-500 uppercase tracking-wider">CCCD</label>
                    <p class="text-slate-900 font-medium">{{ selectedNhanVien()!.cccd || 'N/A' }}</p>
                  </div>
                  <div class="space-y-1">
                    <label class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Ngày sinh</label>
                    <p class="text-slate-900 font-medium">{{ formatDate(selectedNhanVien()!.ngaySinh) }}</p>
                  </div>
                  <div class="space-y-1 md:col-span-2">
                    <label class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Địa chỉ</label>
                    <p class="text-slate-900 font-medium">{{ selectedNhanVien()!.diaChi || 'N/A' }}</p>
                  </div>
                  <div class="space-y-1">
                    <label class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Loại nhân viên</label>
                    <p class="text-slate-900 font-medium">{{ selectedNhanVien()!.loaiNhanVien?.tenLoai || 'N/A' }}</p>
                  </div>
                  <div class="space-y-1">
                    <label class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Chi nhánh</label>
                    <p class="text-slate-900 font-medium">{{ selectedNhanVien()!.chiNhanh?.tenChiNhanh || 'N/A' }}</p>
                  </div>
                  <div class="space-y-1">
                    <label class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Ngày vào làm</label>
                    <p class="text-slate-900 font-medium">{{ formatDate(selectedNhanVien()!.ngayVaoLam) }}</p>
                  </div>
                </div>
              }
            </div>
            <div class="flex justify-end p-6 border-t border-slate-100 bg-slate-50 rounded-b-2xl">
              <button class="px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-medium transition-colors" (click)="closeDetailModal()">Đóng</button>
            </div>
          </div>
        </div>
      }

      <!-- Delete Confirmation Modal -->
      @if (showDeleteModal()) {
        <div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in" (click)="closeDeleteModal()">
          <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md" (click)="$event.stopPropagation()">
            <div class="p-6 text-center">
              <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span class="text-red-600 text-2xl font-bold">!</span>
              </div>
              <h3 class="text-xl font-bold text-slate-800 mb-2">Xác nhận xóa</h3>
              <p class="text-slate-600 mb-6">Bạn có chắc chắn muốn xóa nhân viên <strong class="text-slate-900">{{ deleteTarget()?.hoTen }}</strong>?<br><span class="text-red-500 text-sm">Hành động này không thể hoàn tác!</span></p>
              
              <div class="flex justify-center gap-3">
                <button class="px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-medium transition-colors" (click)="closeDeleteModal()">Hủy</button>
                <button 
                  class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
                  (click)="confirmDelete()" 
                  [disabled]="deleting()"
                >
                  {{ deleting() ? 'Đang xóa...' : 'Xóa nhân viên' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      }

      <!-- Toast -->
      @if (toast()) {
        <div 
          class="fixed bottom-6 right-6 px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 z-50 animate-slide-in"
          [class.bg-emerald-600]="toast()?.type === 'success'"
          [class.bg-red-600]="toast()?.type === 'error'"
        >
          <span class="text-white font-medium">{{ toast()?.message }}</span>
        </div>
      }
    </div>
  `,
  styles: [`
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in {
      animation: fadeIn 0.3s ease-out forwards;
    }
    
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    .animate-slide-in {
      animation: slideIn 0.3s ease-out forwards;
    }
  `]
})
export class NhanVienListComponent implements OnInit {
  nhanViens = signal<any[]>([]);
  loaiNhanViens = signal<any[]>([]);
  loading = signal(true);
  showModal = signal(false);
  showDetailModal = signal(false);
  showDeleteModal = signal(false);
  isEditing = signal(false);
  selectedNhanVien = signal<any>(null);
  deleteTarget = signal<any>(null);
  deleting = signal(false);
  toast = signal<{ message: string; type: 'success' | 'error' } | null>(null);
  currentPage = signal(1);
  totalPages = signal(1);
  
  searchTerm = '';
  selectedLoai = '';
  selectedChiNhanh = '';
  chiNhanhs: any[] = [];
  
  formData: any = {};
  
  totalNhanVien = computed(() => this.nhanViens().length);
  totalBacSi = computed(() => this.nhanViens().filter((nv: any) => nv.loaiNhanVien?.tenLoai?.includes('Bác sĩ')).length);

  constructor(private nhanVienService: NhanVienService, private chiNhanhService: ChiNhanhService) {}

  ngOnInit() {
    this.loadLoaiNhanViens();
    this.loadChiNhanhs();
    this.loadNhanViens();
  }

  loadLoaiNhanViens() {
    this.nhanVienService.getAllLoaiNhanVien().subscribe({
      next: (data: any) => this.loaiNhanViens.set(Array.isArray(data) ? data : data.data || []),
      error: (err: any) => console.error('Error:', err)
    });
  }

  loadChiNhanhs() {
    this.chiNhanhService.getAll().subscribe({
      next: (data: any) => this.chiNhanhs = Array.isArray(data) ? data : data.data || [],
      error: (err: any) => console.error('Error:', err)
    });
  }

  loadNhanViens() {
    this.loading.set(true);
    this.nhanVienService.getAll().subscribe({
      next: (response: any) => {
        this.nhanViens.set(Array.isArray(response) ? response : response.data || []);
        this.totalPages.set(response.totalPages || 1);
        this.loading.set(false);
      },
      error: (err: any) => { console.error('Error:', err); this.loading.set(false); }
    });
  }

  onSearch() { this.currentPage.set(1); this.loadNhanViens(); }
  goToPage(page: number) { this.currentPage.set(page); this.loadNhanViens(); }

  openModal() {
    this.isEditing.set(false);
    this.formData = { ngayVaoLam: new Date().toISOString().split('T')[0] };
    this.showModal.set(true);
  }

  editNhanVien(nv: any) {
    this.isEditing.set(true);
    this.formData = { 
      ...nv,
      ngaySinh: nv.ngaySinh ? new Date(nv.ngaySinh).toISOString().split('T')[0] : '',
      maLoaiNhanVien: nv.loaiNhanVien?.maLoaiNhanVien || '',
      maChiNhanh: nv.chiNhanh?.maChiNhanh || ''
    };
    this.showModal.set(true);
  }

  closeModal() { this.showModal.set(false); this.formData = {}; }

  saveNhanVien() {
    const data = { ...this.formData, maLoaiNhanVien: parseInt(this.formData.maLoaiNhanVien), maChiNhanh: parseInt(this.formData.maChiNhanh) };
    const request = this.isEditing() ? this.nhanVienService.update(this.formData.maNhanVien, data) : this.nhanVienService.create(data);
    request.subscribe({
      next: () => {
        this.showToast(this.isEditing() ? 'Cập nhật nhân viên thành công!' : 'Thêm nhân viên thành công!', 'success');
        this.closeModal();
        this.loadNhanViens();
      },
      error: (err: any) => this.showToast('Lỗi: ' + (err.error?.message || 'Vui lòng thử lại'), 'error')
    });
  }

  deleteNhanVien(nv: any) {
    this.deleteTarget.set(nv);
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
    this.nhanVienService.delete(target.maNhanVien).subscribe({
      next: () => {
        this.showToast('Xóa nhân viên thành công!', 'success');
        this.closeDeleteModal();
        this.loadNhanViens();
      },
      error: (err: any) => this.showToast('Lỗi: ' + (err.error?.message || 'Vui lòng thử lại'), 'error'),
      complete: () => this.deleting.set(false)
    });
  }

  showToast(message: string, type: 'success' | 'error') {
    this.toast.set({ message, type });
    setTimeout(() => this.toast.set(null), 3000);
  }

  viewDetail(nv: any) { this.selectedNhanVien.set(nv); this.showDetailModal.set(true); }
  closeDetailModal() { this.showDetailModal.set(false); this.selectedNhanVien.set(null); }
  formatDate(date: Date | string | undefined): string { if (!date) return 'N/A'; return new Date(date).toLocaleDateString('vi-VN'); }
  getInitials(name: string): string { if (!name) return '?'; return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase(); }
}
