import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { BranchService } from '../../services/branch.service';

// Interfaces
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

interface EmployeeStats {
  loaiNhanVien: string;
  count: number;
  averageSalary: number;
  totalSalaryBudget: number;
}

interface SalaryStatistics {
  totalEmployees: number;
  totalSalaryBudget: number;
  averageSalary: number;
  highestSalary: number;
  lowestSalary: number;
  byType: EmployeeStats[];
}

interface SalaryComparison {
  loaiNhanVien: string;
  currentSalary: number;
  systemAverage: number;
  percentageOfAverage: number;
  recommendation: string;
}

interface SalaryForecast {
  month: string;
  estimatedBudget: number;
  projectedEmployeeCount: number;
  estimatedAverageSalary: number;
}

@Component({
  selector: 'app-employee-salary',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './employee-salary.component.html',
  styleUrls: ['./employee-salary.component.css'],
})
export class EmployeeSalaryComponent implements OnInit {
  @ViewChild('historyContainer', { static: false }) historyContainer!: ElementRef;

  // Form declarations
  updateForm!: FormGroup;
  bulkForm!: FormGroup;

  // Data properties
  employeeTypes: string[] = ['Bác sĩ', 'Tiếp tân', 'Nhân viên kho', 'Quản lý'];
  statistics: SalaryStatistics | null = null;
  salaryHistory: SalaryChange[] = [];
  salaryComparisons: Map<string, SalaryComparison> = new Map();
  salaryForecasts: SalaryForecast[] = [];

  // UI state
  loading = false;
  loadingStats = false;
  loadingSalaryStats = false;
  submitting = false;
  activeTab: 'update' | 'bulk' | 'history' | 'statistics' = 'update';
  error: string | null = null;
  successMessage: string | null = null;
  validationErrors: ValidationError[] = [];

  // Update tab state
  showUpdatePreview = false;
  previewUpdateData: any = null;

  // Bulk update tab state
  showBulkPreview = false;
  previewBulkData: any = null;
  bulkAffectedCount = 0;
  applyToAllTypes = false;
  showAdvancedFilters = false;
  minCurrentSalary = 0;
  maxCurrentSalary = 100000000;

  // Statistics tab sorting
  sortBy: 'type' | 'salary' | 'count' = 'type';
  sortOrder: 'asc' | 'desc' = 'asc';
  searchTerm = '';

  constructor(
    private formBuilder: FormBuilder,
    private branchService: BranchService,
  ) {}

  ngOnInit(): void {
    this.initForms();
    this.loadSalaryData();
    this.loadSalaryHistoryFromStorage();
  }

  initForms(): void {
    this.updateForm = this.formBuilder.group({
      selectedType: ['', Validators.required],
      newSalary: ['', [Validators.required, Validators.min(0)]],
      updateReason: [''],
    });

    this.bulkForm = this.formBuilder.group({
      bulkType: [''],
      percentageIncrease: ['', [Validators.required, Validators.min(-100), Validators.max(100)]],
      bulkReason: [''],
      minSalary: [0],
      maxSalary: [100000000],
    });
  }

  loadSalaryData(): void {
    this.loadingStats = true;
    this.branchService.getAllEmployees(1, 1000).subscribe({
      next: (response: any) => {
        const employees = response.data || [];
        
        if (employees.length === 0) {
          // No employees, show empty statistics
          this.statistics = {
            totalEmployees: 0,
            totalSalaryBudget: 0,
            averageSalary: 0,
            highestSalary: 0,
            lowestSalary: 0,
            byType: [],
          };
          this.loadingStats = false;
          return;
        }

        // Calculate statistics from real employee data
        const employeesByType: { [key: string]: any[] } = {};
        let totalSalary = 0;
        let highestSalary = 0;
        let lowestSalary = Infinity;

        employees.forEach((emp: any) => {
          const type = emp.loaiNhanVien || 'Unknown';
          const salary = emp.luongBac || 0;

          if (!employeesByType[type]) {
            employeesByType[type] = [];
          }
          employeesByType[type].push(emp);
          totalSalary += salary;
          highestSalary = Math.max(highestSalary, salary);
          lowestSalary = Math.min(lowestSalary, salary);
        });

        // Build statistics by type
        const byType = Object.entries(employeesByType).map(([type, emps]) => {
          const typeSalaries = (emps as any[]).map(e => e.luongBac || 0);
          const totalTypeSalary = typeSalaries.reduce((a, b) => a + b, 0);
          return {
            loaiNhanVien: type,
            count: emps.length,
            averageSalary: totalTypeSalary / emps.length,
            totalSalaryBudget: totalTypeSalary,
          };
        });

        this.statistics = {
          totalEmployees: employees.length,
          totalSalaryBudget: totalSalary,
          averageSalary: totalSalary / employees.length,
          highestSalary: highestSalary || 0,
          lowestSalary: lowestSalary === Infinity ? 0 : lowestSalary,
          byType,
        };

        // Mock comparisons
        this.employeeTypes.forEach((type) => {
          const typeStats = this.statistics?.byType.find((s) => s.loaiNhanVien === type);
          if (typeStats) {
            this.salaryComparisons.set(type, {
              loaiNhanVien: type,
              currentSalary: typeStats.averageSalary,
              systemAverage: this.statistics?.averageSalary || 0,
              percentageOfAverage: (typeStats.averageSalary / (this.statistics?.averageSalary || 1)) * 100,
              recommendation:
                typeStats.averageSalary < (this.statistics?.averageSalary || 0) * 0.8
                  ? 'Cần xem xét tăng lương'
                  : 'Mức lương hợp lý',
            });
          }
        });

        // Mock forecasts
        this.salaryForecasts = [
          { month: 'Tháng 1', estimatedBudget: totalSalary * 1.02, projectedEmployeeCount: employees.length + 1, estimatedAverageSalary: (totalSalary * 1.02) / (employees.length + 1) },
          { month: 'Tháng 2', estimatedBudget: totalSalary * 1.04, projectedEmployeeCount: employees.length + 2, estimatedAverageSalary: (totalSalary * 1.04) / (employees.length + 2) },
          { month: 'Tháng 3', estimatedBudget: totalSalary * 1.06, projectedEmployeeCount: employees.length + 3, estimatedAverageSalary: (totalSalary * 1.06) / (employees.length + 3) },
        ];

        this.loadingStats = false;
      },
      error: (err) => {
        console.error('Error loading employee data:', err);
        this.statistics = {
          totalEmployees: 0,
          totalSalaryBudget: 0,
          averageSalary: 0,
          highestSalary: 0,
          lowestSalary: 0,
          byType: [],
        };
        this.loadingStats = false;
      },
    });
  }

