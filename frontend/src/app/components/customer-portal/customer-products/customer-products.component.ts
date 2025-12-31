import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CustomerPortalService, Product } from '../../../services/customer-portal.service';

@Component({
    selector: 'app-customer-products',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule],
    templateUrl: './customer-products.component.html',
    styleUrls: ['./customer-products.component.css'],
})
export class CustomerProductsComponent implements OnInit {
    products: Product[] = [];
    categories: string[] = [];
    isLoading = false;

    // Filters
    searchQuery = '';
    selectedCategory = '';
    sortBy: 'price_asc' | 'price_desc' | 'newest' | 'name' = 'name';

    // Pagination
    currentPage = 1;
    pageSize = 20;
    totalProducts = 0;
    totalPages = 0;

    // Cart notification
    showAddedNotification = false;
    addedProductName = '';

    constructor(
        private customerService: CustomerPortalService,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.loadProducts();
        this.loadCategories();
    }

    loadProducts(): void {
        this.isLoading = true;

        this.customerService
            .getProducts({
                loai: this.selectedCategory || undefined,
                search: this.searchQuery || undefined,
                page: this.currentPage,
                limit: this.pageSize,
                sortBy: this.sortBy,
            })
            .subscribe({
                next: (response) => {
                    this.products = response.products;
                    this.totalProducts = response.pagination.total;
                    this.totalPages = response.pagination.totalPages;
                    this.isLoading = false;
                },
                error: (err) => {
                    console.error('Error loading products:', err);
                    this.isLoading = false;
                },
            });
    }

    loadCategories(): void {
        this.customerService.getProductCategories().subscribe({
            next: (cats) => {
                this.categories = cats;
            },
            error: (err) => {
                console.error('Error loading categories:', err);
            },
        });
    }

    onSearch(): void {
        this.currentPage = 1;
        this.loadProducts();
    }

    selectCategory(category: string): void {
        this.selectedCategory = category;
        this.currentPage = 1;
        this.loadProducts();
    }

    setSortBy(sort: 'price_asc' | 'price_desc' | 'newest' | 'name'): void {
        this.sortBy = sort;
        this.currentPage = 1;
        this.loadProducts();
    }

    resetFilters(): void {
        this.searchQuery = '';
        this.selectedCategory = '';
        this.sortBy = 'name';
        this.currentPage = 1;
        this.loadProducts();
    }

    // Pagination
    goToPage(page: number): void {
        if (page >= 1 && page <= this.totalPages) {
            this.currentPage = page;
            this.loadProducts();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    getPageNumbers(): number[] {
        const pages: number[] = [];
        const maxVisible = 5;
        let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
        let end = Math.min(this.totalPages, start + maxVisible - 1);

        if (end - start + 1 < maxVisible) {
            start = Math.max(1, end - maxVisible + 1);
        }

        for (let i = start; i <= end; i++) {
            pages.push(i);
        }
        return pages;
    }

    // Product Actions
    viewProduct(product: Product): void {
        this.router.navigate(['/customer/products', product.maSanPham]);
    }

    addToCart(product: Product, event?: Event): void {
        if (event) {
            event.stopPropagation();
        }
        this.customerService.addToCart(product, 1);
        this.addedProductName = product.tenSanPham;
        this.showAddedNotification = true;
        setTimeout(() => {
            this.showAddedNotification = false;
        }, 2500);
    }

    goToCart(): void {
        this.router.navigate(['/customer/cart']);
    }

    // Helpers
    formatPrice(price: number): string {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(price);
    }

    getCartCount(): number {
        return this.customerService.getCartCount();
    }

    getCartTotal(): number {
        return this.customerService.getCartTotal();
    }

    // Handle broken images
    onImageError(event: Event): void {
        const img = event.target as HTMLImageElement;
        img.style.display = 'none';
        const parent = img.parentElement;
        if (parent && !parent.querySelector('.image-placeholder')) {
            const placeholder = document.createElement('div');
            placeholder.className = 'image-placeholder';
            placeholder.innerHTML = '<i class="fa-solid fa-box"></i>';
            parent.appendChild(placeholder);
        }
    }
}
