import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ChiNhanhService } from '../../services/chi-nhanh.service';
import { LichHenService } from '../../services/lich-hen.service';
import { KhachHangService } from '../../services/khach-hang.service';
import { HoaDonService } from '../../services/hoa-don.service';

interface DashboardStats {
  totalKhachHang: number;
  totalLichHen: number;
  totalHoaDon: number;
  totalRevenue: number;
  pendingAppointments: number;
  todayAppointments: number;
}

interface RecentActivity {
  type: 'appointment' | 'invoice' | 'customer';
  title: string;
  description: string;
  time: string;
  icon: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="p-8 space-y-8 animate-fade-in bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-slate-900 mb-2">Dashboard</h1>
        <p class="text-slate-600">{{ currentDate }}</p>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <!-- Customers Card -->
        <div class="group relative bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden">
          <div class="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-16 -mt-16"></div>
          <div class="relative z-10">
            <div class="flex items-center justify-between mb-4">
              <div class="w-14 h-14 rounded-xl bg-white bg-opacity-20 backdrop-blur-sm flex items-center justify-center">
                <span class="text-2xl">👥</span>
              </div>
              <span class="text-xs font-semibold text-white bg-white bg-opacity-20 backdrop-blur-sm px-3 py-1.5 rounded-full">+12%</span>
            </div>
            <h3 class="text-blue-100 text-sm font-medium mb-1">Tổng khách hàng</h3>
            <p class="text-4xl font-bold text-white">{{ stats().totalKhachHang }}</p>
          </div>
        </div>

        <!-- Appointments Card -->
        <div class="group relative bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden">
          <div class="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-16 -mt-16"></div>
          <div class="relative z-10">
            <div class="flex items-center justify-between mb-4">
              <div class="w-14 h-14 rounded-xl bg-white bg-opacity-20 backdrop-blur-sm flex items-center justify-center">
                <span class="text-2xl">📅</span>
              </div>
              <span class="text-xs font-semibold text-white bg-white bg-opacity-20 backdrop-blur-sm px-3 py-1.5 rounded-full">+5%</span>
            </div>
            <h3 class="text-purple-100 text-sm font-medium mb-1">Lịch hẹn hôm nay</h3>
            <p class="text-4xl font-bold text-white">{{ stats().todayAppointments }}</p>
          </div>
        </div>

        <!-- Invoices Card -->
        <div class="group relative bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden">
          <div class="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-16 -mt-16"></div>
          <div class="relative z-10">
            <div class="flex items-center justify-between mb-4">
              <div class="w-14 h-14 rounded-xl bg-white bg-opacity-20 backdrop-blur-sm flex items-center justify-center">
                <span class="text-2xl">📄</span>
              </div>
              <span class="text-xs font-semibold text-white bg-white bg-opacity-20 backdrop-blur-sm px-3 py-1.5 rounded-full">0%</span>
            </div>
            <h3 class="text-orange-100 text-sm font-medium mb-1">Hóa đơn tháng này</h3>
            <p class="text-4xl font-bold text-white">{{ stats().totalHoaDon }}</p>
          </div>
        </div>

        <!-- Revenue Card -->
        <div class="group relative bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden">
          <div class="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-16 -mt-16"></div>
          <div class="relative z-10">
            <div class="flex items-center justify-between mb-4">
              <div class="w-14 h-14 rounded-xl bg-white bg-opacity-20 backdrop-blur-sm flex items-center justify-center">
                <span class="text-2xl">💰</span>
              </div>
              <span class="text-xs font-semibold text-white bg-white bg-opacity-20 backdrop-blur-sm px-3 py-1.5 rounded-full">+8%</span>
            </div>
            <h3 class="text-emerald-100 text-sm font-medium mb-1">Doanh thu tháng</h3>
            <p class="text-4xl font-bold text-white">{{ formatCurrency(stats().totalRevenue) }}</p>
          </div>
        </div>
      </div>

