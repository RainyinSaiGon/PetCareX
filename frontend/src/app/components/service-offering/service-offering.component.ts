import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { BranchService } from '../../services/branch.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-service-offering',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './service-offering.component.html',
  styleUrls: ['./service-offering.component.css'],
})
export class ServiceOfferingComponent implements OnInit {
  offerings: any[] = [];
  branches: any[] = [];
  services: any[] = [];

  loading = false;
  submitting = false;
  showForm = false;
  isEditMode = false;
  selectedOffering: any = null;

  currentPage = 1;
  pageSize = 10;
  totalItems = 0;

  form!: FormGroup;
  searchTerm = '';
  filterBranch = '';
  filterService = '';

  successMessage = '';
  errorMessage = '';

  private apiUrl = environment.apiUrl;

  constructor(
    private branchService: BranchService,
    private formBuilder: FormBuilder,
    private http: HttpClient
  ) {
    this.form = this.formBuilder.group({
      branchId: ['', Validators.required],
      serviceId: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(0)]],
      description: [''],
      status: ['active', Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadBranches();
    this.loadServices();
    this.loadOfferings();
  }

  loadBranches(): void {
    this.branchService.getBranches().subscribe({
      next: (response) => {
        // API returns { success: true, data: branches[] }
        // Branch properties use PascalCase: MaChiNhanh, TenChiNhanh
        const branches = response.data || response;
        this.branches = branches.map((b: any) => ({
          id: (b.MaChiNhanh || b.maChiNhanh || '').trim(),
          name: b.TenChiNhanh || b.tenChiNhanh
        }));
      },
      error: (err) => {
        console.error('Error loading branches:', err);
        this.errorMessage = 'Không thể tải danh sách chi nhánh';
      }
    });
  }

  loadServices(): void {
    // Call admin API to get all services
    this.http.get(`${this.apiUrl}/branch/services/all`).subscribe({
      next: (data: any) => {
        this.services = data.map((s: any) => ({
          id: s.maDichVu.trim(),
          name: s.tenDichVu
        }));
      },
      error: (err) => {
        console.error('Error loading services:', err);
        this.errorMessage = 'Không thể tải danh sách dịch vụ';
      }
    });
  }

  loadOfferings(): void {
    this.loading = true;
    // Fetch all offerings for client-side filtering (use large limit)
    // This ensures branch/service filters work correctly
    this.branchService.getAllServiceOfferings(1, 1000).subscribe({
      next: (response) => {
        this.offerings = response.data.map((o: any) => ({
          id: o.MaChiNhanh.trim() + '-' + o.MaDichVu.trim(),
          branchId: o.MaChiNhanh.trim(),
          branchName: o.TenChiNhanh,
          serviceId: o.MaDichVu.trim(),
          serviceName: o.TenDichVu,
          price: o.GiaThanhLe || 0,
          description: o.GhiChu || '',
          status: o.IsActive ? 'active' : 'inactive'
        }));
        this.totalItems = this.offerings.length;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading offerings:', err);
        this.errorMessage = 'Không thể tải danh sách dịch vụ chi nhánh';
        this.loading = false;
      }
    });
  }

  openCreateForm(): void {
    this.showForm = true;
    this.isEditMode = false;
    this.selectedOffering = null;
    this.form.reset({ status: 'active' });
  }

  openEditForm(offering: any): void {
    this.showForm = true;
    this.isEditMode = true;
    this.selectedOffering = offering;
    this.form.patchValue({
      branchId: offering.branchId,
      serviceId: offering.serviceId,
      price: offering.price,
      description: offering.description,
      status: offering.status,
    });
  }

  closeForm(): void {
    this.showForm = false;
    this.form.reset();
  }

  submitForm(): void {
    if (!this.form.valid) {
      this.errorMessage = 'Vui lòng điền đầy đủ các trường bắt buộc';
      return;
    }

    this.submitting = true;
    const formValue = this.form.value;

    if (this.isEditMode && this.selectedOffering) {
      // Update existing service offering
      const updateData = {
        GiaThanhLe: formValue.price,
        GhiChu: formValue.description
      };

      this.branchService.updateServiceOffering(
        this.selectedOffering.branchId,
        this.selectedOffering.serviceId,
        updateData
      ).subscribe({
        next: () => {
          this.successMessage = 'Cập nhật dịch vụ thành công';
          this.loadOfferings();
          this.closeForm();
          this.submitting = false;
          setTimeout(() => (this.successMessage = ''), 3000);
        },
        error: (err) => {
          console.error('Error updating service offering:', err);
          this.errorMessage = 'Không thể cập nhật dịch vụ';
          this.submitting = false;
        }
      });
    } else {
      // Create new service offering
      const createData = {
        MaChiNhanh: formValue.branchId,
        MaDichVu: formValue.serviceId,
        GiaThanhLe: formValue.price,
        GhiChu: formValue.description
      };

      this.branchService.createServiceOffering(createData).subscribe({
        next: () => {
          this.successMessage = 'Tạo dịch vụ thành công';
          this.loadOfferings();
          this.closeForm();
          this.submitting = false;
          setTimeout(() => (this.successMessage = ''), 3000);
        },
        error: (err) => {
          console.error('Error creating service offering:', err);
          this.errorMessage = err.error?.message || 'Không thể tạo dịch vụ';
          this.submitting = false;
        }
      });
    }
  }

  deleteOffering(offering: any): void {
    if (!confirm(`Bạn có chắc muốn xóa dịch vụ "${offering.serviceName}"?`)) {
      return;
    }

    this.offerings = this.offerings.filter((o) => o.id !== offering.id);
    this.totalItems = this.offerings.length;
    this.successMessage = 'Xóa dịch vụ thành công';
    setTimeout(() => (this.successMessage = ''), 3000);
  }

  getFilteredOfferings(): any[] {
    return this.offerings.filter((offering) => {
      const matchSearch =
        !this.searchTerm ||
        offering.serviceName?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        offering.branchName?.toLowerCase().includes(this.searchTerm.toLowerCase());

      // Compare as trimmed strings for proper matching
      const matchBranch = !this.filterBranch ||
        offering.branchId?.trim() === this.filterBranch?.trim();
      const matchService = !this.filterService ||
        offering.serviceId?.trim() === this.filterService?.trim();

      return matchSearch && matchBranch && matchService;
    });
  }

  // Returns only the current page's items
  getPagedOfferings(): any[] {
    const filtered = this.getFilteredOfferings();
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    return filtered.slice(startIndex, endIndex);
  }

  onPageChange(newPage: number): void {
    if (newPage >= 1 && newPage <= this.totalPages) {
      this.currentPage = newPage;
    }
  }

  get totalPages(): number {
    // Use filtered count for pagination when filters are active
    const filteredCount = this.getFilteredOfferings().length;
    return Math.ceil(filteredCount / this.pageSize) || 1;
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);
  }
}
