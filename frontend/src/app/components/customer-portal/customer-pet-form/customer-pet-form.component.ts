import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { CustomerPortalService } from '../../../services/customer-portal.service';

@Component({
    selector: 'app-customer-pet-form',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterModule],
    templateUrl: './customer-pet-form.component.html',
    styleUrls: ['./customer-pet-form.component.css']
})
export class CustomerPetFormComponent implements OnInit {
    petForm: FormGroup;
    isEditMode = false;
    petId?: number;

    petCategories: any[] = [];
    breeds: any[] = [];
    filteredBreeds: any[] = [];

    loading = false;
    error = '';
    success = '';

    constructor(
        private fb: FormBuilder,
        private customerService: CustomerPortalService,
        public router: Router,
        private route: ActivatedRoute
    ) {
        this.petForm = this.fb.group({
            TenThuCung: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
            MaLoaiThuCung: ['', [Validators.required]],
            MaChungLoai: ['', [Validators.required]],
            GioiTinh: ['Đực', [Validators.required]],
            CanNang: [null],
            MauSac: [''],
            NgaySinhThuCung: ['']
        });
    }

    ngOnInit(): void {
        const petIdParam = this.route.snapshot.paramMap.get('id');

        if (petIdParam && petIdParam !== 'new') {
            this.petId = Number(petIdParam);
            this.isEditMode = true;
        }

        this.loadPetCategories();
        this.loadBreeds();

        // Listen to pet type changes to filter breeds
        this.petForm.get('MaLoaiThuCung')?.valueChanges.subscribe((maLoaiThuCung) => {
            this.onPetTypeChange(maLoaiThuCung);
        });

        if (this.isEditMode && this.petId) {
            this.loadPet();
        }
    }

    loadPetCategories(): void {
        this.customerService.getPetCategories().subscribe({
            next: (response: any) => {
                this.petCategories = response || [];
            },
            error: (err) => {
                console.error('Error loading pet categories:', err);
            }
        });
    }

    loadBreeds(): void {
        this.customerService.getPetBreeds().subscribe({
            next: (response: any) => {
                this.breeds = response || [];
            },
            error: (err) => {
                console.error('Error loading breeds:', err);
            }
        });
    }

    onPetTypeChange(maLoaiThuCung: string): void {
        this.petForm.patchValue({ MaChungLoai: '' }); // Reset breed selection
        if (maLoaiThuCung) {
            this.filteredBreeds = this.breeds.filter(
                breed => breed.MaLoaiThuCung === maLoaiThuCung
            );
        } else {
            this.filteredBreeds = [];
        }
    }

    loadPet(): void {
        // Currently, getPetById isn't fully implemented in service for single pet retrieval by ID for update
        // Assuming we have it or can add it. For now, creating stub.
        // Ideally we need getPetById in CustomerPortalService
    }

    onSubmit(): void {
        if (this.petForm.invalid) {
            this.markFormGroupTouched(this.petForm);
            return;
        }

        this.loading = true;
        this.error = '';
        this.success = '';

        const formData = {
            tenThuCung: this.petForm.get('TenThuCung')?.value,
            maChungLoai: this.petForm.get('MaChungLoai')?.value,
            gioiTinh: this.petForm.get('GioiTinh')?.value,
            canNang: this.petForm.get('CanNang')?.value,
            mauSac: this.petForm.get('MauSac')?.value,
            ngaySinh: this.petForm.get('NgaySinhThuCung')?.value
        };

        if (this.isEditMode) {
            // Update logic here (omitted for now as primary task is Create)
            this.loading = false;
        } else {
            this.customerService.createPet(formData).subscribe({
                next: () => {
                    this.success = 'Thêm thú cưng thành công!';
                    this.loading = false;
                    setTimeout(() => {
                        this.router.navigate(['/customer/pets']);
                    }, 1500);
                },
                error: (err) => {
                    this.error = 'Có lỗi xảy ra. Vui lòng thử lại.';
                    this.loading = false;
                    console.error('Error saving pet:', err);
                }
            });
        }
    }

    getErrorMessage(fieldName: string): string {
        const control = this.petForm.get(fieldName);
        if (!control || !control.touched || !control.errors) return '';

        if (control.errors['required']) return 'Trường này là bắt buộc.';
        return '';
    }

    isFieldInvalid(fieldName: string): boolean {
        const control = this.petForm.get(fieldName);
        return !!(control && control.invalid && control.touched);
    }

    onCancel(): void {
        this.router.navigate(['/customer/pets']);
    }

    private markFormGroupTouched(formGroup: FormGroup): void {
        Object.keys(formGroup.controls).forEach(key => {
            const control = formGroup.get(key);
            control?.markAsTouched();
        });
    }
}
