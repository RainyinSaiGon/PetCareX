import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import {
    InvoiceService,
    Invoice,
    InvoiceDetail,
    InvoiceStatistics,
    InvoiceFilter
} from '../../services/invoice.service';

@Component({
    selector: 'app-invoice-management',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './invoice-management.component.html',
    styleUrls: ['./invoice-management.component.css']
})
export class InvoiceManagementComponent implements OnInit, OnDestroy {
    private destroy$ = new Subject<void>();
    private searchSubject = new Subject<string>();

    // Data
    invoices: Invoice[] = [];
    statistics: InvoiceStatistics | null = null;
    branches: { maChiNhanh: string; tenChiNhanh: string }[] = [];
    selectedInvoice: InvoiceDetail | null = null;

    // Filters
    filters: InvoiceFilter = {
        page: 1,
        limit: 20,
        sortBy: 'NgayLap',
        sortOrder: 'DESC'
    };
    searchQuery = '';

    // Pagination
    pagination = {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0
    };

    // UI State
    loading = false;
    detailLoading = false;
    showDetailModal = false;
    showStatusModal = false;
    selectedStatus = '';
    notification: { type: 'success' | 'error' | 'info'; message: string } | null = null;

    // Status options
    statusOptions = [
        'Đã đặt hàng',
        'Đã thanh toán',
        'Đang giao',
        'Đã hoàn thành',
        'Đã hủy'
    ];

    constructor(private invoiceService: InvoiceService) { }

    ngOnInit(): void {
        this.loadInitialData();
        this.setupSearchDebounce();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    private setupSearchDebounce(): void {
        this.searchSubject.pipe(
            debounceTime(400),
            distinctUntilChanged(),
            takeUntil(this.destroy$)
        ).subscribe(search => {
            this.filters.search = search || undefined;
            this.filters.page = 1;
            this.loadInvoices();
        });
    }

    loadInitialData(): void {
        this.loadStatistics();
        this.loadBranches();
        this.loadInvoices();
    }

    loadStatistics(): void {
        this.invoiceService.getStatistics()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (data) => this.statistics = data,
                error: (err) => console.error('Failed to load statistics:', err)
            });
    }

    loadBranches(): void {
        this.invoiceService.getBranches()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (data) => this.branches = data,
                error: (err) => console.error('Failed to load branches:', err)
            });
    }

    loadInvoices(): void {
        this.loading = true;
        this.invoiceService.getInvoices(this.filters)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (response) => {
                    this.invoices = response.invoices;
                    this.pagination = response.pagination;
                    this.loading = false;
                },
                error: (err) => {
                    console.error('Failed to load invoices:', err);
                    this.showNotification('error', 'Không thể tải danh sách hóa đơn');
                    this.loading = false;
                }
            });
    }

    onSearchChange(): void {
        this.searchSubject.next(this.searchQuery);
    }

    onFilterChange(): void {
        this.filters.page = 1;
        this.loadInvoices();
    }

    clearFilters(): void {
        this.searchQuery = '';
        this.filters = {
            page: 1,
            limit: 20,
            sortBy: 'NgayLap',
            sortOrder: 'DESC'
        };
        this.loadInvoices();
    }

    onPageChange(page: number): void {
        if (page >= 1 && page <= this.pagination.totalPages) {
            this.filters.page = page;
            this.loadInvoices();
        }
    }

    viewInvoiceDetail(invoice: Invoice): void {
        this.detailLoading = true;
        this.showDetailModal = true;

        this.invoiceService.getInvoiceById(invoice.maHoaDon)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (detail) => {
                    this.selectedInvoice = detail;
                    this.detailLoading = false;
                },
                error: (err) => {
                    console.error('Failed to load invoice detail:', err);
                    this.showNotification('error', 'Không thể tải chi tiết hóa đơn');
                    this.detailLoading = false;
                    this.showDetailModal = false;
                }
            });
    }

    closeDetailModal(): void {
        this.showDetailModal = false;
        this.selectedInvoice = null;
    }

    openStatusModal(invoice: Invoice): void {
        this.selectedInvoice = invoice as any;
        this.selectedStatus = invoice.trangThai;
        this.showStatusModal = true;
    }

    closeStatusModal(): void {
        this.showStatusModal = false;
        this.selectedStatus = '';
    }

    updateStatus(): void {
        if (!this.selectedInvoice || !this.selectedStatus) return;

        this.invoiceService.updateStatus(this.selectedInvoice.maHoaDon, this.selectedStatus)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => {
                    this.showNotification('success', 'Cập nhật trạng thái thành công');
                    this.closeStatusModal();
                    this.loadInvoices();
                    this.loadStatistics();
                },
                error: (err) => {
                    console.error('Failed to update status:', err);
                    this.showNotification('error', 'Không thể cập nhật trạng thái');
                }
            });
    }

    // Helper methods
    formatCurrency(value: number): string {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0);
    }

    formatDate(date: Date | string): string {
        return new Date(date).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    getStatusClass(status: string): string {
        switch (status) {
            case 'Đã hoàn thành': return 'status-completed';
            case 'Đã thanh toán': return 'status-paid';
            case 'Đang giao': return 'status-shipping';
            case 'Đã đặt hàng': return 'status-pending';
            case 'Đã hủy': return 'status-cancelled';
            default: return 'status-unknown';
        }
    }

    getPageNumbers(): number[] {
        const pages: number[] = [];
        const { page, totalPages } = this.pagination;

        let start = Math.max(1, page - 2);
        let end = Math.min(totalPages, page + 2);

        if (end - start < 4) {
            if (start === 1) end = Math.min(5, totalPages);
            else start = Math.max(1, totalPages - 4);
        }

        for (let i = start; i <= end; i++) {
            pages.push(i);
        }
        return pages;
    }

    showNotification(type: 'success' | 'error' | 'info', message: string): void {
        this.notification = { type, message };
        setTimeout(() => this.notification = null, 4000);
    }
}