  loadSalaryHistoryFromStorage(): void {
    const stored = localStorage.getItem('salaryHistory');
    if (stored) {
      this.salaryHistory = JSON.parse(stored).map((h: any) => ({
        ...h,
        timestamp: new Date(h.timestamp),
      }));
    }
  }

  saveSalaryHistoryToStorage(): void {
    localStorage.setItem('salaryHistory', JSON.stringify(this.salaryHistory));
  }

  // Update Salary Tab Methods
  onUpdateFormChange(): void {
    this.showUpdatePreview = false;
    this.previewUpdateData = null;
  }

  previewSalaryUpdate(): void {
    if (!this.updateForm.valid) return;

    const selectedType = this.updateForm.get('selectedType')?.value;
    const newSalary = this.updateForm.get('newSalary')?.value;
    const typeStats = this.statistics?.byType.find((s) => s.loaiNhanVien === selectedType);

    if (typeStats) {
      const oldSalary = typeStats.averageSalary;
      const percentageChange = ((newSalary - oldSalary) / oldSalary) * 100;

      this.previewUpdateData = {
        loaiNhanVien: selectedType,
        oldSalary,
        newSalary,
        percentageChange,
        affectedEmployees: typeStats.count,
        totalBudgetIncrease: (newSalary - oldSalary) * typeStats.count,
      };
      this.showUpdatePreview = true;
    }
  }

  submitSalaryUpdate(): void {
    if (!this.updateForm.valid || !this.previewUpdateData) {
      this.error = 'Vui lòng điền đầy đủ thông tin';
      return;
    }

    this.submitting = true;
    const formValue = this.updateForm.value;

    // Mock API call
    setTimeout(() => {
      const salaryChange: SalaryChange = {
        loaiNhanVien: formValue.selectedType,
        oldSalary: this.previewUpdateData.oldSalary,
        newSalary: formValue.newSalary,
        percentageChange: this.previewUpdateData.percentageChange,
        reason: formValue.updateReason || 'Cập nhật lương',
        timestamp: new Date(),
        affectedEmployees: this.previewUpdateData.affectedEmployees,
      };

      this.salaryHistory.unshift(salaryChange);
      this.saveSalaryHistoryToStorage();
      this.successMessage = `Cập nhật lương thành công cho ${formValue.selectedType} (${this.previewUpdateData.affectedEmployees} nhân viên)`;

      this.updateForm.reset();
      this.showUpdatePreview = false;
      this.previewUpdateData = null;
      this.submitting = false;

      setTimeout(() => (this.successMessage = null), 3000);
    }, 1000);
  }

  // Bulk Update Tab Methods
  onBulkFormChange(): void {
    this.showBulkPreview = false;
    this.previewBulkData = null;
  }

