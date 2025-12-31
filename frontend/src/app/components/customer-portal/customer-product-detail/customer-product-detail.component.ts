import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import {
    CustomerPortalService,
    ProductDetail,
    ProductReviews,
    Product,
} from '../../../services/customer-portal.service';

@Component({
    selector: 'app-customer-product-detail',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule],
    templateUrl: './customer-product-detail.component.html',
    styleUrls: ['./customer-product-detail.component.css'],
})
export class CustomerProductDetailComponent implements OnInit {
    product: ProductDetail | null = null;
    reviews: ProductReviews | null = null;
    relatedProducts: Product[] = [];
    isLoading = true;
    isLoadingReviews = true;

    // Tabs
    activeTab: 'description' | 'specs' | 'reviews' = 'description';

    // Image zoom
    isZoomed = false;
    zoomPosition = { x: 50, y: 50 };

    // Quantity
    quantity = 1;

    // Wishlist
    isWishlisted = false;

    // Reviews
    canReview = false;
    cannotReviewReason = '';
    showReviewForm = false;
    reviewRating = 5;
    reviewComment = '';
    isSubmittingReview = false;
    reviewSortBy: 'newest' | 'highest' | 'lowest' = 'newest';

    // Notifications
    showNotification = false;
    notificationMessage = '';
    notificationType: 'success' | 'error' | 'info' = 'success';

