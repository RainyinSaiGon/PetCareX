import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AdminStaffService, Employee, CreateEmployeeDto, UpdateEmployeeDto, Branch, EmployeeType, Department } from '../../services/admin-staff.service';

@Component({
  selector: 'app-staff-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './staff-form.component.html',
  styleUrls: ['./staff-form.component.css']
})
export class StaffFormComponent implements OnInit {
  isEditMode = false;
  maNhanVien: string | null = null;
  employee: Employee | null = null;

  formData: any = {
    maNhanVien: '',
    hoTen: '',
    sdt: '',
    ngaySinh: '',
    ngayVaoLam: '',
    maChiNhanh: '',
    loaiNhanVien: '',
    maKhoa: ''
  };

  branches: Branch[] = [];
  employeeTypes: EmployeeType[] = [];
  departments: Department[] = [];

  loading = false;
  submitting = false;
  error: string | null = null;
  errors: any = {};

  constructor(
    private adminStaffService: AdminStaffService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.maNhanVien = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.maNhanVien;

    this.loadReferenceData();

    if (this.isEditMode && this.maNhanVien) {
      this.loadEmployee();
    }
  }

  loadReferenceData(): void {
    this.adminStaffService.getBranches().subscribe({
      next: (branches) => this.branches = branches,
      error: (err) => console.error('Error loading branches:', err)
    });

    this.adminStaffService.getEmployeeTypes().subscribe({
      next: (types) => this.employeeTypes = types,
      error: (err) => console.error('Error loading employee types:', err)
    });

    this.adminStaffService.getDepartments().subscribe({
      next: (departments) => this.departments = departments,
      error: (err) => console.error('Error loading departments:', err)
    });
  }

  loadEmployee(): void {
    if (!this.maNhanVien) return;

    this.loading = true;
    this.adminStaffService.getEmployeeById(this.maNhanVien).subscribe({
      next: (employee) => {
        this.employee = employee;
        this.formData = {
          maNhanVien: employee.MaNhanVien,
          hoTen: employee.HoTen,
          sdt: employee.SDT,
          ngaySinh: this.formatDateForInput(employee.NgaySinh),
          ngayVaoLam: this.formatDateForInput(employee.NgayVaoLam),
          maChiNhanh: employee.MaChiNhanh,
          loaiNhanVien: employee.LoaiNhanVien,
          maKhoa: employee.MaKhoa || ''
        };
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Không thể tải thông tin nhân viên';
        this.loading = false;
      }
    });
  }

  validateForm(): boolean {
    this.errors = {};
    let isValid = true;

    // Mã nhân viên
    if (!this.isEditMode) {
      if (!this.formData.maNhanVien || this.formData.maNhanVien.length !== 5) {
        this.errors.maNhanVien = 'Mã nhân viên phải có đúng 5 ký tự';
        isValid = false;
      }
    }

    // Họ tên
    if (!this.formData.hoTen || this.formData.hoTen.trim().length < 2) {
      this.errors.hoTen = 'Họ tên phải có ít nhất 2 ký tự';
      isValid = false;
    }

    // Số điện thoại
    const phoneRegex = /^[0-9]{10}$/;
    if (!this.formData.sdt || !phoneRegex.test(this.formData.sdt)) {
      this.errors.sdt = 'Số điện thoại phải có đúng 10 chữ số';
      isValid = false;
    }

    // Chi nhánh
    if (!this.formData.maChiNhanh) {
      this.errors.maChiNhanh = 'Vui lòng chọn chi nhánh';
      isValid = false;
    }

    // Loại nhân viên
    if (!this.formData.loaiNhanVien) {
      this.errors.loaiNhanVien = 'Vui lòng chọn loại nhân viên';
      isValid = false;
    }

    // Ngày sinh (phải đủ 18 tuổi)
    if (this.formData.ngaySinh) {
      const birthDate = new Date(this.formData.ngaySinh);
      const age = this.calculateAge(birthDate);
      if (age < 18) {
        this.errors.ngaySinh = 'Nhân viên phải đủ 18 tuổi';
        isValid = false;
      }
    }

    return isValid;
  }

  onSubmit(): void {
    if (!this.validateForm()) {
      this.error = 'Vui lòng kiểm tra lại thông tin';
      return;
    }

    this.submitting = true;
    this.error = null;

    if (this.isEditMode) {
      this.updateEmployee();
    } else {
      this.createEmployee();
    }
  }

  createEmployee(): void {
    const dto: CreateEmployeeDto = {
      maNhanVien: this.formData.maNhanVien,
      hoTen: this.formData.hoTen.trim(),
      sdt: this.formData.sdt,
      ngaySinh: this.formData.ngaySinh ? new Date(this.formData.ngaySinh) : undefined,
      ngayVaoLam: this.formData.ngayVaoLam ? new Date(this.formData.ngayVaoLam) : undefined,
      maChiNhanh: this.formData.maChiNhanh,
      loaiNhanVien: this.formData.loaiNhanVien,
      maKhoa: this.formData.maKhoa || undefined
    };

    this.adminStaffService.createEmployee(dto).subscribe({
      next: (result) => {
        alert('Thêm nhân viên thành công!');
        this.router.navigate(['/admin/staff']);
      },
      error: (err) => {
        this.error = err.error?.message || 'Không thể thêm nhân viên. Vui lòng thử lại.';
        this.submitting = false;

        // Handle validation errors from backend
        if (err.error?.errors) {
          this.errors = err.error.errors;
        }
      }
    });
  }

  updateEmployee(): void {
    if (!this.maNhanVien) return;

    const dto: UpdateEmployeeDto = {
      hoTen: this.formData.hoTen.trim(),
      sdt: this.formData.sdt,
      ngaySinh: this.formData.ngaySinh ? new Date(this.formData.ngaySinh) : undefined,
      maChiNhanh: this.formData.maChiNhanh,
      loaiNhanVien: this.formData.loaiNhanVien,
      maKhoa: this.formData.maKhoa || undefined
    };

    this.adminStaffService.updateEmployee(this.maNhanVien, dto).subscribe({
      next: (result) => {
        alert('Cập nhật nhân viên thành công!');
        this.router.navigate(['/admin/staff']);
      },
      error: (err) => {
        this.error = err.error?.message || 'Không thể cập nhật nhân viên. Vui lòng thử lại.';
        this.submitting = false;

        if (err.error?.errors) {
          this.errors = err.error.errors;
        }
      }
    });
  }

  onCancel(): void {
    if (confirm('Bạn có chắc chắn muốn hủy? Các thay đổi chưa lưu sẽ bị mất.')) {
      this.router.navigate(['/admin/staff']);
    }
  }

  calculateAge(birthDate: Date | string): number {
    const date = typeof birthDate === 'string' ? new Date(birthDate) : birthDate;
    const today = new Date();
    let age = today.getFullYear() - date.getFullYear();
    const monthDiff = today.getMonth() - date.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
      age--;
    }
    return age;
  }

  formatDateForInput(date: Date): string {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  getEmployeeTypeSalary(): number {
    if (!this.formData.loaiNhanVien) return 0;
    const type = this.employeeTypes.find(t => t.loaiNhanVien === this.formData.loaiNhanVien);
    return type?.luong || 0;
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  }
}
