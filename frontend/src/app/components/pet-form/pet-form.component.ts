import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CustomerService } from '../../services/customer.service';
import { ThuCung, ChungLoaiThuCung, LoaiThuCung } from '../../models/pet.model';
import { KhachHang } from '../../models/customer.model';

@Component({
  selector: 'app-pet-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './pet-form.component.html',
  styleUrls: ['./pet-form.component.css']
})
export class PetFormComponent implements OnInit, OnDestroy {
  petForm: FormGroup;
  isEditMode = false;
  customerId!: number;
  petId?: number;
  customerName?: string;
  
  // Pet type and breed data
  petTypes: LoaiThuCung[] = [];
  breeds: ChungLoaiThuCung[] = [];
  filteredBreeds: ChungLoaiThuCung[] = [];
  
  customers: KhachHang[] = [];
  loading = false;
  error = '';
  success = '';
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private customerService: CustomerService,
    public router: Router,
    private route: ActivatedRoute
  ) {
    this.petForm = this.fb.group({
      MaKhachHang: ['', [Validators.required]],
      TenThuCung: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      MaLoaiThuCung: ['', [Validators.required]],
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

    // If customerId is set from route, pre-fill it
    if (this.customerId) {
      this.petForm.patchValue({ MaKhachHang: this.customerId });
      this.loadCustomerInfo();
    }

    this.loadCustomers();
    this.loadPetTypes();
    this.loadBreeds();
    
    // Listen to pet type changes to filter breeds
    this.petForm.get('MaLoaiThuCung')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((maLoaiThuCung) => {
        this.onPetTypeChange(maLoaiThuCung);
      });
    
    if (this.isEditMode && this.petId) {
      this.loadPet();
    }
  }

  loadCustomerInfo(): void {
    this.customerService.getCustomerById(this.customerId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          const customer = response.data || response;
          this.customerName = customer.HoTen;
        },
        error: (err) => {
          console.error('Error loading customer info:', err);
        }
      });
  }

  loadCustomers(): void {
    this.customerService.getCustomers(1, 1000)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.customers = response.data || [];
        },
        error: (err) => {
          this.error = 'Không thể tải danh sách khách hàng.';
          console.error('Error loading customers:', err);
        }
      });
  }

  loadPetTypes(): void {
    this.customerService.getPetTypes()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.petTypes = response.data || [];
        },
        error: (err) => {
          this.error = 'Không thể tải danh sách loại thú cưng.';
          console.error('Error loading pet types:', err);
        }
      });
  }

  loadBreeds(): void {
    this.customerService.getBreeds()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.breeds = response.data || [];
        },
        error: (err) => {
          this.error = 'Không thể tải danh sách chủng loại.';
          console.error('Error loading breeds:', err);
        }
      });
  }

  onPetTypeChange(maLoaiThuCung: string): void {
    if (maLoaiThuCung) {
      // Filter breeds based on selected pet type
      this.filteredBreeds = this.breeds.filter(
        breed => breed.MaLoaiThuCung === maLoaiThuCung
      );
    } else {
      // Show all breeds when no pet type is selected
      this.filteredBreeds = this.breeds;
    }
  }

  loadPet(): void {
    if (!this.petId) return;
    
    this.loading = true;
    this.customerService.getPetById(this.customerId, this.petId)
      .subscribe({
        next: (pet: ThuCung) => {
          this.petForm.patchValue({
            TenThuCung: pet.TenThuCung,
            MaLoaiThuCung: pet.ChungLoai?.MaLoaiThuCung || '',
            MaChungLoai: pet.MaChungLoai,
            NgaySinhThuCung: pet.NgaySinhThuCung ? this.formatDate(new Date(pet.NgaySinhThuCung)) : ''
          });
          // Trigger breed filtering
          if (pet.ChungLoai?.MaLoaiThuCung) {
            this.onPetTypeChange(pet.ChungLoai.MaLoaiThuCung);
          }
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
      TenThuCung: this.petForm.get('TenThuCung')?.value,
      MaChungLoai: this.petForm.get('MaChungLoai')?.value,
      NgaySinhThuCung: this.petForm.get('NgaySinhThuCung')?.value || undefined
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

  getPetTypeEmoji(petTypeName: string): string {
    const emojiMap: { [key: string]: string } = {
      'Chó': '🐕',
      'Mèo': '🐱',
      'Gà': '🐔',
      'Vịt': '🦆',
    };
    return emojiMap[petTypeName] || '🐾';
  }

  focusDateInput(fieldId: string): void {
    const element = document.getElementById(fieldId) as HTMLInputElement;
    if (element) {
      element.focus();
      // Use showPicker() for modern browsers
      if (element.showPicker && typeof element.showPicker === 'function') {
        element.showPicker();
      } else {
        // Fallback for older browsers
        element.click();
      }
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
