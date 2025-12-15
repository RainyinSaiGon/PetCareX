import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { BranchService } from '../../services/branch.service';

@Component({
  selector: 'app-employee-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './employee-form.component.html',
  styleUrls: ['./employee-form.component.css'],
})
export class EmployeeFormComponent implements OnInit {
  form!: FormGroup;
  loading = false;
  submitting = false;
  isEditMode = false;
  employeeId: string | null = null;
  branches: any[] = [];
  employeeTypes = ['Bác sĩ', 'Tiếp tân', 'Nhân viên kho', 'Quản lý'];
  departments: any[] = [];
  
  errorMessages: { [key: string]: string } = {};
  error: string | null = null;
  successMessage: string | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private branchService: BranchService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadBranches();
    this.checkEditMode();
  }

  initForm(): void {
    this.form = this.formBuilder.group({
      MaNhanVien: ['', [Validators.required, Validators.minLength(3)]],
      HoTen: ['', [Validators.required, Validators.minLength(3)]],
      NgayVaoLam: ['', Validators.required],
      NgaySinh: [''],
      SDT: ['', [Validators.pattern(/^\d{10}$/)]],
      MaChiNhanh: ['', Validators.required],
      LoaiNhanVien: ['', Validators.required],
      MaKhoa: [''],
    });
  }

  loadBranches(): void {
    // Mock branches loading - would connect to actual service
    this.branches = [
      { MaChiNhanh: 'CN01', TenChiNhanh: 'Chi nhánh Hà Nội' },
      { MaChiNhanh: 'CN02', TenChiNhanh: 'Chi nhánh TP HCM' },
      { MaChiNhanh: 'CN03', TenChiNhanh: 'Chi nhánh Đà Nẵng' },
    ];

    this.departments = [
      { MaKhoa: 'K01', TenKhoa: 'Khoa Ngoại' },
      { MaKhoa: 'K02', TenKhoa: 'Khoa Nội' },
    ];
  }

  checkEditMode(): void {
    this.activatedRoute.params.subscribe((params) => {
      if (params['id'] && params['id'] !== 'new') {
        this.isEditMode = true;
        this.employeeId = params['id'];
        this.form.get('MaNhanVien')?.disable();
        this.loadEmployee();
      }
    });
  }

  loadEmployee(): void {
    if (!this.employeeId) return;
    this.loading = true;
    this.branchService.getEmployeeById(this.employeeId).subscribe({
      next: (employee) => {
        this.form.patchValue(employee);
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load employee:', err);
        this.error = 'Không thể tải thông tin nhân viên';
        this.loading = false;
      },
    });
  }

  validateForm(): boolean {
    this.errorMessages = {};
    let isValid = true;

    // Mã nhân viên validation (only for create mode)
    if (!this.isEditMode) {
      const maNhanVien = this.form.get('MaNhanVien')?.value;
      if (!maNhanVien || maNhanVien.length !== 5) {
        this.errorMessages['MaNhanVien'] = 'Mã nhân viên phải có đúng 5 ký tự';
        isValid = false;
      }
    }

    // Phone validation
    const sdt = this.form.get('SDT')?.value;
    if (sdt && !/^\d{10}$/.test(sdt)) {
      this.errorMessages['SDT'] = 'Số điện thoại phải có đúng 10 chữ số';
      isValid = false;
    }

    // Age validation (must be 18 or older)
    const ngaySinh = this.form.get('NgaySinh')?.value;
    if (ngaySinh) {
      const age = this.calculateAge(new Date(ngaySinh));
      if (age < 18) {
        this.errorMessages['NgaySinh'] = 'Nhân viên phải đủ 18 tuổi';
        isValid = false;
      }
    }

    return isValid && this.form.valid;
  }

  onSubmit(): void {
    if (!this.validateForm()) {
      this.error = 'Vui lòng kiểm tra lại thông tin';
      return;
    }

    this.submitting = true;
    this.error = null;

    const formData = this.isEditMode
      ? { ...this.form.getRawValue() }
      : this.form.value;

    const request = this.isEditMode
      ? this.branchService.updateEmployee(this.employeeId!, formData)
      : this.branchService.createEmployee(formData);

    request.subscribe({
      next: () => {
        this.successMessage = this.isEditMode ? 'Cập nhật nhân viên thành công' : 'Tạo nhân viên thành công';
        setTimeout(() => {
          this.router.navigate(['/employees']);
        }, 1500);
      },
      error: (err) => {
        console.error('Failed to save employee:', err);
        this.error = err.error?.message || 'Lỗi: Không thể lưu nhân viên';
        this.submitting = false;
      },
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return field ? field.invalid && (field.dirty || field.touched) : false;
  }

  getErrorMessage(fieldName: string): string {
    if (this.errorMessages[fieldName]) {
      return this.errorMessages[fieldName];
    }

    const field = this.form.get(fieldName);
    if (!field || !field.errors) return '';

    if (field.errors['required']) {
      return `${fieldName} là bắt buộc`;
    }
    if (field.errors['minlength']) {
      return `${fieldName} phải có ít nhất ${field.errors['minlength'].requiredLength} ký tự`;
    }
    if (field.errors['pattern']) {
      return `${fieldName} không hợp lệ`;
    }
    return 'Trường không hợp lệ';
  }

  calculateAge(birthDate: Date): number {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  getEmployeeTypeSalary(): number {
    const loaiNhanVien = this.form.get('LoaiNhanVien')?.value;
    if (!loaiNhanVien) return 0;
    // Mock salary lookup
    const salaries: { [key: string]: number } = {
      'Bác sĩ': 25000000,
      'Tiếp tân': 8000000,
      'Nhân viên kho': 7000000,
      'Quản lý': 20000000,
    };
    return salaries[loaiNhanVien] || 0;
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);
  }

  markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach((key) => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  onCancel(): void {
    if (confirm('Bạn có chắc chắn muốn hủy? Các thay đổi chưa lưu sẽ bị mất.')) {
      this.router.navigate(['/employees']);
    }
  }
}

