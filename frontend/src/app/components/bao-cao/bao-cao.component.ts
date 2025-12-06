import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HoaDonService, KhachHangService, LichHenService, YTeService, SanPhamService } from '../../services';
import { forkJoin } from 'rxjs';

interface ReportData {
  revenue: number;
  orders: number;
  customers: number;
  appointments: number;
  medicalRecords: number;
  vaccinations: number;
  products: number;
  pendingAppointments: number;
}

interface MonthlyData {
  month: string;
  revenue: number;
  orders: number;
}

interface ActivityItem {
  id: number;
  type: 'order' | 'medical' | 'customer' | 'appointment';
  icon: string;
  title: string;
  description: string;
  time: string;
  timestamp: Date;
}

@Component({
  selector: 'app-bao-cao',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div class="header-content">
          <h2>📈 Báo cáo & Thống kê</h2>
          <p class="subtitle">Xem báo cáo doanh thu và thống kê hoạt động</p>
        </div>
        <div class="header-actions">
          <select [(ngModel)]="selectedPeriod" (ngModelChange)="loadReportData()">
            <option value="today">Hôm nay</option>
            <option value="week">Tuần này</option>
            <option value="month">Tháng này</option>
            <option value="year">Năm nay</option>
          </select>
          <button class="btn-primary" (click)="exportReport()">
            📥 Xuất báo cáo
          </button>
        </div>
      </div>

      <!-- Main Stats -->
      <div class="stats-grid">
        <div class="stat-card revenue">
          <div class="stat-icon">💰</div>
          <div class="stat-content">
            <span class="stat-value">{{ formatCurrency(reportData().revenue) }}</span>
            <span class="stat-label">Doanh thu</span>
            <span class="stat-change positive">+12.5%</span>
          </div>
        </div>
        <div class="stat-card orders">
          <div class="stat-icon">🧾</div>
          <div class="stat-content">
            <span class="stat-value">{{ reportData().orders }}</span>
            <span class="stat-label">Đơn hàng</span>
            <span class="stat-change positive">+8.3%</span>
          </div>
        </div>
        <div class="stat-card customers">
          <div class="stat-icon">👥</div>
          <div class="stat-content">
            <span class="stat-value">{{ reportData().customers }}</span>
            <span class="stat-label">Khách hàng</span>
            <span class="stat-change positive">+5.2%</span>
          </div>
        </div>
        <div class="stat-card appointments">
          <div class="stat-icon">📅</div>
          <div class="stat-content">
            <span class="stat-value">{{ reportData().appointments }}</span>
            <span class="stat-label">Lịch hẹn</span>
            <span class="stat-change negative">-2.1%</span>
          </div>
        </div>
      </div>

      <!-- Charts Section -->
      <div class="charts-grid">
        <!-- Revenue Chart -->
        <div class="chart-card">
          <div class="chart-header">
            <h3>📊 Doanh thu theo tháng</h3>
          </div>
          <div class="chart-body">
            <div class="bar-chart">
              @for (item of monthlyData(); track item.month) {
                <div class="bar-item">
                  <div class="bar" [style.height.%]="getBarHeight(item.revenue)">
                    <span class="bar-value">{{ formatShortCurrency(item.revenue) }}</span>
                  </div>
                  <span class="bar-label">{{ item.month }}</span>
                </div>
              }
            </div>
          </div>
        </div>

        <!-- Services Stats -->
        <div class="chart-card">
          <div class="chart-header">
            <h3>🏥 Dịch vụ y tế</h3>
          </div>
          <div class="chart-body">
            <div class="service-stats">
              <div class="service-item">
                <div class="service-icon">🩺</div>
                <div class="service-info">
                  <span class="service-value">{{ reportData().medicalRecords }}</span>
                  <span class="service-label">Lượt khám bệnh</span>
                </div>
                <div class="service-progress">
                  <div class="progress-bar" [style.width.%]="medicalProgress()"></div>
                </div>
              </div>
              <div class="service-item">
                <div class="service-icon">💉</div>
                <div class="service-info">
                  <span class="service-value">{{ reportData().vaccinations }}</span>
                  <span class="service-label">Lượt tiêm phòng</span>
                </div>
                <div class="service-progress">
                  <div class="progress-bar" [style.width.%]="vaccinationProgress()"></div>
                </div>
              </div>
              <div class="service-item">
                <div class="service-icon">🛒</div>
                <div class="service-info">
                  <span class="service-value">{{ reportData().orders }}</span>
                  <span class="service-label">Đơn bán hàng</span>
                </div>
                <div class="service-progress">
                  <div class="progress-bar" [style.width.%]="ordersProgress()"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="activity-section">
        <div class="section-header">
          <h3>🕐 Hoạt động gần đây</h3>
        </div>
        <div class="activity-list">
          @if (recentActivities().length === 0) {
            <div class="empty-activities">
              <span>📭</span>
              <p>Chưa có hoạt động nào gần đây</p>
            </div>
          } @else {
            @for (activity of recentActivities(); track activity.id) {
              <div class="activity-item">
                <div class="activity-icon" [class]="activity.type">{{ activity.icon }}</div>
                <div class="activity-content">
                  <span class="activity-title">{{ activity.title }}</span>
                  <span class="activity-desc">{{ activity.description }}</span>
                </div>
                <span class="activity-time">{{ activity.time }}</span>
              </div>
            }
          }
        </div>
      </div>

      <!-- Quick Reports -->
      <div class="quick-reports">
        <div class="section-header">
          <h3>📋 Báo cáo nhanh</h3>
        </div>
        <div class="reports-grid">
          <div class="report-card" (click)="generateReport('revenue')">
            <span class="report-icon">💰</span>
            <span class="report-title">Báo cáo doanh thu</span>
            <span class="report-desc">Chi tiết doanh thu theo thời gian</span>
          </div>
          <div class="report-card" (click)="generateReport('customers')">
            <span class="report-icon">👥</span>
            <span class="report-title">Báo cáo khách hàng</span>
            <span class="report-desc">Thống kê khách hàng mới và cũ</span>
          </div>
          <div class="report-card" (click)="generateReport('services')">
            <span class="report-icon">🏥</span>
            <span class="report-title">Báo cáo dịch vụ</span>
            <span class="report-desc">Khám bệnh, tiêm phòng, bán hàng</span>
          </div>
          <div class="report-card" (click)="generateReport('inventory')">
            <span class="report-icon">📦</span>
            <span class="report-title">Báo cáo tồn kho</span>
            <span class="report-desc">Tình trạng kho và sản phẩm</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-container { animation: fadeIn 0.3s ease; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 16px; }
    .page-header h2 { margin: 0; font-size: 24px; color: #1a1f3c; }
    .subtitle { margin: 4px 0 0; color: #64748b; font-size: 14px; }
    .header-actions { display: flex; gap: 12px; align-items: center; }
    .header-actions select {
      padding: 10px 16px; border: 1px solid #e2e8f0; border-radius: 10px;
      background: white; font-size: 14px; cursor: pointer; outline: none;
    }
    
    .btn-primary {
      display: flex; align-items: center; gap: 8px;
      padding: 10px 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white; border: none; border-radius: 10px; cursor: pointer;
      font-weight: 500; transition: all 0.2s;
    }
    .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4); }
    
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; margin-bottom: 24px; }
    .stat-card {
      background: white; border-radius: 16px; padding: 24px;
      display: flex; align-items: center; gap: 20px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
      position: relative; overflow: hidden;
    }
    .stat-card::before {
      content: ''; position: absolute; top: 0; left: 0; right: 0; height: 4px;
    }
    .stat-card.revenue::before { background: linear-gradient(90deg, #667eea, #764ba2); }
    .stat-card.orders::before { background: linear-gradient(90deg, #10b981, #059669); }
    .stat-card.customers::before { background: linear-gradient(90deg, #f59e0b, #d97706); }
    .stat-card.appointments::before { background: linear-gradient(90deg, #3b82f6, #2563eb); }
    
    .stat-icon { font-size: 40px; }
    .stat-content { flex: 1; }
    .stat-value { font-size: 28px; font-weight: 700; color: #1a1f3c; display: block; }
    .stat-label { font-size: 14px; color: #64748b; display: block; margin-top: 4px; }
    .stat-change {
      font-size: 12px; font-weight: 600; padding: 4px 8px; border-radius: 20px;
      display: inline-block; margin-top: 8px;
    }
    .stat-change.positive { background: #d1fae5; color: #059669; }
    .stat-change.negative { background: #fee2e2; color: #dc2626; }
    
    .charts-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 20px; margin-bottom: 24px; }
    @media (max-width: 1024px) { .charts-grid { grid-template-columns: 1fr; } }
    
    .chart-card { background: white; border-radius: 16px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05); }
    .chart-header { padding: 20px 24px; border-bottom: 1px solid #f1f5f9; }
    .chart-header h3 { margin: 0; font-size: 16px; color: #1a1f3c; }
    .chart-body { padding: 24px; }
    
    .bar-chart { display: flex; align-items: flex-end; gap: 16px; height: 200px; }
    .bar-item { flex: 1; display: flex; flex-direction: column; align-items: center; }
    .bar {
      width: 100%; background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
      border-radius: 8px 8px 0 0; min-height: 20px;
      display: flex; align-items: flex-start; justify-content: center;
      padding-top: 8px; transition: height 0.3s;
    }
    .bar-value { font-size: 11px; color: white; font-weight: 600; }
    .bar-label { margin-top: 8px; font-size: 12px; color: #64748b; }
    
    .service-stats { display: flex; flex-direction: column; gap: 20px; }
    .service-item { display: flex; align-items: center; gap: 16px; }
    .service-icon { font-size: 28px; }
    .service-info { flex: 1; }
    .service-value { font-size: 20px; font-weight: 700; color: #1a1f3c; display: block; }
    .service-label { font-size: 13px; color: #64748b; }
    .service-progress { width: 100px; height: 8px; background: #f1f5f9; border-radius: 4px; overflow: hidden; }
    .progress-bar { height: 100%; background: linear-gradient(90deg, #667eea, #764ba2); border-radius: 4px; }
    
    .activity-section { background: white; border-radius: 16px; margin-bottom: 24px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05); }
    .section-header { padding: 20px 24px; border-bottom: 1px solid #f1f5f9; }
    .section-header h3 { margin: 0; font-size: 16px; color: #1a1f3c; }
    .activity-list { padding: 16px 24px; }
    .activity-item {
      display: flex; align-items: center; gap: 16px; padding: 12px 0;
      border-bottom: 1px solid #f8fafc;
    }
    .activity-item:last-child { border-bottom: none; }
    .activity-icon {
      width: 40px; height: 40px; border-radius: 10px;
      display: flex; align-items: center; justify-content: center; font-size: 18px;
    }
    .activity-icon.order { background: #d1fae5; }
    .activity-icon.medical { background: #dbeafe; }
    .activity-icon.customer { background: #fef3c7; }
    .activity-content { flex: 1; }
    .activity-title { display: block; font-weight: 500; color: #1a1f3c; font-size: 14px; }
    .activity-desc { font-size: 13px; color: #64748b; }
    .activity-time { font-size: 12px; color: #94a3b8; }
    
    .quick-reports { background: white; border-radius: 16px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05); }
    .reports-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; padding: 20px 24px; }
    .report-card {
      padding: 20px; border: 2px dashed #e2e8f0; border-radius: 12px;
      cursor: pointer; transition: all 0.2s; text-align: center;
    }
    .report-card:hover { border-color: #667eea; background: #f8fafc; }
    .report-icon { font-size: 32px; display: block; margin-bottom: 12px; }
    .report-title { font-weight: 600; color: #1a1f3c; display: block; margin-bottom: 4px; }
    .report-desc { font-size: 13px; color: #64748b; }
  `]
})
export class BaoCaoComponent implements OnInit {
  selectedPeriod = 'month';
  loading = signal(true);
  
  reportData = signal<ReportData>({
    revenue: 0,
    orders: 0,
    customers: 0,
    appointments: 0,
    medicalRecords: 0,
    vaccinations: 0,
    products: 0,
    pendingAppointments: 0
  });
  
  monthlyData = signal<MonthlyData[]>([]);
  
  recentActivities = signal<ActivityItem[]>([]);

  // Computed values for progress bars
  medicalProgress = computed(() => {
    const data = this.reportData();
    const total = data.medicalRecords + data.vaccinations + data.orders;
    return total > 0 ? Math.round((data.medicalRecords / total) * 100) : 0;
  });
  
  vaccinationProgress = computed(() => {
    const data = this.reportData();
    const total = data.medicalRecords + data.vaccinations + data.orders;
    return total > 0 ? Math.round((data.vaccinations / total) * 100) : 0;
  });
  
  ordersProgress = computed(() => {
    const data = this.reportData();
    const total = data.medicalRecords + data.vaccinations + data.orders;
    return total > 0 ? Math.round((data.orders / total) * 100) : 0;
  });

  constructor(
    private hoaDonService: HoaDonService,
    private khachHangService: KhachHangService,
    private lichHenService: LichHenService,
    private yTeService: YTeService,
    private sanPhamService: SanPhamService
  ) {}

  ngOnInit() {
    this.loadReportData();
  }

  loadReportData() {
    this.loading.set(true);
    
    // Load all data in parallel
    forkJoin({
      hoaDons: this.hoaDonService.getAll(),
      khachHangs: this.khachHangService.getAll(),
      lichHens: this.lichHenService.getAll(),
      sanPhams: this.sanPhamService.getAll()
    }).subscribe({
      next: (results) => {
        const hoaDons = Array.isArray(results.hoaDons) ? results.hoaDons : [];
        const khachHangs = Array.isArray(results.khachHangs) ? results.khachHangs : [];
        const lichHens = Array.isArray(results.lichHens) ? results.lichHens : [];
        const sanPhams = Array.isArray(results.sanPhams) ? results.sanPhams : [];
        
        // Filter data based on selected period
        const filteredHoaDons = this.filterByPeriod(hoaDons, 'ngayLap');
        const filteredLichHens = this.filterByPeriod(lichHens, 'ngayHen');
        
        // Calculate revenue
        const revenue = filteredHoaDons.reduce((sum: number, hd: any) => sum + (hd.tongTien || 0), 0);
        
        // Calculate pending appointments
        const pendingAppointments = lichHens.filter((lh: any) => 
          lh.trangThai === 'Chờ xác nhận'
        ).length;
        
        // Update report data
        this.reportData.set({
          revenue,
          orders: filteredHoaDons.length,
          customers: khachHangs.length,
          appointments: filteredLichHens.length,
          medicalRecords: 0, // Will be updated from y-te service
          vaccinations: 0,   // Will be updated from y-te service
          products: sanPhams.length,
          pendingAppointments
        });
        
        // Generate monthly data
        this.generateMonthlyData(hoaDons);
        
        // Generate recent activities
        this.generateRecentActivities(hoaDons, lichHens);
        
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading report data:', err);
        this.loading.set(false);
      }
    });
    
    // Load medical data separately
    this.yTeService.getAllKhamTongQuat().subscribe({
      next: (data: any) => {
        const khamBenhs = Array.isArray(data) ? data : data?.data || [];
        this.reportData.update(r => ({ ...r, medicalRecords: khamBenhs.length }));
      },
      error: () => {}
    });
    
    this.yTeService.getAllTiemPhong().subscribe({
      next: (data: any) => {
        const tiemPhongs = Array.isArray(data) ? data : data?.data || [];
        this.reportData.update(r => ({ ...r, vaccinations: tiemPhongs.length }));
      },
      error: () => {}
    });
  }

  filterByPeriod(data: any[], dateField: string): any[] {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    let startDate: Date;
    switch (this.selectedPeriod) {
      case 'today':
        startDate = startOfDay;
        break;
      case 'week':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }
    
    return data.filter(item => {
      const itemDate = new Date(item[dateField]);
      return itemDate >= startDate && itemDate <= now;
    });
  }

  generateMonthlyData(hoaDons: any[]) {
    const monthlyMap = new Map<string, { revenue: number; orders: number }>();
    const months = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];
    
    // Initialize all months
    months.forEach(month => monthlyMap.set(month, { revenue: 0, orders: 0 }));
    
    // Aggregate data
    hoaDons.forEach((hd: any) => {
      if (hd.ngayLap) {
        const date = new Date(hd.ngayLap);
        const month = months[date.getMonth()];
        const current = monthlyMap.get(month)!;
        current.revenue += hd.tongTien || 0;
        current.orders += 1;
      }
    });
    
    // Convert to array (last 6 months)
    const currentMonth = new Date().getMonth();
    const result: MonthlyData[] = [];
    for (let i = 5; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12;
      const month = months[monthIndex];
      const data = monthlyMap.get(month)!;
      result.push({ month, ...data });
    }
    
    this.monthlyData.set(result);
  }

  generateRecentActivities(hoaDons: any[], lichHens: any[]) {
    const activities: ActivityItem[] = [];
    let id = 1;
    
    // Add recent invoices
    hoaDons.slice(0, 3).forEach((hd: any) => {
      activities.push({
        id: id++,
        type: 'order',
        icon: '🧾',
        title: `Hóa đơn #${hd.maHoaDon}`,
        description: `${hd.khachHang?.hoTen || 'Khách vãng lai'} - ${this.formatCurrency(hd.tongTien)}`,
        time: this.getTimeAgo(hd.ngayLap),
        timestamp: new Date(hd.ngayLap)
      });
    });
    
    // Add recent appointments
    lichHens.slice(0, 3).forEach((lh: any) => {
      activities.push({
        id: id++,
        type: 'appointment',
        icon: '📅',
        title: lh.trangThai === 'Chờ xác nhận' ? 'Lịch hẹn mới' : `Lịch hẹn ${lh.trangThai}`,
        description: `${lh.khachHang?.hoTen || 'N/A'} - ${lh.thuCung?.tenThuCung || 'N/A'}`,
        time: this.getTimeAgo(lh.ngayDat || lh.ngayHen),
        timestamp: new Date(lh.ngayDat || lh.ngayHen)
      });
    });
    
    // Sort by timestamp and take top 5
    activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    this.recentActivities.set(activities.slice(0, 5));
  }

  getTimeAgo(date: Date | string): string {
    const now = new Date();
    const past = new Date(date);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return new Date(date).toLocaleDateString('vi-VN');
  }

  getBarHeight(revenue: number): number {
    const maxRevenue = Math.max(...this.monthlyData().map(m => m.revenue), 1);
    return Math.max((revenue / maxRevenue) * 100, 5);
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  }

  formatShortCurrency(value: number): string {
    if (value >= 1000000000) {
      return (value / 1000000000).toFixed(1) + 'B';
    }
    if (value >= 1000000) {
      return (value / 1000000).toFixed(1) + 'M';
    }
    if (value >= 1000) {
      return (value / 1000).toFixed(0) + 'K';
    }
    return value.toString();
  }

  exportReport() {
    // Generate CSV report
    const data = this.reportData();
    const csvContent = `Báo cáo PetCareX - ${new Date().toLocaleDateString('vi-VN')}
    
Thống kê tổng quan:
- Doanh thu: ${this.formatCurrency(data.revenue)}
- Số đơn hàng: ${data.orders}
- Số khách hàng: ${data.customers}
- Số lịch hẹn: ${data.appointments}
- Lượt khám bệnh: ${data.medicalRecords}
- Lượt tiêm phòng: ${data.vaccinations}
- Sản phẩm trong kho: ${data.products}

Doanh thu theo tháng:
${this.monthlyData().map(m => `${m.month}: ${this.formatCurrency(m.revenue)} (${m.orders} đơn)`).join('\n')}
`;
    
    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `bao-cao-petcarex-${new Date().toISOString().split('T')[0]}.txt`;
    link.click();
  }

  generateReport(type: string) {
    alert(`Đang tạo báo cáo chi tiết: ${type}\nChức năng này sẽ được hoàn thiện trong phiên bản tiếp theo.`);
  }
}
