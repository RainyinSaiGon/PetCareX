import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CustomerService } from '../../services/customer.service';
import { ThuCung, ChungLoaiThuCung } from '../../models/pet.model';

@Component({
  selector: 'app-pet-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './pet-form.component.html',
  styleUrls: ['./pet-form.component.css']
})
export class PetFormComponent implements OnInit {
  petForm: FormGroup;
  isEditMode = false;
  customerId!: number;
  petId?: number;
  customerName?: string;
  species: ChungLoaiThuCung[] = [];
  loading = false;
  error = '';
  success = '';

  constructor(
    private fb: FormBuilder,
    private customerService: CustomerService,
    public router: Router,
    private route: ActivatedRoute
  ) {
    this.petForm = this.fb.group({
      TenThuCung: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      MaChungLoai: ['', [Validators.required]],
      NgaySinhThuCung: ['']
    });
  }

  ngOnInit(): void {
    this.customerId = Number(this.route.snapshot.paramMap.get('id'));
    const petIdParam = this.route.snapshot.paramMap.get('petId');
    
    if (petIdParam && petIdParam !== 'new') {
      this.petId = Number(petIdParam);
      this.isEditMode = true;
    }

    this.loadCustomerInfo();
    this.loadSpecies();
    
    if (this.isEditMode && this.petId) {
      this.loadPet();
    }
  }

  loadCustomerInfo(): void {
    this.customerService.getCustomerById(this.customerId)
      .subscribe({
        next: (customer) => {
          this.customerName = customer.HoTen;
        },
        error: (err) => {
          console.error('Error loading customer info:', err);
        }
      });
  }

  loadSpecies(): void {
    this.customerService.getSpecies()
      .subscribe({
        next: (species) => {
          this.species = species;
        },
        error: (err) => {
          this.error = 'Không thể tải danh sách chủng loại.';
          console.error('Error loading species:', err);
        }
      });
  }

  loadPet(): void {
    if (!this.petId) return;
    
    this.loading = true;
    this.customerService.getPetById(this.customerId, this.petId)
      .subscribe({
        next: (pet: ThuCung) => {
          this.petForm.patchValue({
            TenThuCung: pet.TenThuCung,
            MaChungLoai: pet.MaChungLoai,
            NgaySinhThuCung: pet.NgaySinhThuCung ? this.formatDate(new Date(pet.NgaySinhThuCung)) : ''
          });
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Không thể tải thông tin thú cưng.';
          this.loading = false;
          console.error('Error loading pet:', err);
        }
      });
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
      ...this.petForm.value,
      MaKhachHang: this.customerId
    };

    const request = this.isEditMode && this.petId
      ? this.customerService.updatePet(this.customerId, this.petId, formData)
      : this.customerService.createPet(this.customerId, formData);

    request.subscribe({
      next: () => {
        this.success = this.isEditMode ? 'Cập nhật thú cưng thành công!' : 'Thêm thú cưng thành công!';
        this.loading = false;
        setTimeout(() => {
          this.router.navigate(['/customers', this.customerId, 'pets']);
        }, 1500);
      },
      error: (err) => {
        this.error = err.error?.message || 'Có lỗi xảy ra. Vui lòng thử lại.';
        this.loading = false;
        console.error('Error saving pet:', err);
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/customers', this.customerId, 'pets']);
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  getErrorMessage(fieldName: string): string {
    const control = this.petForm.get(fieldName);
    if (!control || !control.touched || !control.errors) {
      return '';
    }

    if (control.errors['required']) {
      return 'Trường này là bắt buộc.';
    }
    if (control.errors['minlength']) {
      return `Tối thiểu ${control.errors['minlength'].requiredLength} ký tự.`;
    }
    if (control.errors['maxlength']) {
      return `Tối đa ${control.errors['maxlength'].requiredLength} ký tự.`;
    }
    if (control.errors['min']) {
      return `Giá trị tối thiểu là ${control.errors['min'].min}.`;
    }
    if (control.errors['max']) {
      return `Giá trị tối đa là ${control.errors['max'].max}.`;
    }

    return '';
  }

  isFieldInvalid(fieldName: string): boolean {
    const control = this.petForm.get(fieldName);
    return !!(control && control.invalid && control.touched);
  }
}
