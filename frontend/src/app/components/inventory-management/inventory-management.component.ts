import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BranchService } from '../../services/branch.service';

@Component({
  selector: 'app-inventory-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inventory-management.component.html',
  styleUrls: ['./inventory-management.component.css'],
})
export class InventoryManagementComponent implements OnInit {
  inventories: any[] = [];
  lowStockAlerts: any[] = [];
  summary: any = null;
  loading = true;
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;
  activeTab = 'inventory'; // 'inventory', 'alerts', 'import-export'

  importData = { MaChiNhanh: '', MaSanPham: 0, SoLuong: 0, GhiChu: '' };
  exportData = { MaChiNhanh: '', MaSanPham: 0, SoLuong: 0, GhiChu: '' };
  branches: any[] = [];

  constructor(private branchService: BranchService) {}

  ngOnInit(): void {
    this.loadInventories();
  }

  loadInventories(): void {
    this.loading = true;

    this.branchService.getAllInventoryLevels(this.currentPage, this.itemsPerPage).subscribe({
      next: (response) => {
        this.inventories = response.data || [];
        this.totalItems = response.total || 0;
      },
      error: (err) => console.error('Failed to load inventories:', err),
    });

    this.branchService.getLowStockAlerts().subscribe({
      next: (response) => {
        this.lowStockAlerts = response.data || [];
      },
      error: (err) => console.error('Failed to load alerts:', err),
    });

    this.branchService.getInventorySummary().subscribe({
      next: (data) => {
        this.summary = data;
        this.loading = false;
      },
      error: (err) => console.error('Failed to load summary:', err),
    });
  }

  onImport(): void {
    if (!this.importData.MaChiNhanh || !this.importData.MaSanPham || !this.importData.SoLuong) {
      alert('Vui lòng điền đầy đủ thông tin');
      return;
    }

    this.branchService.createInventoryImport(this.importData).subscribe({
      next: () => {
        alert('Nhập kho thành công');
        this.importData = { MaChiNhanh: '', MaSanPham: 0, SoLuong: 0, GhiChu: '' };
        this.loadInventories();
      },
      error: (err) => alert('Lỗi: ' + err.error?.message),
    });
  }

  onExport(): void {
    if (!this.exportData.MaChiNhanh || !this.exportData.MaSanPham || !this.exportData.SoLuong) {
      alert('Vui lòng điền đầy đủ thông tin');
      return;
    }

    this.branchService.createInventoryExport(this.exportData).subscribe({
      next: () => {
        alert('Xuất kho thành công');
        this.exportData = { MaChiNhanh: '', MaSanPham: 0, SoLuong: 0, GhiChu: '' };
        this.loadInventories();
      },
      error: (err) => alert('Lỗi: ' + err.error?.message),
    });
  }

  getStatusBadge(status: string): string {
    if (status === 'Out of Stock') return '🔴';
    if (status === 'Low Stock') return '🟡';
    return '🟢';
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);
  }

  onPageChange(page: number): void {
    if (page > 0 && page <= Math.ceil(this.totalItems / this.itemsPerPage)) {
      this.currentPage = page;
      this.loadInventories();
    }
  }
}
