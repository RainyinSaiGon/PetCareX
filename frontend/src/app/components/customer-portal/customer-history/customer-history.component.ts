import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomerPortalService, Order, Pet, PetHistory } from '../../../services/customer-portal.service';

@Component({
    selector: 'app-customer-history',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './customer-history.component.html',
    styleUrls: ['./customer-history.component.css'],
})
export class CustomerHistoryComponent implements OnInit {
    activeTab: 'orders' | 'pets' = 'orders';
    orders: Order[] = [];
    pets: Pet[] = [];
    selectedPet: Pet | null = null;
    petHistory: PetHistory | null = null;
    isLoading = false;

    constructor(private customerService: CustomerPortalService) { }

    ngOnInit(): void {
        this.loadOrders();
        this.loadPets();
    }

    loadOrders(): void {
        this.isLoading = true;
        this.customerService.getOrders().subscribe({
            next: (data) => {
                this.orders = data;
                this.isLoading = false;
            },
            error: (err) => {
                console.error('Error loading orders:', err);
                this.isLoading = false;
            },
        });
    }

    loadPets(): void {
        this.customerService.getPets().subscribe({
            next: (pets) => {
                this.pets = pets;
            },
            error: (err) => console.error('Error loading pets:', err),
        });
    }

    viewPetHistory(pet: Pet): void {
        this.selectedPet = pet;
        this.customerService.getPetHistory(pet.maThuCung).subscribe({
            next: (history) => {
                this.petHistory = history;
            },
            error: (err) => {
                console.error('Error loading pet history:', err);
                this.petHistory = null;
            },
        });
    }

    closePetHistory(): void {
        this.selectedPet = null;
        this.petHistory = null;
    }

    formatDate(date: Date | string): string {
        return new Date(date).toLocaleDateString('vi-VN');
    }

    formatPrice(price: number): string {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    }
}
