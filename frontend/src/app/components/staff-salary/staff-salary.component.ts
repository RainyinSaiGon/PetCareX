import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { 
  AdminStaffService, 
  EmployeeType, 
  EmployeeStats,
  SalaryStatistics,
  SalaryComparison,
  SalaryForecast
} from '../../services/admin-staff.service';

interface SalaryChange {
  loaiNhanVien: string;
  oldSalary: number;
  newSalary: number;
  percentageChange: number;
  reason: string;
  timestamp: Date;
  affectedEmployees: number;
}

interface ValidationError {
  field: string;
  message: string;
}

@Component({
  selector: 'app-staff-salary',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './staff-salary.component.html',
  styleUrls: ['./staff-salary.component.css']
})
export class StaffSalaryComponent implements OnInit {
  // Data
  employeeTypes: EmployeeType[] = [];
  statistics: EmployeeStats | null = null;
  salaryHistory: SalaryChange[] = [];
  
  // Detailed Salary Statistics
  salaryStatistics: SalaryStatistics | null = null;
  salaryComparisons: Map<string, SalaryComparison> = new Map();
  salaryForecast: SalaryForecast[] = [];
  
  // UI States
  loading = false;
  loadingStats = false;
  loadingSalaryStats = false;
  submitting = false;
  error: string | null = null;
  successMessage: string | null = null;
  validationErrors: ValidationError[] = [];
  
  // Active tab
  activeTab: 'update' | 'bulk' | 'history' | 'statistics' = 'update';

  // Update salary form
  selectedType: string = '';
  newSalary: number = 0;
  updateReason: string = '';
  showUpdatePreview = false;
  
  // Bulk update form
  bulkType: string = '';
  percentageIncrease: number = 0;
  bulkReason: string = '';
  showBulkPreview = false;

  // Advanced filters for bulk
  applyToAllTypes = false;
  minCurrentSalary: number = 0;
  maxCurrentSalary: number = 0;
  showAdvancedFilters = false;

  // Sorting and filtering
  sortBy: 'type' | 'salary' | 'employees' = 'type';
  sortOrder: 'asc' | 'desc' = 'asc';
  searchTerm: string = '';

  // Expose Math to template
  Math = Math;

  constructor(private adminStaffService: AdminStaffService) {}

  ngOnInit(): void {
    this.loadAllData();
    this.loadSalaryHistoryFromStorage();
  }

  loadAllData(): void {
    this.loadEmployeeTypes();
    this.loadStatistics();
  }

  loadEmployeeTypes(): void {
    this.loading = true;
    this.error = null;

    this.adminStaffService.getEmployeeTypes().subscribe({
      next: (types) => {
        this.employeeTypes = types.sort((a, b) => 
          a.loaiNhanVien.localeCompare(b.loaiNhanVien)
        );
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Không thể tải danh sách loại nhân viên. Vui lòng thử lại.';
        this.loading = false;
        console.error('Error loading employee types:', err);
      }
    });
  }

  loadStatistics(): void {
    this.loadingStats = true;

    this.adminStaffService.getStatistics().subscribe({
      next: (stats) => {
        this.statistics = stats;
        this.loadingStats = false;
      },
      error: (err) => {
        console.error('⚠️ Error loading basic statistics:', err);
        console.error('This is okay - using default values instead');
        // Set default statistics so UI doesn't break
        this.statistics = {
          totalEmployees: 0,
          byBranch: [],
          byType: [],
          totalPayroll: 0
        };
        this.loadingStats = false;
      }
    });
  }

  loadDetailedSalaryStatistics(): void {
    console.log('📊 Starting to load detailed salary statistics...');
    this.loadingSalaryStats = true;
    this.error = null;

    this.adminStaffService.getSalaryStatistics().subscribe({
      next: (stats) => {
        console.log('✅ Salary statistics loaded successfully:', stats);
        this.salaryStatistics = stats;
        this.loadingSalaryStats = false;
        
        // Load comparisons for each employee type
        this.loadSalaryComparisons();
      },
      error: (err) => {
        console.error('❌ Error loading detailed salary statistics:', err);
        console.error('Error status:', err.status);
        console.error('Error message:', err.message);
        console.error('Error details:', err.error);
        
        let errorMessage = 'Không thể tải thống kê chi tiết';
        if (err.status === 404) {
          errorMessage = 'API endpoint không tồn tại';
        } else if (err.status === 500) {
          errorMessage = 'Lỗi server: ' + (err.error?.message || 'Lỗi không xác định');
        } else if (err.status === 0) {
          errorMessage = 'Không thể kết nối đến server';
        }
        
        this.error = errorMessage;
        this.loadingSalaryStats = false;
      }
    });

    // Load forecast
    this.adminStaffService.getSalaryForecast(6).subscribe({
      next: (forecast) => {
        this.salaryForecast = forecast;
      },
      error: (err) => {
        console.error('Error loading salary forecast:', err);
      }
    });
  }