    // Share menu
    showShareMenu = false;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private customerService: CustomerPortalService
    ) { }

    ngOnInit(): void {
        const productId = this.route.snapshot.paramMap.get('id');
        if (productId) {
            this.loadProduct(productId);
            this.loadReviews(productId);
            this.checkCanReview(productId);
        }
    }

    loadProduct(id: string): void {
        this.isLoading = true;
        this.customerService.getProductById(id).subscribe({
            next: (product) => {
                this.product = product;
                this.isLoading = false;
                this.loadRelatedProducts(product.loaiSanPham);
            },
            error: (err) => {
                console.error('Error loading product:', err);
                this.isLoading = false;
            },
        });
    }

    loadReviews(id: string): void {
        this.isLoadingReviews = true;
        this.customerService.getProductReviews(id).subscribe({
            next: (reviews) => {
                this.reviews = reviews;
                this.isLoadingReviews = false;
            },
            error: (err) => {
                console.error('Error loading reviews:', err);
                this.isLoadingReviews = false;
            },
        });
    }

    loadRelatedProducts(category: string): void {
        this.customerService
            .getProducts({ loai: category, limit: 6 })
            .subscribe({
                next: (response) => {
                    this.relatedProducts = response.products
                        .filter((p) => p.maSanPham !== this.product?.maSanPham)
                        .slice(0, 5);
                },
                error: (err) => {
                    console.error('Error loading related products:', err);
                },
            });
    }

    checkCanReview(id: string): void {
        this.customerService.canReviewProduct(id).subscribe({
            next: (result) => {
                this.canReview = result.canReview;
                this.cannotReviewReason = result.reason || '';
            },
            error: (err) => {
                console.error('Error checking review status:', err);
            },
        });
    }

    // Tab navigation
    setActiveTab(tab: 'description' | 'specs' | 'reviews'): void {
        this.activeTab = tab;
    }

    // Image zoom
    onImageHover(event: MouseEvent): void {
        const target = event.currentTarget as HTMLElement;
        const rect = target.getBoundingClientRect();
        this.zoomPosition.x = ((event.clientX - rect.left) / rect.width) * 100;
        this.zoomPosition.y = ((event.clientY - rect.top) / rect.height) * 100;
    }

    onImageEnter(): void {
        this.isZoomed = true;
    }

    onImageLeave(): void {
        this.isZoomed = false;
    }

    // Handle broken images
    onImageError(event: Event): void {
        const img = event.target as HTMLImageElement;
        img.style.display = 'none';
        // Show placeholder instead
        const parent = img.parentElement;
        if (parent && !parent.querySelector('.image-placeholder')) {
            const placeholder = document.createElement('div');
            placeholder.className = 'image-placeholder';
            placeholder.innerHTML = '<i class="fa-solid fa-box"></i>';
            parent.appendChild(placeholder);
        }
    }

    // Quantity controls
    decreaseQuantity(): void {
        if (this.quantity > 1) {
            this.quantity--;
        }
    }

    increaseQuantity(): void {
        if (this.product && this.quantity < this.product.tonKho) {
            this.quantity++;
        }
    }

    // Wishlist
    toggleWishlist(): void {
        this.isWishlisted = !this.isWishlisted;
        this.showNotificationMessage(
            this.isWishlisted ? 'Đã thêm vào danh sách yêu thích' : 'Đã xóa khỏi danh sách yêu thích',
            'info'
        );
    }

    // Share
    toggleShareMenu(): void {
        this.showShareMenu = !this.showShareMenu;
    }

    shareOnFacebook(): void {
        const url = encodeURIComponent(window.location.href);
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
        this.showShareMenu = false;
    }

    copyLink(): void {
        navigator.clipboard.writeText(window.location.href);
        this.showNotificationMessage('Đã sao chép liên kết', 'success');
        this.showShareMenu = false;
    }

    // Add to cart
    addToCart(): void {
        if (this.product) {
            this.customerService.addToCart(this.product, this.quantity);
            this.showNotificationMessage(
                `Đã thêm ${this.quantity} "${this.product.tenSanPham}" vào giỏ hàng!`,
                'success'
            );
        }
    }

    // Review sorting
    sortReviews(by: 'newest' | 'highest' | 'lowest'): void {
        this.reviewSortBy = by;
    }

    getSortedReviews() {
        if (!this.reviews) return [];
        const reviews = [...this.reviews.reviews];

        switch (this.reviewSortBy) {
            case 'newest':
                return reviews.sort((a, b) =>
                    new Date(b.ngayDanhGia).getTime() - new Date(a.ngayDanhGia).getTime()
                );
            case 'highest':
                return reviews.sort((a, b) => b.soSao - a.soSao);
            case 'lowest':
                return reviews.sort((a, b) => a.soSao - b.soSao);
            default:
                return reviews;
        }
    }

    // Review submission
    toggleReviewForm(): void {
        this.showReviewForm = !this.showReviewForm;
    }

    setReviewRating(rating: number): void {
        this.reviewRating = rating;
    }

    submitReview(): void {
        if (!this.product) return;

        this.isSubmittingReview = true;
        this.customerService
            .submitReview(this.product.maSanPham, {
                soSao: this.reviewRating,
                nhanXet: this.reviewComment,
            })
            .subscribe({
                next: (result) => {
                    this.showNotificationMessage(result.message, 'success');
                    this.showReviewForm = false;
                    this.reviewComment = '';
                    this.canReview = false;
                    this.cannotReviewReason = 'Bạn đã đánh giá sản phẩm này';
                    this.isSubmittingReview = false;
                    this.loadReviews(this.product!.maSanPham);
                },
                error: (err) => {
                    this.showNotificationMessage(
                        err.error?.message || 'Lỗi khi gửi đánh giá',
                        'error'
                    );
                    this.isSubmittingReview = false;
                },
            });
    }

    // Navigation
    goBack(): void {
        this.router.navigate(['/customer/products']);
    }

    viewProduct(product: Product): void {
        this.router.navigate(['/customer/products', product.maSanPham]);
        // Reload component
        setTimeout(() => window.location.reload(), 100);
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

    formatDate(date: Date): string {
        return new Date(date).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    }

    getStars(rating: number): number[] {
        return Array(5).fill(0).map((_, i) => (i < Math.round(rating) ? 1 : 0));
    }

    getRatingPercentage(count: number): number {
        if (!this.reviews || this.reviews.totalReviews === 0) return 0;
        return (count / this.reviews.totalReviews) * 100;
    }

    getAvatarColor(name: string): string {
        const colors = [
            '#ee4d2d', '#ff6b4a', '#4caf50', '#2196f3', '#9c27b0',
            '#ff9800', '#e91e63', '#00bcd4', '#673ab7', '#3f51b5'
        ];
        const index = name.charCodeAt(0) % colors.length;
        return colors[index];
    }

    getAvatarInitial(name: string): string {
        return name.charAt(0).toUpperCase();
    }

    getCartCount(): number {
        return this.customerService.getCartCount();
    }

    showNotificationMessage(message: string, type: 'success' | 'error' | 'info'): void {
        this.notificationMessage = message;
        this.notificationType = type;
        this.showNotification = true;
        setTimeout(() => {
            this.showNotification = false;
        }, 3000);
    }
}
