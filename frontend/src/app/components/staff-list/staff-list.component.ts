import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AdminStaffService, Employee, EmployeeFilter, Branch, EmployeeType } from '../../services/admin-staff.service';

@Component({
  selector: 'app-staff-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './staff-list.component.html',
  styleUrls: ['./staff-list.component.css']
})
export class StaffListComponent implements OnInit {
  employees: Employee[] = [];
  branches: Branch[] = [];
  employeeTypes: EmployeeType[] = [];
  
  // Filters
  filter: EmployeeFilter = {
    page: 1,
    limit: 10,
    sortBy: 'hoTen',
    sortOrder: 'ASC'
  };

  // Pagination
  totalEmployees = 0;
  totalPages = 0;
  
  // Loading states
  loading = false;
  error: string | null = null;

  // Selection for bulk operations
  selectedEmployees: Set<string> = new Set();
  showBulkActions = false;
  bulkBranch = '';

  // Expose Math to template
  Math = Math;
  
  constructor(
    private adminStaffService: AdminStaffService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadReferenceData();
    this.loadEmployees();
  }

  loadReferenceData(): void {
    this.adminStaffService.getBranches().subscribe({
      next: (branches) => this.branches = branches,
      error: (err) => console.error('Error loading branches:', err)
    });

    this.adminStaffService.getEmployeeTypes().subscribe({
      next: (types) => this.employeeTypes = types,
      error: (err) => console.error('Error loading employee types:', err)
    });
  }

  loadEmployees(): void {
    this.loading = true;
    this.error = null;

    this.adminStaffService.getEmployees(this.filter).subscribe({
      next: (response) => {
        this.employees = response.data;
        this.totalEmployees = response.pagination.total;
        this.totalPages = response.pagination.totalPages;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Không thể tải danh sách nhân viên. Vui lòng thử lại.';
        this.loading = false;
        console.error('Error loading employees:', err);
      }
    });
  }

  onSearch(): void {
    this.filter.page = 1;
    this.loadEmployees();
  }

  onFilterChange(): void {
    this.filter.page = 1;
    this.loadEmployees();
  }

  onSortChange(field: string): void {
    if (this.filter.sortBy === field) {
      this.filter.sortOrder = this.filter.sortOrder === 'ASC' ? 'DESC' : 'ASC';
    } else {
      this.filter.sortBy = field;
      this.filter.sortOrder = 'ASC';
    }
    this.loadEmployees();
  }

  onPageChange(page: number): void {
    this.filter.page = page;
    this.loadEmployees();
  }

  onPageSizeChange(): void {
    this.filter.page = 1;
    this.loadEmployees();
  }

  viewEmployee(maNhanVien: string): void {
    this.router.navigate(['/admin/staff', maNhanVien]);
  }

  editEmployee(maNhanVien: string): void {
    this.router.navigate(['/admin/staff', maNhanVien, 'edit']);
  }

  deleteEmployee(employee: Employee): void {
    if (confirm(`Bạn có chắc chắn muốn xóa nhân viên ${employee.HoTen}?`)) {
      this.adminStaffService.deleteEmployee(employee.MaNhanVien).subscribe({
        next: () => {
          alert('Xóa nhân viên thành công!');
          this.loadEmployees();
        },
        error: (err) => {
          alert(err.error?.message || 'Không thể xóa nhân viên. Vui lòng thử lại.');
        }
      });
    }
  }

  // Selection methods
  toggleSelection(maNhanVien: string): void {
    if (this.selectedEmployees.has(maNhanVien)) {
      this.selectedEmployees.delete(maNhanVien);
    } else {
      this.selectedEmployees.add(maNhanVien);
    }
    this.showBulkActions = this.selectedEmployees.size > 0;
  }

  toggleSelectAll(event: any): void {
    if (event.target.checked) {
      this.employees.forEach(emp => this.selectedEmployees.add(emp.MaNhanVien));
    } else {
      this.selectedEmployees.clear();
    }
    this.showBulkActions = this.selectedEmployees.size > 0;
  }

  isSelected(maNhanVien: string): boolean {
    return this.selectedEmployees.has(maNhanVien);
  }

  bulkAssignBranch(): void {
    if (!this.bulkBranch) {
      alert('Vui lòng chọn chi nhánh!');
      return;
    }

    const employeeList = Array.from(this.selectedEmployees);
    this.adminStaffService.bulkAssignBranch(employeeList, this.bulkBranch).subscribe({
      next: (result) => {
        alert(result.message);
        this.selectedEmployees.clear();
        this.showBulkActions = false;
        this.bulkBranch = '';
        this.loadEmployees();
      },
      error: (err) => {
        alert(err.error?.message || 'Không thể chuyển chi nhánh. Vui lòng thử lại.');
      }
    });
  }

  clearFilters(): void {
    this.filter = {
      page: 1,
      limit: 10,
      sortBy: 'hoTen',
      sortOrder: 'ASC'
    };
    this.loadEmployees();
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('vi-VN');
  }

  getSortIcon(field: string): string {
    if (this.filter.sortBy !== field) return '↕';
    return this.filter.sortOrder === 'ASC' ? '↑' : '↓';
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const currentPage = this.filter.page || 1;
    const start = Math.max(1, currentPage - 2);
    const end = Math.min(this.totalPages, currentPage + 2);
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }
}
