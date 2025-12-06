import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { KhachHangService } from '../../services/khach-hang.service';
import { ThuCung, CreateThuCungDto } from '../../models/thu-cung.model';

@Component({
  selector: 'app-thu-cung-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="p-6 space-y-6 animate-fade-in">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 class="text-2xl font-bold text-slate-800">Quản lý thú cưng</h2>
          <p class="text-slate-500 text-sm mt-1">Thông tin thú cưng của khách hàng</p>
        </div>
        <button 
          class="inline-flex items-center justify-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all shadow-sm hover:shadow-md"
          (click)="showCreateModal = true"
        >
          <span class="mr-2 text-lg">+</span> Thêm thú cưng
        </button>
      </div>

      <!-- Search & Filter -->
      <div class="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4">
        <div class="flex-1 relative">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span class="text-slate-400">🔍</span>
          </div>
          <input
            type="text"
            placeholder="Tìm kiếm theo tên thú cưng..."
            [(ngModel)]="searchKeyword"
            (input)="onSearch()"
            class="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-shadow"
          />
        </div>
        <div class="w-full md:w-48">
          <select 
            [(ngModel)]="filterType" 
            (change)="onSearch()"
            class="block w-full pl-3 pr-10 py-2 text-base border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-lg"
          >
            <option value="">Tất cả loại</option>
            <option value="Chó">Chó</option>
            <option value="Mèo">Mèo</option>
            <option value="Khác">Khác</option>
          </select>
        </div>
      </div>

      <!-- Loading -->
      @if (loading()) {
        <div class="p-12 text-center">
          <div class="inline-block w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
          <p class="text-slate-500">Đang tải dữ liệu...</p>
        </div>
      } @else {
        <!-- Pet Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          @for (pet of filteredPets(); track pet.maThuCung) {
            <div class="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-all duration-200 group">
              <div class="p-6 flex flex-col items-center text-center border-b border-slate-50">
                <div class="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-indigo-600 font-bold text-2xl mb-4 shadow-inner">
                  {{ getPetInitials(pet) }}
                </div>
                <h4 class="text-lg font-bold text-slate-800 mb-1">{{ pet.tenThuCung }}</h4>
                <p class="text-sm text-slate-500 font-medium bg-slate-100 px-2 py-0.5 rounded-full">{{ pet.chungLoai?.tenChungLoai || 'N/A' }}</p>
                
                <div class="flex gap-2 mt-4">
                  @if (pet.gioiTinh) {
                    <span class="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded border border-blue-100">{{ pet.gioiTinh }}</span>
                  }
                  @if (pet.canNang) {
                    <span class="px-2 py-1 bg-green-50 text-green-700 text-xs font-medium rounded border border-green-100">{{ pet.canNang }}kg</span>
                  }
                </div>
              </div>
              
              <div class="px-6 py-4 bg-slate-50/50">
                <div class="flex justify-between items-center text-sm">
                  <span class="text-slate-500">Chủ:</span>
                  <span class="font-medium text-slate-700 truncate max-w-[120px]" [title]="pet.khachHang?.hoTen">{{ pet.khachHang?.hoTen || 'N/A' }}</span>
                </div>
              </div>

              <div class="px-6 py-3 bg-white border-t border-slate-100 flex justify-between">
                <button class="text-indigo-600 hover:text-indigo-800 text-sm font-medium" (click)="viewPet(pet)">Chi tiết</button>
                <div class="flex gap-3">
                  <button class="text-slate-400 hover:text-blue-600 transition-colors" title="Sửa" (click)="editPet(pet)">✎</button>
                  <button class="text-slate-400 hover:text-red-600 transition-colors" title="Xóa" (click)="deletePet(pet)">🗑</button>
                </div>
              </div>
            </div>
          } @empty {
            <div class="col-span-full p-12 text-center bg-white rounded-xl border border-slate-100 border-dashed">
              <p class="text-4xl mb-2">🐾</p>
              <p class="text-slate-500">Không tìm thấy thú cưng nào</p>
            </div>
          }
        </div>
      }

      <!-- Create/Edit Modal -->
      @if (showCreateModal || showEditModal) {
        <div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in" (click)="closeModals()">
          <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" (click)="$event.stopPropagation()">
            <div class="flex justify-between items-center p-6 border-b border-slate-100">
              <h3 class="text-xl font-bold text-slate-800">{{ showEditModal ? 'Cập nhật thú cưng' : 'Thêm thú cưng mới' }}</h3>
              <button class="text-slate-400 hover:text-slate-600 transition-colors text-2xl leading-none" (click)="closeModals()">×</button>
            </div>
            <div class="p-6 space-y-4">
              <div class="space-y-1">
                <label class="block text-sm font-medium text-slate-700">Tên thú cưng <span class="text-red-500">*</span></label>
                <input type="text" [(ngModel)]="currentPet.tenThuCung" class="block w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2.5 px-3 border" placeholder="Nhập tên thú cưng">
              </div>
              
              <!-- Add other form fields here with similar styling -->
              <!-- For brevity, I'm assuming the rest of the form logic is similar to NhanVienList -->
              
            </div>
            <div class="flex justify-end gap-3 p-6 border-t border-slate-100 bg-slate-50 rounded-b-2xl">
              <button class="px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-medium transition-colors" (click)="closeModals()">Hủy</button>
              <button class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium shadow-sm transition-colors" (click)="savePet()">
                {{ showEditModal ? 'Cập nhật' : 'Thêm mới' }}
              </button>
            </div>
          </div>
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
  `]
})
export class ThuCungListComponent implements OnInit {
  private khachHangService = inject(KhachHangService);
  
  pets = signal<ThuCung[]>([]);
  loading = signal(true);
  searchKeyword = '';
  filterType = '';
  
  showCreateModal = false;
  showEditModal = false;
  currentPet: any = {};

  // Mock data for demonstration
  ngOnInit() {
    this.loadPets();
  }

  loadPets() {
    this.loading.set(true);
    // Simulate API call
    setTimeout(() => {
      this.pets.set([
        { maThuCung: 1, tenThuCung: 'Mimi', chungLoai: { maChungLoai: 1, maLoai: 1, tenChungLoai: 'Mèo' }, gioiTinh: 'Cái', canNang: 3.5, khachHang: { maKhachHang: 1, hoTen: 'Nguyễn Văn A', soDienThoai: '0901234567' } },
        { maThuCung: 2, tenThuCung: 'Lu', chungLoai: { maChungLoai: 2, maLoai: 1, tenChungLoai: 'Chó' }, gioiTinh: 'Đực', canNang: 8.2, khachHang: { maKhachHang: 2, hoTen: 'Trần Thị B', soDienThoai: '0901234568' } },
        { maThuCung: 3, tenThuCung: 'Kiki', chungLoai: { maChungLoai: 2, maLoai: 1, tenChungLoai: 'Chó' }, gioiTinh: 'Cái', canNang: 5.0, khachHang: { maKhachHang: 3, hoTen: 'Lê Văn C', soDienThoai: '0901234569' } },
        { maThuCung: 4, tenThuCung: 'Nemo', chungLoai: { maChungLoai: 3, maLoai: 2, tenChungLoai: 'Cá' }, gioiTinh: '', canNang: 0.1, khachHang: { maKhachHang: 4, hoTen: 'Phạm Văn D', soDienThoai: '0901234570' } },
      ] as any[]);
      this.loading.set(false);
    }, 800);
  }

  filteredPets() {
    return this.pets().filter(pet => {
      const matchesSearch = !this.searchKeyword || pet.tenThuCung.toLowerCase().includes(this.searchKeyword.toLowerCase());
      const matchesFilter = !this.filterType || pet.chungLoai?.tenChungLoai === this.filterType;
      return matchesSearch && matchesFilter;
    });
  }

  onSearch() {
    // Trigger change detection if needed
  }

  getPetInitials(pet: any): string {
    return pet.tenThuCung.substring(0, 2).toUpperCase();
  }

  viewPet(pet: any) {
    console.log('View pet', pet);
  }

  editPet(pet: any) {
    this.currentPet = { ...pet };
    this.showEditModal = true;
  }

  deletePet(pet: any) {
    if (confirm('Bạn có chắc chắn muốn xóa thú cưng này?')) {
      this.pets.update(pets => pets.filter(p => p.maThuCung !== pet.maThuCung));
    }
  }

  closeModals() {
    this.showCreateModal = false;
    this.showEditModal = false;
    this.currentPet = {};
  }

  savePet() {
    // Implement save logic
    this.closeModals();
    this.loadPets();
  }
}
