import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
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

    // Cart notification
    showAddedNotification = false;
    addedProductName = '';

    constructor(private customerService: CustomerPortalService) { }

    ngOnInit(): void {
        this.loadProducts();
        this.loadCategories();
    }

    loadProducts(): void {
        this.isLoading = true;
        const filters: any = {};
        if (this.selectedCategory) filters.loai = this.selectedCategory;
        if (this.searchQuery) filters.search = this.searchQuery;

        this.customerService.getProducts(filters).subscribe({
            next: (data) => {
                this.products = data;
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
        this.loadProducts();
    }

    onCategoryChange(): void {
        this.loadProducts();
    }

    addToCart(product: Product): void {
        this.customerService.addToCart(product, 1);
        this.addedProductName = product.tenSanPham;
        this.showAddedNotification = true;
        setTimeout(() => {
            this.showAddedNotification = false;
        }, 2000);
    }

    formatPrice(price: number): string {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    }

    getCartCount(): number {
        return this.customerService.getCartCount();
    }
}
