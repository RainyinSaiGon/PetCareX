import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CustomerService } from '../../services/customer.service';
import { KhachHang } from '../../models/customer.model';

@Component({
  selector: 'app-customer-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './customer-form.component.html',
  styleUrls: ['./customer-form.component.css']
})
export class CustomerFormComponent implements OnInit, OnDestroy {
  customerForm: FormGroup;
  isEditMode = false;
  isViewMode = false;
  customerId?: number;
  loading = false;
  error = '';
  success = '';
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private customerService: CustomerService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.customerForm = this.fb.group({
      HoTen: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      SoDienThoai: ['', [Validators.required, Validators.pattern(/^0[0-9]{9}$/)]],
      Email: ['', [Validators.email, Validators.maxLength(100)]],
      DiaChi: ['', [Validators.maxLength(200)]]
    });
  }

  ngOnInit(): void {
    this.customerId = Number(this.route.snapshot.paramMap.get('id'));
    const isEditRoute = this.route.snapshot.url.some(segment => segment.path === 'edit');
    
    if (this.customerId) {
      this.isEditMode = isEditRoute;
      this.isViewMode = !isEditRoute;
      this.loadCustomer();
    }
  }

  loadCustomer(): void {
    if (!this.customerId) return;
    
    this.loading = true;
    this.customerService.getCustomerById(this.customerId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          const customer = response.data || response;
          this.customerForm.patchValue({
            HoTen: customer.HoTen,
            SoDienThoai: customer.SoDienThoai,
            Email: customer.Email || '',
            DiaChi: customer.DiaChi || ''
          });
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Không thể tải thông tin khách hàng.';
          this.loading = false;
          console.error('Error loading customer:', err);
        }
      });
  }

  onSubmit(): void {
    if (this.customerForm.invalid) {
      this.markFormGroupTouched(this.customerForm);
      return;
    }

    this.loading = true;
    this.error = '';
    this.success = '';

    const formData = this.customerForm.value;

    const request = this.isEditMode && this.customerId
      ? this.customerService.updateCustomer(this.customerId, formData)
      : this.customerService.createCustomer(formData);

    request.subscribe({
      next: () => {
        this.success = this.isEditMode ? 'Cập nhật khách hàng thành công!' : 'Thêm khách hàng thành công!';
        this.loading = false;
        setTimeout(() => {
          this.router.navigate(['/customers']);
        }, 1500);
      },
      error: (err) => {
        this.error = err.error?.message || 'Có lỗi xảy ra. Vui lòng thử lại.';
        this.loading = false;
        console.error('Error saving customer:', err);
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/customers']);
  }

  editCustomer(): void {
    if (this.customerId) {
      this.router.navigate(['/customers', this.customerId, 'edit']);
    }
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  getErrorMessage(fieldName: string): string {
    const control = this.customerForm.get(fieldName);
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
    if (control.errors['pattern'] && fieldName === 'SoDienThoai') {
      return 'Số điện thoại không hợp lệ (phải bắt đầu bằng 0 và có 10 chữ số).';
    }
    if (control.errors['email']) {
      return 'Email không hợp lệ.';
    }

    return '';
  }

  isFieldInvalid(fieldName: string): boolean {
    const control = this.customerForm.get(fieldName);
    return !!(control && control.invalid && control.touched);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