  loadSalaryComparisons(): void {
    if (!this.salaryStatistics) return;

    this.salaryStatistics.byEmployeeType.forEach(typeData => {
      this.adminStaffService.getSalaryComparison(typeData.loaiNhanVien).subscribe({
        next: (comparison) => {
          this.salaryComparisons.set(typeData.loaiNhanVien, comparison);
        },
        error: (err) => {
          console.error(`Error loading comparison for ${typeData.loaiNhanVien}:`, err);
        }
      });
    });
  }

  // ===========================
  // TAB MANAGEMENT
  // ===========================

  switchTab(tab: 'update' | 'bulk' | 'history' | 'statistics'): void {
    this.activeTab = tab;
    this.clearMessages();
    
    // Always load detailed statistics when switching to statistics tab
    if (tab === 'statistics') {
      console.log('📊 Switching to statistics tab, loading data...');
      this.loadDetailedSalaryStatistics();
    }
  }

  // ===========================
  // INDIVIDUAL SALARY UPDATE
  // ===========================

  onTypeSelect(loaiNhanVien: string): void {
    this.selectedType = loaiNhanVien;
    const type = this.employeeTypes.find(t => t.loaiNhanVien === loaiNhanVien);
    this.newSalary = type?.luong || 0;
    this.showUpdatePreview = false;
    this.clearMessages();
  }

  toggleUpdatePreview(): void {
    if (!this.validateUpdateForm()) return;
    this.showUpdatePreview = !this.showUpdatePreview;
  }

  validateUpdateForm(): boolean {
    this.validationErrors = [];

    if (!this.selectedType) {
      this.validationErrors.push({
        field: 'selectedType',
        message: 'Vui lòng chọn loại nhân viên'
      });
    }

    if (!this.newSalary || this.newSalary < 0) {
      this.validationErrors.push({
        field: 'newSalary',
        message: 'Lương mới phải lớn hơn hoặc bằng 0'
      });
    }

    const currentType = this.employeeTypes.find(t => t.loaiNhanVien === this.selectedType);
    if (currentType && this.newSalary === currentType.luong) {
      this.validationErrors.push({
        field: 'newSalary',
        message: 'Lương mới phải khác lương hiện tại'
      });
    }

    if (this.newSalary > 1000000000) {
      this.validationErrors.push({
        field: 'newSalary',
        message: 'Lương không được vượt quá 1 tỷ VNĐ'
      });
    }

    return this.validationErrors.length === 0;
  }

  updateSalary(): void {
    if (!this.validateUpdateForm()) {
      this.error = 'Vui lòng kiểm tra lại thông tin';
      return;
    }

    const currentType = this.employeeTypes.find(t => t.loaiNhanVien === this.selectedType);
    if (!currentType) return;

    const percentageChange = ((this.newSalary - currentType.luong) / currentType.luong) * 100;
    const confirmMessage = `
Xác nhận cập nhật lương:
• Loại nhân viên: ${this.selectedType}
• Lương hiện tại: ${this.formatCurrency(currentType.luong)}
• Lương mới: ${this.formatCurrency(this.newSalary)}
• Thay đổi: ${percentageChange.toFixed(2)}%
${this.updateReason ? `• Lý do: ${this.updateReason}` : ''}

Bạn có chắc chắn muốn tiếp tục?
    `.trim();

    if (!confirm(confirmMessage)) return;

    this.submitting = true;
    this.clearMessages();

    this.adminStaffService.updateEmployeeSalary(this.selectedType, this.newSalary, this.updateReason).subscribe({
      next: (result) => {
        // Add to history
        const change: SalaryChange = {
          loaiNhanVien: this.selectedType,
          oldSalary: currentType.luong,
          newSalary: this.newSalary,
          percentageChange: parseFloat(percentageChange.toFixed(2)),
          reason: this.updateReason || 'Không có lý do',
          timestamp: new Date(),
          affectedEmployees: result.affectedEmployees || 0
        };
        this.addToHistory(change);

        this.successMessage = result.message || 'Cập nhật lương thành công!';
        this.loadEmployeeTypes();
        this.loadStatistics();
        this.resetUpdateForm();
        this.submitting = false;

        // Auto hide success message after 5 seconds
        setTimeout(() => this.successMessage = null, 5000);
      },
      error: (err) => {
        this.error = err.error?.message || 'Không thể cập nhật lương. Vui lòng thử lại.';
        this.submitting = false;
      }
    });
  }