      <!-- Main Content Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Upcoming Appointments -->
        <div class="lg:col-span-2 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white overflow-hidden">
          <div class="p-6 border-b border-slate-200 flex justify-between items-center bg-gradient-to-r from-slate-50 to-transparent">
            <div class="flex items-center gap-2">
              <span class="text-2xl">📋</span>
              <h3 class="font-bold text-slate-800 text-xl">Lịch hẹn sắp tới</h3>
            </div>
            <a routerLink="/lich-hen" class="text-blue-600 hover:text-blue-700 text-sm font-medium hover:underline transition-colors">Xem tất cả →</a>
          </div>
          <div class="p-6">
            @if (loading()) {
              <div class="flex justify-center py-12">
                <div class="relative">
                  <div class="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                  <div class="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-400 animate-ping opacity-20"></div>
                </div>
              </div>
            } @else if (upcomingAppointments().length === 0) {
              <div class="text-center py-12">
                <p class="text-6xl mb-4">📅</p>
                <p class="text-slate-500 text-lg font-medium">Không có lịch hẹn nào sắp tới</p>
              </div>
            } @else {
              <div class="space-y-3">
                @for (apt of upcomingAppointments(); track apt.maLichHen) {
                  <div class="group flex items-center p-4 rounded-xl bg-gradient-to-r from-slate-50 to-slate-50 hover:from-blue-50 hover:to-indigo-50 transition-all border border-slate-200 hover:border-blue-300 hover:shadow-md cursor-pointer">
                    <div class="flex-shrink-0 w-20 text-center mr-4 bg-white rounded-xl p-2 shadow-sm border border-slate-100 group-hover:border-blue-300 group-hover:shadow-md transition-all">
                      <span class="block text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{{ apt.ngayHen | date:'HH:mm' }}</span>
                      <span class="block text-xs text-slate-500 font-semibold uppercase mt-1">{{ apt.ngayHen | date:'dd/MM' }}</span>
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-base font-bold text-slate-900 truncate group-hover:text-blue-700 transition-colors">{{ apt.khachHang?.hoTen || 'N/A' }}</p>
                      <p class="text-sm text-slate-600 truncate mt-1">
                        <span class="inline-flex items-center gap-1">
                          <span>🐾</span>
                          {{ apt.thuCung?.tenThuCung || 'N/A' }}
                        </span>
                      </p>
                    </div>
                    <div class="ml-4">
                      <span 
                        class="px-4 py-2 rounded-full text-xs font-semibold shadow-md"
                        [class.bg-gradient-to-r]="true"
                        [class.from-yellow-400]="apt.trangThai === 'ChoXacNhan'"
                        [class.to-yellow-500]="apt.trangThai === 'ChoXacNhan'"
                        [class.text-yellow-900]="apt.trangThai === 'ChoXacNhan'"
                        [class.from-blue-400]="apt.trangThai === 'DaXacNhan'"
                        [class.to-blue-500]="apt.trangThai === 'DaXacNhan'"
                        [class.text-blue-900]="apt.trangThai === 'DaXacNhan'"
                        [class.from-green-400]="apt.trangThai === 'HoanThanh'"
                        [class.to-green-500]="apt.trangThai === 'HoanThanh'"
                        [class.text-green-900]="apt.trangThai === 'HoanThanh'"
                      >
                        {{ apt.trangThai }}
                      </span>
                    </div>
                  </div>
                }
              </div>
            }
          </div>
        </div>

