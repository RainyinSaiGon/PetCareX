import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BranchService } from '../../services/branch.service';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-inventory-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inventory-management.component.html',
  styleUrls: ['./inventory-management.component.css']
})
export class InventoryManagementComponent implements OnInit, OnDestroy {
  activeTab: 'overview' | 'alerts' | 'transactions' | 'search' = 'overview';
  loading = false;

  inventories: any[] = [];
  allInventories: any[] = []; // Keep original data
  lowStockAlerts: any[] = [];
  summary: any;
  searchResults: any[] = [];

  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;

  importData = { MaChiNhanh: '', MaSanPham: '', SoLuong: 0, GhiChu: '' };
  exportData = { MaChiNhanh: '', MaSanPham: '', SoLuong: 0, GhiChu: '' };

  branches: any[] = [];
  searchTerm = '';
  searchLoading = false;

  // Filter properties
  filterBranch = '';
  filterStatus = '';

  private destroy$ = new Subject<void>();
  Math = Math; // Expose Math object to template

  constructor(private branchService: BranchService) { }

  ngOnInit() {
    this.loadInitialData();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadInitialData() {
    this.loading = true;

    // Load inventory data with server-side pagination
    this.loadInventories();

    this.branchService.getLowStockAlerts()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          this.lowStockAlerts = data.data || [];
        },
        error: (err) => console.error('Error loading alerts:', err)
      });

    this.branchService.getInventorySummary()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          this.summary = data || {};
        },
        error: (err) => console.error('Error loading summary:', err)
      });

    this.branchService.getBranches()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          this.branches = data.data || data || [];
          console.log('Branches loaded:', this.branches);
        },
        error: (err: any) => console.error('Error loading branches:', err)
      });
  }

  loadInventories() {
    this.loading = true;
    this.branchService.getAllInventoryLevels(this.currentPage, this.itemsPerPage)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          this.inventories = data.data || [];
          this.allInventories = [...this.inventories];
          // Use total from server response for accurate pagination
          this.totalItems = data.total || data.pagination?.total || this.inventories.length;
          this.loading = false;
        },
        error: (err) => {
          console.error('Error loading inventories:', err);
          this.loading = false;
          this.showError('Lỗi tải danh sách kho hàng');
        }
      });
  }

  switchTab(tab: 'overview' | 'alerts' | 'transactions' | 'search') {
    this.activeTab = tab;
    this.searchResults = [];
    this.searchTerm = '';
  }

  onImport() {
    if (!this.importData.MaChiNhanh || !this.importData.MaSanPham || this.importData.SoLuong <= 0) {
      this.showError('Vui lòng điền đầy đủ thông tin nhập kho');
      return;
    }

    this.loading = true;
    this.branchService.createInventoryImport(this.importData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.showSuccess('Nhập kho thành công');
          this.importData = { MaChiNhanh: '', MaSanPham: '', SoLuong: 0, GhiChu: '' };
          this.loadInitialData();
        },
        error: (err) => {
          this.showError('Nhập kho thất bại: ' + (err.error?.message || err.message));
          this.loading = false;
        }
      });
  }

  onExport() {
    if (!this.exportData.MaChiNhanh || !this.exportData.MaSanPham || this.exportData.SoLuong <= 0) {
      this.showError('Vui lòng điền đầy đủ thông tin xuất kho');
      return;
    }

    this.loading = true;
    this.branchService.createInventoryExport(this.exportData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.showSuccess('Xuất kho thành công');
          this.exportData = { MaChiNhanh: '', MaSanPham: '', SoLuong: 0, GhiChu: '' };
          this.loadInitialData();
        },
        error: (err) => {
          this.showError('Xuất kho thất bại: ' + (err.error?.message || err.message));
          this.loading = false;
        }
      });
  }

  performSearch() {
    if (!this.searchTerm.trim()) {
      this.showError('Vui lòng nhập từ khóa tìm kiếm');
      return;
    }

    this.searchLoading = true;
    this.branchService.searchInventory(this.searchTerm, 1, 50)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          this.searchResults = data.data || [];
          this.searchLoading = false;
          if (this.searchResults.length === 0) {
            this.showInfo('Không tìm thấy kết quả phù hợp');
          }
        },
        error: (err) => {
          this.showError('Lỗi tìm kiếm: ' + (err.error?.message || err.message));
          this.searchLoading = false;
        }
      });
  }

  onPageChange(page: number) {
    const totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
    if (page < 1 || page > totalPages) return;

    this.currentPage = page;
    // Server-side pagination - reload data for new page
    this.loadInventories();
  }

  formatCurrency(value: number): string {
    if (!value) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0);
  }

  getPagedInventories(): any[] {
    // Data is already paged from server, return as-is
    return this.inventories;
  }

  onImageError(event: any) {
    event.target.src = 'https://via.placeholder.com/300x300?text=No+Image';
  }

  getStatusColor(status: string): string {
    const statusMap: { [key: string]: string } = {
      'In Stock': 'success',
      'Low Stock': 'warning',
      'Out of Stock': 'danger'
    };
    return statusMap[status] || 'secondary';
  }

  applyFilters() {
    this.loading = true;
    this.currentPage = 1;

    // If a branch is selected, use branch-specific API
    if (this.filterBranch) {
      this.branchService.getInventoryLevelsByBranch(this.filterBranch, this.currentPage, this.itemsPerPage)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (data: any) => {
            let filtered = data.data || [];

            // Apply status filter on client-side if needed
            if (this.filterStatus) {
              const statusMap: { [key: string]: string } = {
                'in-stock': 'In Stock',
                'low-stock': 'Low Stock',
                'out-of-stock': 'Out of Stock'
              };
              const statusValue = statusMap[this.filterStatus];
              filtered = filtered.filter((inv: any) => inv.Status === statusValue);
            }

            this.inventories = filtered;
            this.totalItems = data.total || filtered.length;
            this.loading = false;
          },
          error: (err) => {
            console.error('Error loading branch inventory:', err);
            this.loading = false;
            this.showError('Lỗi tải dữ liệu kho');
          }
        });
    } else {
      // No branch selected - load all inventories
      this.branchService.getAllInventoryLevels(this.currentPage, this.itemsPerPage)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (data: any) => {
            let filtered = data.data || [];

            // Apply status filter if needed
            if (this.filterStatus) {
              const statusMap: { [key: string]: string } = {
                'in-stock': 'In Stock',
                'low-stock': 'Low Stock',
                'out-of-stock': 'Out of Stock'
              };
              const statusValue = statusMap[this.filterStatus];
              filtered = filtered.filter((inv: any) => inv.Status === statusValue);
            }

            this.inventories = filtered;
            this.totalItems = data.total || filtered.length;
            this.loading = false;
          },
          error: (err) => {
            console.error('Error loading inventory:', err);
            this.loading = false;
            this.showError('Lỗi tải dữ liệu kho');
          }
        });
    }
  }

  resetFilters() {
    this.filterBranch = '';
    this.filterStatus = '';
    this.currentPage = 1;
    this.loadInventories();
  }

  // Notification helpers
  private showSuccess(message: string) {
    console.log('✓ Success:', message);
    // TODO: Integrate with Toast/Snackbar service
  }

  private showError(message: string) {
    console.error('✗ Error:', message);
    // TODO: Integrate with Toast/Snackbar service
  }

  private showInfo(message: string) {
    console.info('ℹ Info:', message);
    // TODO: Integrate with Toast/Snackbar service
  }
}