  previewBulkUpdate(): void {
    if (!this.bulkForm.valid) return;

    const percentageIncrease = this.bulkForm.get('percentageIncrease')?.value;
    const bulkType = this.bulkForm.get('bulkType')?.value;
    const minSalary = this.bulkForm.get('minSalary')?.value || 0;
    const maxSalary = this.bulkForm.get('maxSalary')?.value || 100000000;

    let affectedTypes = bulkType ? [bulkType] : this.employeeTypes;
    let totalBudgetIncrease = 0;
    let affectedEmployees = 0;

    const preview = affectedTypes
      .map((type) => {
        const typeStats = this.statistics?.byType.find((s) => s.loaiNhanVien === type);
        if (typeStats && typeStats.averageSalary >= minSalary && typeStats.averageSalary <= maxSalary) {
          const oldSalary = typeStats.averageSalary;
          const newSalary = oldSalary * (1 + percentageIncrease / 100);
          const increase = newSalary - oldSalary;
          const budgetIncrease = increase * typeStats.count;

          totalBudgetIncrease += budgetIncrease;
          affectedEmployees += typeStats.count;

          return {
            loaiNhanVien: type,
            affectedCount: typeStats.count,
            oldSalary,
            newSalary,
            perTypeIncrease: increase,
            totalTypeIncrease: budgetIncrease,
          };
        }
        return null;
      })
      .filter((p) => p !== null);

    this.previewBulkData = {
      changes: preview,
      totalBudgetIncrease,
      affectedEmployees,
      percentageIncrease,
    };

    this.bulkAffectedCount = affectedEmployees;
    this.showBulkPreview = true;
  }

  submitBulkUpdate(): void {
    if (!this.bulkForm.valid || !this.previewBulkData) {
      this.error = 'Vui lòng xem trước trước khi cập nhật';
      return;
    }

    if (!confirm(`Bạn có chắc muốn cập nhật lương cho ${this.previewBulkData.affectedEmployees} nhân viên?`)) {
      return;
    }

    this.submitting = true;

    // Mock API call
    setTimeout(() => {
      this.previewBulkData.changes.forEach((change: any) => {
        const salaryChange: SalaryChange = {
          loaiNhanVien: change.loaiNhanVien,
          oldSalary: change.oldSalary,
          newSalary: change.newSalary,
          percentageChange: ((change.newSalary - change.oldSalary) / change.oldSalary) * 100,
          reason: this.bulkForm.get('bulkReason')?.value || 'Cập nhật lương hàng loạt',
          timestamp: new Date(),
          affectedEmployees: change.affectedCount,
        };

        this.salaryHistory.unshift(salaryChange);
      });

      this.saveSalaryHistoryToStorage();
      this.successMessage = `Cập nhật lương thành công cho ${this.previewBulkData.affectedEmployees} nhân viên`;

      this.bulkForm.reset();
      this.showBulkPreview = false;
      this.previewBulkData = null;
      this.submitting = false;

      setTimeout(() => (this.successMessage = null), 3000);
    }, 1000);
  }

  toggleAdvancedFilters(): void {
    this.showAdvancedFilters = !this.showAdvancedFilters;
  }

  // Statistics Tab Methods
  getSortedStatistics(): SalaryStatistics | null {
    if (!this.statistics) return null;

    const copy = JSON.parse(JSON.stringify(this.statistics));

    copy.byType.sort((a: EmployeeStats, b: EmployeeStats) => {
      let aVal: any, bVal: any;

      switch (this.sortBy) {
        case 'type':
          aVal = a.loaiNhanVien;
          bVal = b.loaiNhanVien;
          break;
        case 'salary':
          aVal = a.averageSalary;
          bVal = b.averageSalary;
          break;
        case 'count':
          aVal = a.count;
          bVal = b.count;
          break;
      }

      if (this.sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    return copy;
  }

  getFilteredComparisons(): [string, SalaryComparison][] {
    const entries = Array.from(this.salaryComparisons.entries());
    return entries
      .filter(([type]) => type.toLowerCase().includes(this.searchTerm.toLowerCase()))
      .sort(([, a], [, b]) => {
        if (this.sortOrder === 'asc') {
          return a.currentSalary - b.currentSalary;
        }
        return b.currentSalary - a.currentSalary;
      });
  }

  changeSortOption(option: 'type' | 'salary' | 'count'): void {
    if (this.sortBy === option) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = option;
      this.sortOrder = 'asc';
    }
  }

  // Utility methods
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('vi-VN');
  }

  getPercentageColor(percentage: number): string {
    if (percentage >= 10) return '#27ae60';
    if (percentage >= 5) return '#f39c12';
    return '#e74c3c';
  }

  clearHistory(): void {
    if (confirm('Bạn có chắc muốn xóa lịch sử cập nhật lương?')) {
      this.salaryHistory = [];
      localStorage.removeItem('salaryHistory');
      this.successMessage = 'Lịch sử cập nhật đã bị xóa';
      setTimeout(() => (this.successMessage = null), 2000);
    }
  }

  exportHistory(): void {
    const dataStr = JSON.stringify(this.salaryHistory, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `salary-history-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  }

  switchTab(tab: 'update' | 'bulk' | 'history' | 'statistics'): void {
    this.activeTab = tab;
    this.error = null;
    this.successMessage = null;

    if (tab === 'statistics') {
      this.loadSalaryData();
    }
  }
}