  resetUpdateForm(): void {
    this.selectedType = '';
    this.newSalary = 0;
    this.updateReason = '';
    this.showUpdatePreview = false;
    this.validationErrors = [];
  }

  // ===========================
  // BULK SALARY UPDATE
  // ===========================

  onBulkTypeSelect(loaiNhanVien: string): void {
    this.bulkType = loaiNhanVien;
    this.showBulkPreview = false;
    this.clearMessages();
  }

  toggleBulkPreview(): void {
    if (!this.validateBulkForm()) return;
    this.showBulkPreview = !this.showBulkPreview;
  }

  validateBulkForm(): boolean {
    this.validationErrors = [];

    if (!this.bulkType && !this.applyToAllTypes) {
      this.validationErrors.push({
        field: 'bulkType',
        message: 'Vui lòng chọn loại nhân viên hoặc áp dụng cho tất cả'
      });
    }

    if (this.percentageIncrease === 0) {
      this.validationErrors.push({
        field: 'percentageIncrease',
        message: 'Phần trăm thay đổi không được bằng 0'
      });
    }

    if (this.percentageIncrease < -100) {
      this.validationErrors.push({
        field: 'percentageIncrease',
        message: 'Phần trăm giảm không được vượt quá -100%'
      });
    }

    if (this.percentageIncrease > 1000) {
      this.validationErrors.push({
        field: 'percentageIncrease',
        message: 'Phần trăm tăng không được vượt quá 1000%'
      });
    }

    return this.validationErrors.length === 0;
  }

  bulkUpdateSalary(): void {
    if (!this.validateBulkForm()) {
      this.error = 'Vui lòng kiểm tra lại thông tin';
      return;
    }

    const action = this.percentageIncrease > 0 ? 'tăng' : 'giảm';
    const percentage = Math.abs(this.percentageIncrease);
    const target = this.applyToAllTypes ? 'tất cả loại nhân viên' : this.bulkType;
    
    const confirmMessage = `
Xác nhận ${action} lương hàng loạt:
• Áp dụng cho: ${target}
• Phần trăm ${action}: ${percentage}%
${this.bulkReason ? `• Lý do: ${this.bulkReason}` : ''}

${this.getAffectedTypesPreview()}

Bạn có chắc chắn muốn tiếp tục?
    `.trim();

    if (!confirm(confirmMessage)) return;

    this.submitting = true;
    this.clearMessages();

    // If apply to all, process each type sequentially
    if (this.applyToAllTypes) {
      this.bulkUpdateAllTypes();
    } else {
      this.bulkUpdateSingleType();
    }
  }

  bulkUpdateSingleType(): void {
    this.adminStaffService.bulkUpdateSalary(this.bulkType, this.percentageIncrease, this.bulkReason).subscribe({
      next: (result) => {
        const currentType = this.employeeTypes.find(t => t.loaiNhanVien === this.bulkType);
        if (currentType) {
          const change: SalaryChange = {
            loaiNhanVien: this.bulkType,
            oldSalary: currentType.luong,
            newSalary: result.newSalary || this.calculateNewSalary(currentType.luong, this.percentageIncrease),
            percentageChange: this.percentageIncrease,
            reason: this.bulkReason || 'Cập nhật hàng loạt',
            timestamp: new Date(),
            affectedEmployees: result.affectedEmployees || 0
          };
          this.addToHistory(change);
        }

        this.successMessage = result.message || 'Cập nhật lương hàng loạt thành công!';
        this.loadEmployeeTypes();
        this.loadStatistics();
        this.resetBulkForm();
        this.submitting = false;

        setTimeout(() => this.successMessage = null, 5000);
      },
      error: (err) => {
        this.error = err.error?.message || 'Không thể cập nhật lương hàng loạt. Vui lòng thử lại.';
        this.submitting = false;
      }
    });
  }