        <!-- Recent Activity -->
        <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white overflow-hidden">
          <div class="p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-transparent">
            <div class="flex items-center gap-2">
              <span class="text-2xl">⚡</span>
              <h3 class="font-bold text-slate-800 text-xl">Hoạt động gần đây</h3>
            </div>
          </div>
          <div class="p-6 overflow-auto max-h-[600px]">
            <div class="space-y-4 pl-6">
              @for (activity of recentActivities(); track $index) {
                <div class="group relative">
                  <!-- Timeline dot -->
                  <div class="absolute -left-6 top-2 w-3 h-3 rounded-full border-2 border-white shadow-sm z-10 group-hover:scale-125 transition-transform"
                    [class.bg-gradient-to-br]="true"
                    [class.from-blue-400]="activity.type === 'customer'"
                    [class.to-blue-600]="activity.type === 'customer'"
                    [class.from-purple-400]="activity.type === 'appointment'"
                    [class.to-purple-600]="activity.type === 'appointment'"
                    [class.from-orange-400]="activity.type === 'invoice'"
                    [class.to-orange-600]="activity.type === 'invoice'">
                  </div>
                  
                  <!-- Timeline line (except for last item) -->
                  @if ($index < recentActivities().length - 1) {
                    <div class="absolute -left-4.5 top-5 w-0.5 h-full bg-gradient-to-b from-slate-300 to-transparent"></div>
                  }
                  
                  <!-- Activity card -->
                  <div class="bg-white rounded-xl p-4 border border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all cursor-pointer group-hover:-translate-y-0.5">
                    <!-- Icon badge -->
                    <div class="flex items-start gap-3 mb-2">
                      <div class="flex-shrink-0 w-10 h-10 rounded-lg shadow-md flex items-center justify-center text-xl transition-transform group-hover:scale-110"
                        [class.bg-gradient-to-br]="true"
                        [class.from-blue-400]="activity.type === 'customer'"
                        [class.to-blue-500]="activity.type === 'customer'"
                        [class.from-purple-400]="activity.type === 'appointment'"
                        [class.to-purple-500]="activity.type === 'appointment'"
                        [class.from-orange-400]="activity.type === 'invoice'"
                        [class.to-orange-500]="activity.type === 'invoice'">
                        <span>{{ activity.type === 'customer' ? '👤' : (activity.type === 'appointment' ? '📅' : '💳') }}</span>
                      </div>
                      
                      <div class="flex-1 min-w-0">
                        <h4 class="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition-colors">{{ activity.title }}</h4>
                        <p class="text-xs text-slate-600 mt-1 leading-relaxed">{{ activity.description }}</p>
                      </div>
                    </div>
                    
                    <!-- Time -->
                    <div class="flex items-center gap-1.5 text-xs text-slate-500 font-medium mt-3 pl-13">
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      <span>{{ activity.time }}</span>
                    </div>
                  </div>
                </div>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in {
      animation: fadeIn 0.4s ease-out forwards;
    }
  `]
})
export class DashboardComponent implements OnInit {
  private chiNhanhService = inject(ChiNhanhService);
  private lichHenService = inject(LichHenService);
  private khachHangService = inject(KhachHangService);
  private hoaDonService = inject(HoaDonService);

  stats = signal<DashboardStats>({
    totalKhachHang: 0,
    totalLichHen: 0,
    totalHoaDon: 0,
    totalRevenue: 0,
    pendingAppointments: 0,
    todayAppointments: 0
  });

  upcomingAppointments = signal<any[]>([]);
  recentActivities = signal<RecentActivity[]>([]);
  loading = signal(true);

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.loading.set(true);
    
    // Mock data for now - in a real app, you'd call APIs
    // Simulating API calls
    setTimeout(() => {
      this.stats.set({
        totalKhachHang: 1250,
        totalLichHen: 45,
        totalHoaDon: 128,
        totalRevenue: 156000000,
        pendingAppointments: 5,
        todayAppointments: 12
      });

      this.upcomingAppointments.set([
        {
          maLichHen: 1,
          ngayHen: new Date(),
          khachHang: { hoTen: 'Nguyễn Văn A' },
          thuCung: { tenThuCung: 'Mimi' },
          trangThai: 'ChoXacNhan'
        },
        {
          maLichHen: 2,
          ngayHen: new Date(new Date().getTime() + 3600000),
          khachHang: { hoTen: 'Trần Thị B' },
          thuCung: { tenThuCung: 'Lu' },
          trangThai: 'DaXacNhan'
        },
        {
          maLichHen: 3,
          ngayHen: new Date(new Date().getTime() + 7200000),
          khachHang: { hoTen: 'Lê Văn C' },
          thuCung: { tenThuCung: 'Kiki' },
          trangThai: 'HoanThanh'
        }
      ]);

      this.recentActivities.set([
        {
          type: 'appointment',
          title: 'Lịch hẹn mới',
          description: 'Nguyễn Văn A đặt lịch khám cho Mimi',
          time: '10 phút trước',
          icon: ''
        },
        {
          type: 'invoice',
          title: 'Thanh toán hóa đơn',
          description: 'Hóa đơn #12345 - 500.000đ',
          time: '30 phút trước',
          icon: ''
        },
        {
          type: 'customer',
          title: 'Khách hàng mới',
          description: 'Trần Thị B đã đăng ký thành viên',
          time: '1 giờ trước',
          icon: ''
        },
        {
          type: 'appointment',
          title: 'Hoàn thành khám',
          description: 'Bác sĩ X đã khám xong cho Lu',
          time: '2 giờ trước',
          icon: ''
        }
      ]);

      this.loading.set(false);
    }, 1000);
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  }
}
