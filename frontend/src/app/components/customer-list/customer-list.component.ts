import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { CustomerService } from '../../services/customer.service';
import { KhachHang, PaginatedResponse } from '../../models/customer.model';

@Component({
  selector: 'app-customer-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './customer-list.component.html',
  styleUrls: ['./customer-list.component.css']
})
export class CustomerListComponent implements OnInit, OnDestroy {
  customers: KhachHang[] = [];
  loading = false;
  error = '';

  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalItems = 0;
  totalPages = 0;

  // Search
  searchKeyword = '';
  private searchSubject = new Subject<string>();
  private searchSubscription?: Subscription;

  // Math object for template
  Math = Math;

  // Invoice Modal
  showInvoiceModal = false;
  invoicesLoading = false;
  customerInvoices: any[] = [];
  selectedCustomerName = '';

  constructor(
    private customerService: CustomerService,
    private router: Router,
    private http: HttpClient
  ) { }

  ngOnInit(): void {
    this.setupDebouncedSearch();
    this.loadCustomers();
  }

  ngOnDestroy(): void {
    this.searchSubscription?.unsubscribe();
  }

  private setupDebouncedSearch(): void {
    this.searchSubscription = this.searchSubject
      .pipe(
        debounceTime(500),
        distinctUntilChanged()
      )
      .subscribe(() => {
        this.onSearch();
      });
  }

  loadCustomers(): void {
    this.loading = true;
    this.error = '';

    this.customerService.getCustomers(this.currentPage, this.pageSize, this.searchKeyword)
      .subscribe({
        next: (response: PaginatedResponse<KhachHang>) => {
          this.customers = response.data;
          this.totalItems = response.total;
          this.totalPages = response.totalPages;
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Không thể tải danh sách khách hàng. Vui lòng thử lại.';
          this.loading = false;
          console.error('Error loading customers:', err);
        }
      });
  }

  onSearchInput(): void {
    this.searchSubject.next(this.searchKeyword);
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadCustomers();
  }

  clearSearch(): void {
    this.searchKeyword = '';
    this.onSearch();
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadCustomers();
    }
  }

  viewCustomer(id: number): void {
    this.router.navigate(['/customers', id]);
  }

  editCustomer(id: number): void {
    this.router.navigate(['/customers', id, 'edit']);
  }

  viewPets(customerId: number): void {
    this.router.navigate(['/customers', customerId, 'pets']);
  }

  // Invoice methods
  viewInvoices(customer: KhachHang): void {
    this.selectedCustomerName = customer.HoTen;
    this.showInvoiceModal = true;
    this.invoicesLoading = true;
    this.customerInvoices = [];

    this.http.get<any>(`http://localhost:3000/admin/invoices?maKhachHang=${customer.MaKhachHang}&limit=50`)
      .subscribe({
        next: (response) => {
          this.customerInvoices = response.invoices || [];
          this.invoicesLoading = false;
        },
        error: (err) => {
          console.error('Error loading invoices:', err);
          this.invoicesLoading = false;
        }
      });
  }

  closeInvoiceModal(): void {
    this.showInvoiceModal = false;
    this.customerInvoices = [];
    this.selectedCustomerName = '';
  }

  formatDate(date: string | Date): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('vi-VN');
  }

  formatCurrency(amount: number): string {
    if (!amount && amount !== 0) return 'N/A';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  }

  getInvoiceStatusClass(status: string): string {
    if (!status) return 'status-unknown';
    const statusLower = status.toLowerCase();
    if (statusLower.includes('hoàn thành') || statusLower.includes('thanh toán')) return 'status-completed';
    if (statusLower.includes('đặt hàng')) return 'status-pending';
    if (statusLower.includes('giao') || statusLower.includes('vận chuyển')) return 'status-shipping';
    if (statusLower.includes('hủy')) return 'status-cancelled';
    return 'status-unknown';
  }

  deleteCustomer(customer: KhachHang): void {
    if (confirm(`Bạn có chắc chắn muốn xóa khách hàng "${customer.HoTen}"?`)) {
      this.customerService.deleteCustomer(customer.MaKhachHang)
        .subscribe({
          next: () => {
            this.loadCustomers();
          },
          error: (err) => {
            this.error = err.error?.message || 'Không thể xóa khách hàng. Vui lòng thử lại.';
            console.error('Error deleting customer:', err);
          }
        });
    }
  }

  createCustomer(): void {
    this.router.navigate(['/customers/new']);
  }

  getPaginationPages(): number[] {
    const pages: number[] = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(this.totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage < maxPagesToShow - 1) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  }

  getTierIcon(tier?: string): string {
    if (!tier) return 'fa-user';

    const tierLower = tier.toLowerCase();
    switch (tierLower) {
      case 'cơ bản':
        return 'fa-user';
      case 'thân thiết':
        return 'fa-heart';
      case 'vip':
        return 'fa-crown';
      default:
        return 'fa-user';
    }
  }

  getTierClass(tier?: string): string {
    if (!tier) return 'tier-co-ban';

    const tierLower = tier.toLowerCase();
    switch (tierLower) {
      case 'cơ bản':
        return 'tier-co-ban';
      case 'thân thiết':
        return 'tier-than-thiet';
      case 'vip':
        return 'tier-vip';
      default:
        return 'tier-co-ban';
    }
  }
}