  bulkUpdateAllTypes(): void {
    const typesToUpdate = this.getFilteredTypes();
    let completed = 0;
    const total = typesToUpdate.length;

    typesToUpdate.forEach((type, index) => {
      setTimeout(() => {
        this.adminStaffService.bulkUpdateSalary(type.loaiNhanVien, this.percentageIncrease, this.bulkReason).subscribe({
          next: (result) => {
            completed++;

            const change: SalaryChange = {
              loaiNhanVien: type.loaiNhanVien,
              oldSalary: type.luong,
              newSalary: result.newSalary || this.calculateNewSalary(type.luong, this.percentageIncrease),
              percentageChange: this.percentageIncrease,
              reason: this.bulkReason || 'Cập nhật hàng loạt tất cả',
              timestamp: new Date(),
              affectedEmployees: result.affectedEmployees || 0
            };
            this.addToHistory(change);

            if (completed === total) {
              this.successMessage = `Đã cập nhật lương cho ${total} loại nhân viên thành công!`;
              this.loadEmployeeTypes();
              this.loadStatistics();
              this.resetBulkForm();
              this.submitting = false;
              setTimeout(() => this.successMessage = null, 5000);
            }
          },
          error: (err) => {
            console.error(`Error updating ${type.loaiNhanVien}:`, err);
            completed++;
            
            if (completed === total) {
              this.error = 'Một số cập nhật thất bại. Vui lòng kiểm tra lại.';
              this.loadEmployeeTypes();
              this.submitting = false;
            }
          }
        });
      }, index * 300); // Stagger requests by 300ms
    });
  }

  getFilteredTypes(): EmployeeType[] {
    return this.employeeTypes.filter(type => {
      if (this.minCurrentSalary > 0 && type.luong < this.minCurrentSalary) return false;
      if (this.maxCurrentSalary > 0 && type.luong > this.maxCurrentSalary) return false;
      return true;
    });
  }

  getAffectedTypesPreview(): string {
    if (this.applyToAllTypes) {
      const filtered = this.getFilteredTypes();
      return `Sẽ áp dụng cho ${filtered.length} loại nhân viên`;
    }
    
    const type = this.employeeTypes.find(t => t.loaiNhanVien === this.bulkType);
    if (!type) return '';
    
    const newSalary = this.calculateNewSalary(type.luong, this.percentageIncrease);
    return `Lương mới dự kiến: ${this.formatCurrency(newSalary)}`;
  }

  resetBulkForm(): void {
    this.bulkType = '';
    this.percentageIncrease = 0;
    this.bulkReason = '';
    this.showBulkPreview = false;
    this.applyToAllTypes = false;
    this.minCurrentSalary = 0;
    this.maxCurrentSalary = 0;
    this.validationErrors = [];
  }

  // ===========================
  // SALARY HISTORY
  // ===========================

  addToHistory(change: SalaryChange): void {
    this.salaryHistory.unshift(change);
    // Keep only last 50 changes
    if (this.salaryHistory.length > 50) {
      this.salaryHistory = this.salaryHistory.slice(0, 50);
    }
    this.saveSalaryHistoryToStorage();
  }

  saveSalaryHistoryToStorage(): void {
    try {
      localStorage.setItem('salary_history', JSON.stringify(this.salaryHistory));
    } catch (e) {
      console.error('Error saving salary history:', e);
    }
  }

