import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CustomerPortalService, Pet } from '../../../services/customer-portal.service';

@Component({
    selector: 'app-customer-pets',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule],
    templateUrl: './customer-pets.component.html',
    styleUrls: ['./customer-pets.component.css'],
})
export class CustomerPetsComponent implements OnInit {
    pets: Pet[] = [];
    isLoading = false;
    showAddModal = false;
    petTypes: any[] = []; // Array of pet types/breeds
    newPet = {
        tenThuCung: '',
        maChungLoai: '',
        gioiTinh: 'Đực',
        canNang: 0,
        mauSac: '',
        ngaySinh: ''
    };

    constructor(private customerService: CustomerPortalService) { }

    ngOnInit(): void {
        this.loadPets();
        // TODO: Load pet types from service
        // this.loadPetTypes();
    }

    loadPets(): void {
        this.isLoading = true;
        this.customerService.getPets().subscribe({
            next: (data) => {
                this.pets = data;
                this.isLoading = false;
            },
            error: (err) => {
                console.error('Error loading pets:', err);
                this.isLoading = false;
            },
        });
    }

    closeAddModal(): void {
        this.showAddModal = false;
        // Reset form
        this.newPet = {
            tenThuCung: '',
            maChungLoai: '',
            gioiTinh: 'Đực',
            canNang: 0,
            mauSac: '',
            ngaySinh: ''
        };
    }

    onSubmit(): void {
        // TODO: Implement pet creation logic
        console.log('Creating pet:', this.newPet);
        // After successful creation, reload pets and close modal
        // this.customerService.createPet(this.newPet).subscribe({
        //     next: () => {
        //         this.loadPets();
        //         this.closeAddModal();
        //     },
        //     error: (err) => console.error('Error creating pet:', err)
        // });
        this.closeAddModal();
    }

    getAge(dateString?: Date): string {
        if (!dateString) return 'Không rõ';
        const birthDate = new Date(dateString);
        const diff = Date.now() - birthDate.getTime();
        const ageDate = new Date(diff);
        return Math.abs(ageDate.getUTCFullYear() - 1970) + ' tuổi';
    }
}
