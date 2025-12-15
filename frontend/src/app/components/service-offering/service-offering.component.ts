import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BranchService } from '../../services/branch.service';

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

  constructor(private branchService: BranchService, private formBuilder: FormBuilder) {
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
    this.loadOfferings();
    this.loadServices();
  }

  loadBranches(): void {
    this.branches = [
      { id: 'CN01', name: 'Chi nhánh Hà Nội' },
      { id: 'CN02', name: 'Chi nhánh TP HCM' },
      { id: 'CN03', name: 'Chi nhánh Đà Nẵng' },
    ];
  }

  loadServices(): void {
    this.services = [
      { id: 1, name: 'Khám tổng quát' },
      { id: 2, name: 'Tiêm phòng' },
      { id: 3, name: 'Khám chuyên khoa' },
      { id: 4, name: 'Phẫu thuật' },
      { id: 5, name: 'Tắm groom' },
    ];
  }

  loadOfferings(): void {
    this.loading = true;
    this.offerings = [
      {
        id: 1,
        branchId: 'CN01',
        branchName: 'Chi nhánh Hà Nội',
        serviceId: 1,
        serviceName: 'Khám tổng quát',
        price: 500000,
        description: 'Khám sức khỏe tổng quát',
        status: 'active',
      },
      {
        id: 2,
        branchId: 'CN02',
        branchName: 'Chi nhánh TP HCM',
        serviceId: 2,
        serviceName: 'Tiêm phòng',
        price: 300000,
        description: 'Tiêm phòng dịch bệnh',
        status: 'active',
      },
    ];
    this.totalItems = this.offerings.length;
    this.loading = false;
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
      this.selectedOffering.price = formValue.price;
      this.selectedOffering.description = formValue.description;
      this.selectedOffering.status = formValue.status;
      this.successMessage = 'Cập nhật dịch vụ thành công';
    } else {
      const newOffering = {
        id: this.offerings.length + 1,
        branchId: formValue.branchId,
        branchName: this.branches.find((b) => b.id === formValue.branchId)?.name || '',
        serviceId: formValue.serviceId,
        serviceName: this.services.find((s) => s.id === formValue.serviceId)?.name || '',
        price: formValue.price,
        description: formValue.description,
        status: formValue.status,
      };
      this.offerings.unshift(newOffering);
      this.totalItems = this.offerings.length;
      this.successMessage = 'Tạo dịch vụ thành công';
    }

    this.closeForm();
    this.submitting = false;
    setTimeout(() => (this.successMessage = ''), 3000);
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
        offering.serviceName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        offering.branchName.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchBranch = !this.filterBranch || offering.branchId === this.filterBranch;
      const matchService = !this.filterService || offering.serviceId === parseInt(this.filterService);

      return matchSearch && matchBranch && matchService;
    });
  }

  onPageChange(newPage: number): void {
    if (newPage >= 1 && newPage <= this.totalPages) {
      this.currentPage = newPage;
    }
  }

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.pageSize);
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);
  }
}
