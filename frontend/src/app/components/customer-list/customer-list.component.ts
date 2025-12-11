import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CustomerService } from '../../services/customer.service';
import { KhachHang, PaginatedResponse } from '../../models/customer.model';

@Component({
  selector: 'app-customer-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './customer-list.component.html',
  styleUrls: ['./customer-list.component.css']
})
export class CustomerListComponent implements OnInit {
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

  constructor(
    private customerService: CustomerService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCustomers();
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

  onSearch(): void {
    this.currentPage = 1;
    this.loadCustomers();
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
}