  loadSalaryHistoryFromStorage(): void {
    try {
      const stored = localStorage.getItem('salary_history');
      if (stored) {
        this.salaryHistory = JSON.parse(stored).map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        }));
      }
    } catch (e) {
      console.error('Error loading salary history:', e);
    }
  }

  clearHistory(): void {
    if (confirm('Bạn có chắc chắn muốn xóa toàn bộ lịch sử thay đổi lương?')) {
      this.salaryHistory = [];
      localStorage.removeItem('salary_history');
      this.successMessage = 'Đã xóa lịch sử thành công';
      setTimeout(() => this.successMessage = null, 3000);
    }
  }

  // ===========================
  // SORTING & FILTERING
  // ===========================

  getSortedEmployeeTypes(): EmployeeType[] {
    let filtered = [...this.employeeTypes];

    // Search filter
    if (this.searchTerm) {
      filtered = filtered.filter(t => 
        t.loaiNhanVien.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (this.sortBy) {
        case 'type':
          comparison = a.loaiNhanVien.localeCompare(b.loaiNhanVien);
          break;
        case 'salary':
          comparison = a.luong - b.luong;
          break;
        case 'employees':
          const statsA = this.statistics?.byType.find(s => s.loaiNhanVien === a.loaiNhanVien);
          const statsB = this.statistics?.byType.find(s => s.loaiNhanVien === b.loaiNhanVien);
          comparison = (statsA?.count || 0) - (statsB?.count || 0);
          break;
      }

      return this.sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }

  changeSorting(field: 'type' | 'salary' | 'employees'): void {
    if (this.sortBy === field) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = field;
      this.sortOrder = 'asc';
    }
  }

  getSortIcon(field: 'type' | 'salary' | 'employees'): string {
    if (this.sortBy !== field) return '↕';
    return this.sortOrder === 'asc' ? '↑' : '↓';
  }

  // ===========================
  // UTILITIES
  // ===========================

  calculateNewSalary(currentSalary: number, percentage: number): number {
    return Math.round(currentSalary * (1 + percentage / 100));
  }

  calculateDifference(oldSalary: number, newSalary: number): number {
    return newSalary - oldSalary;
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  }

  formatCurrencyShort(amount: number): string {
    if (amount >= 1000000000) {
      return (amount / 1000000000).toFixed(1) + ' tỷ';
    } else if (amount >= 1000000) {
      return (amount / 1000000).toFixed(1) + ' tr';
    }
    return this.formatCurrency(amount);
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatPercentage(value: number): string {
    const sign = value > 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  }

  getEmployeeCount(loaiNhanVien: string): number {
    const typeStats = this.statistics?.byType.find(s => s.loaiNhanVien === loaiNhanVien);
    return typeStats?.count || 0;
  }

  getTotalPayroll(): number {
    return this.statistics?.totalPayroll || 0;
  }

  getAverageSalary(): number {
    if (!this.employeeTypes.length) return 0;
    const total = this.employeeTypes.reduce((sum, t) => sum + t.luong, 0);
    return total / this.employeeTypes.length;
  }

  getHighestSalary(): number {
    if (!this.employeeTypes.length) return 0;
    return Math.max(...this.employeeTypes.map(t => t.luong));
  }

  getLowestSalary(): number {
    if (!this.employeeTypes.length) return 0;
    return Math.min(...this.employeeTypes.map(t => t.luong));
  }

  hasValidationError(field: string): boolean {
    return this.validationErrors.some(e => e.field === field);
  }

  getValidationError(field: string): string {
    const error = this.validationErrors.find(e => e.field === field);
    return error?.message || '';
  }

  clearMessages(): void {
    this.error = null;
    this.successMessage = null;
    this.validationErrors = [];
  }

  refreshData(): void {
    this.loadAllData();
    this.successMessage = 'Đã làm mới dữ liệu';
    setTimeout(() => this.successMessage = null, 3000);
  }

  // Helper methods for template
  getCurrentSalary(loaiNhanVien: string): number {
    const type = this.employeeTypes.find(t => t.loaiNhanVien === loaiNhanVien);
    return type?.luong || 0;
  }

  getSelectedSalary(): number {
    return this.getCurrentSalary(this.selectedType);
  }

  getBulkSalary(): number {
    return this.getCurrentSalary(this.bulkType);
  }

  calculatePercentageChange(oldSalary: number, newSalary: number): number {
    if (oldSalary === 0) return 0;
    return ((newSalary - oldSalary) / oldSalary) * 100;
  }

  isPositiveChange(oldSalary: number, newSalary: number): boolean {
    return this.calculateDifference(oldSalary, newSalary) > 0;
  }

  isNegativeChange(oldSalary: number, newSalary: number): boolean {
    return this.calculateDifference(oldSalary, newSalary) < 0;
  }

  // ===========================
  // LINE CHART HELPERS
  // ===========================

  getMaxTrendSalary(trends: any[]): number {
    if (!trends || trends.length === 0) return 1;
    return Math.max(...trends.map(t => t.totalSalary || 0));
  }

  getTrendLinePoints(trends: any[]): string {
    if (!trends || trends.length === 0) return '';
    
    const maxSalary = this.getMaxTrendSalary(trends);
    return trends
      .map((trend, i) => {
        const x = 80 + (i * 91.67);
        const y = 250 - ((trend.totalSalary / maxSalary) * 200);
        return `${x},${y}`;
      })
      .join(' ');
  }

  getTrendAreaPoints(trends: any[]): string {
    if (!trends || trends.length === 0) return '';
    
    const maxSalary = this.getMaxTrendSalary(trends);
    const linePoints = trends
      .map((trend, i) => {
        const x = 80 + (i * 91.67);
        const y = 250 - ((trend.totalSalary / maxSalary) * 200);
        return `${x},${y}`;
      })
      .join(' ');
    
    // Create area by adding baseline points
    const baselinePoints = Array(trends.length)
      .fill(null)
      .map((_, i) => `${80 + (i * 91.67)},250`)
      .reverse()
      .join(' ');
    
    return `${linePoints} ${baselinePoints}`;
  }
}
