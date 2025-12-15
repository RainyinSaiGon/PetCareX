import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { BranchService } from '../../services/branch.service';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './employee-list.component.html',
  styleUrls: ['./employee-list.component.css'],
})
export class EmployeeListComponent implements OnInit {
  // Data
  employees: any[] = [];
  branches: any[] = [];
  employeeTypes: any[] = [];

  // Filter & Pagination
  filter = {
    page: 1,
    limit: 10,
    sortBy: 'HoTen',
    sortOrder: 'ASC',
    search: '',
    maChiNhanh: '',
    loaiNhanVien: '',
  };

  totalItems = 0;
  totalPages = 0;

  // UI States
  loading = false;
  error: string | null = null;

  // Bulk operations
  selectedEmployees: Set<string> = new Set();
  showBulkActions = false;
  bulkBranch = '';

  // Expose Math to template
  Math = Math;

  constructor(
    private branchService: BranchService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadReferenceData();
    this.loadEmployees();
  }

  // Navigate to salary management
  navigateToSalary(): void {
    this.router.navigate(['/employees/salary']);
  }

  // Load branches and employee types for filters
  loadReferenceData(): void {
    // Mock data - In production, you'd fetch from service
    this.branches = [
      { MaChiNhanh: 'CN01', TenChiNhanh: 'Chi nhánh Hà Nội' },
      { MaChiNhanh: 'CN02', TenChiNhanh: 'Chi nhánh TP HCM' },
      { MaChiNhanh: 'CN03', TenChiNhanh: 'Chi nhánh Đà Nẵng' },
    ];

    this.employeeTypes = [
      { LoaiNhanVien: 'Bác sĩ' },
      { LoaiNhanVien: 'Tiếp tân' },
      { LoaiNhanVien: 'Nhân viên kho' },
      { LoaiNhanVien: 'Quản lý' },
    ];
  }

  // Load employees from API
  loadEmployees(): void {
    this.loading = true;
    this.error = null;

    this.branchService.getAllEmployees(this.filter.page, this.filter.limit).subscribe({
      next: (response) => {
        // Filter and sort locally if needed
        let filteredEmployees = response.data || [];

        // Apply search filter
        if (this.filter.search) {
          const searchLower = this.filter.search.toLowerCase();
          filteredEmployees = filteredEmployees.filter(
            (emp: any) =>
              emp.HoTen?.toLowerCase().includes(searchLower) ||
              emp.SDT?.includes(this.filter.search) ||
              emp.MaNhanVien?.toLowerCase().includes(searchLower),
          );
        }

        // Apply branch filter
        if (this.filter.maChiNhanh) {
          filteredEmployees = filteredEmployees.filter(
            (emp: any) => emp.MaChiNhanh === this.filter.maChiNhanh,
          );
        }

        // Apply employee type filter
        if (this.filter.loaiNhanVien) {
          filteredEmployees = filteredEmployees.filter(
            (emp: any) => emp.LoaiNhanVien === this.filter.loaiNhanVien,
          );
        }

        // Sort
        filteredEmployees.sort((a: any, b: any) => {
          const aVal = a[this.filter.sortBy] || '';
          const bVal = b[this.filter.sortBy] || '';
          const comparison = aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
          return this.filter.sortOrder === 'ASC' ? comparison : -comparison;
        });

        this.employees = filteredEmployees;
        this.totalItems = response.total || 0;
        this.totalPages = response.totalPages || 1;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Không thể tải danh sách nhân viên. Vui lòng thử lại.';
        this.loading = false;
        console.error('Error loading employees:', err);
      },
    });
  }

  // Search employees
  onSearch(): void {
    this.filter.page = 1;
    this.loadEmployees();
  }

  // Apply filter changes
  onFilterChange(): void {
    this.filter.page = 1;
    this.loadEmployees();
  }

  // Change sort order
  onSortChange(field: string): void {
    if (this.filter.sortBy === field) {
      this.filter.sortOrder = this.filter.sortOrder === 'ASC' ? 'DESC' : 'ASC';
    } else {
      this.filter.sortBy = field;
      this.filter.sortOrder = 'ASC';
    }
    this.loadEmployees();
  }

  // Change page
  onPageChange(page: number): void {
    this.filter.page = page;
    this.loadEmployees();
  }

  // Change page size
  onPageSizeChange(): void {
    this.filter.page = 1;
    this.loadEmployees();
  }

  // View employee details
  viewEmployee(employeeId: string): void {
    this.router.navigate(['/employees', employeeId]);
  }

  // Edit employee
  editEmployee(employeeId: string): void {
    this.router.navigate(['/employees', employeeId, 'edit']);
  }

  // Delete employee
  deleteEmployee(employee: any): void {
    if (confirm(`Bạn có chắc chắn muốn xóa nhân viên ${employee.HoTen}?`)) {
      this.branchService.deleteEmployee(employee.MaNhanVien).subscribe({
        next: () => {
          alert('Xóa nhân viên thành công!');
          this.loadEmployees();
        },
        error: (err) => {
          alert(err.error?.message || 'Không thể xóa nhân viên. Vui lòng thử lại.');
        },
      });
    }
  }

  // Selection management
  toggleSelection(employeeId: string): void {
    if (this.selectedEmployees.has(employeeId)) {
      this.selectedEmployees.delete(employeeId);
    } else {
      this.selectedEmployees.add(employeeId);
    }
    this.showBulkActions = this.selectedEmployees.size > 0;
  }

  toggleSelectAll(event: any): void {
    if (event.target.checked) {
      this.employees.forEach((emp) => this.selectedEmployees.add(emp.MaNhanVien));
    } else {
      this.selectedEmployees.clear();
    }
    this.showBulkActions = this.selectedEmployees.size > 0;
  }

  isSelected(employeeId: string): boolean {
    return this.selectedEmployees.has(employeeId);
  }

  // Bulk assign branch
  bulkAssignBranch(): void {
    if (!this.bulkBranch) {
      alert('Vui lòng chọn chi nhánh!');
      return;
    }

    const employeeList = Array.from(this.selectedEmployees);
    const updateRequests = employeeList.map((empId) =>
      this.branchService.updateEmployee(empId, { MaChiNhanh: this.bulkBranch }),
    );

    // Execute all updates
    Promise.all(updateRequests.map((req) => req.toPromise()))
      .then(() => {
        alert('Chuyển chi nhánh thành công!');
        this.selectedEmployees.clear();
        this.showBulkActions = false;
        this.bulkBranch = '';
        this.loadEmployees();
      })
      .catch((err) => {
        alert('Lỗi: ' + (err?.error?.message || 'Không thể chuyển chi nhánh'));
      });
  }

  // Clear all filters
  clearFilters(): void {
    this.filter = {
      page: 1,
      limit: 10,
      sortBy: 'HoTen',
      sortOrder: 'ASC',
      search: '',
      maChiNhanh: '',
      loaiNhanVien: '',
    };
    this.loadEmployees();
  }

  // Format currency
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  }

  // Format date
  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('vi-VN');
  }

  // Get sort icon
  getSortIcon(field: string): string {
    if (this.filter.sortBy !== field) return '↕️';
    return this.filter.sortOrder === 'ASC' ? '↑' : '↓';
  }

  // Get page numbers for pagination
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

  // Create new employee
  createEmployee(): void {
    this.router.navigate(['/employees/new']);
  }
}
