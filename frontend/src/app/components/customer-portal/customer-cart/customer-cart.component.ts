import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { CustomerPortalService, CartItem } from '../../../services/customer-portal.service';
import { NotificationService } from '../../../services/notification.service';

@Component({
    selector: 'app-customer-cart',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './customer-cart.component.html',
    styleUrls: ['./customer-cart.component.css'],
})
export class CustomerCartComponent implements OnInit {
    cartItems: CartItem[] = [];
    isPlacingOrder = false;
    orderSuccess = false;
    orderId = 0;

    constructor(
        private customerService: CustomerPortalService,
        private router: Router,
        private notificationService: NotificationService,
    ) { }

    ngOnInit(): void {
        this.loadCart();
    }

    loadCart(): void {
        this.cartItems = this.customerService.getCart();
    }

    updateQuantity(item: CartItem, change: number): void {
        const newQty = item.quantity + change;
        if (newQty > 0) {
            this.customerService.updateCartQuantity(item.product.maSanPham, newQty);
        } else {
            this.customerService.removeFromCart(item.product.maSanPham);
        }
        this.loadCart();
    }

    removeItem(item: CartItem): void {
        this.customerService.removeFromCart(item.product.maSanPham);
        this.loadCart();
    }

    getTotal(): number {
        return this.customerService.getCartTotal();
    }

    formatPrice(price: number): string {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    }

    placeOrder(): void {
        if (this.cartItems.length === 0) return;

        this.isPlacingOrder = true;
        this.customerService.placeOrder().subscribe({
            next: (result) => {
                this.orderId = result.maHoaDon;
                this.orderSuccess = true;
                this.customerService.clearCart();
                this.cartItems = [];
                this.isPlacingOrder = false;
            },
            error: (err) => {
                console.error('Error placing order:', err);
                this.notificationService.error('Không thể đặt hàng. Vui lòng thử lại.');
                this.isPlacingOrder = false;
            },
        });
    }
}
