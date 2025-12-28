import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DoctorService } from '../../../services/doctor.service';

@Component({
  selector: 'app-pet-examination-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pet-examination-search.component.html',
  styleUrls: ['./pet-examination-search.component.css'],
})
export class PetExaminationSearchComponent implements OnInit {
  examinations: any[] = [];
  searchParams: any = {
    maThuCung: '',
    tenThuCung: '',
    maKhachHang: '',
    skip: 0,
    take: 10,
  };
  isLoading = false;
  totalResults = 0;
  currentPage = 1;
  hasSearched = false;

  // Modal state
  selectedExamination: any = null;
  isLoadingDetails = false;

  constructor(private doctorService: DoctorService) { }

  ngOnInit(): void {
    // Load all examinations by default
    this.searchExaminations();
  }

  searchExaminations(): void {
    this.hasSearched = true;
    this.isLoading = true;
    this.doctorService.searchPetExaminations(this.searchParams).subscribe({
      next: (response: any) => {
        this.examinations = response.data;
        this.totalResults = response.total;
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error searching examinations:', error);
        this.isLoading = false;
      },
    });
  }

  resetSearch(): void {
    this.searchParams = {
      maThuCung: '',
      tenThuCung: '',
      maKhachHang: '',
      skip: 0,
      take: 10,
    };
    this.currentPage = 1;
    this.searchExaminations();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.searchParams.skip = (page - 1) * this.searchParams.take;
    this.searchExaminations();
  }

  get totalPages(): number {
    return Math.ceil(this.totalResults / this.searchParams.take);
  }

  get pages(): number[] {
    const pages = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  // View examination details
  viewExaminationDetails(exam: any): void {
    this.isLoadingDetails = true;
    this.doctorService.getExaminationDetails(exam.MaGiayKhamTongQuat).subscribe({
      next: (response: any) => {
        this.selectedExamination = response;
        this.isLoadingDetails = false;
      },
      error: (error: any) => {
        console.error('Error loading examination details:', error);
        this.isLoadingDetails = false;
        alert('Không thể tải chi tiết hồ sơ khám');
      },
    });
  }

  // Close modal
  closeDetails(): void {
    this.selectedExamination = null;
  }

  // Format date for display
  formatDate(date: string | Date): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  // Format currency
  formatCurrency(amount: number): string {
    if (!amount) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  }

  // Edit modal state
  editingExamination: any = null;
  editForm: any = {
    nhietDo: 0,
    moTa: '',
    trieuChung: '',
    chuanDoan: '',
  };
  isUpdating = false;

  // Open edit modal
  openEditModal(exam: any): void {
    this.editingExamination = exam;
    this.editForm = {
      nhietDo: exam.NhietDo || 0,
      moTa: exam.MoTa || '',
      trieuChung: '',
      chuanDoan: '',
    };
  }

  // Close edit modal
  closeEditModal(): void {
    this.editingExamination = null;
    this.editForm = {
      nhietDo: 0,
      moTa: '',
      trieuChung: '',
      chuanDoan: '',
    };
  }

  // Save edited examination
  saveExamination(): void {
    if (!this.editingExamination) return;

    this.isUpdating = true;
    const updateData: any = {
      nhietDo: this.editForm.nhietDo,
      moTa: this.editForm.moTa,
    };

    // Convert comma-separated symptoms/diagnoses to arrays if provided
    if (this.editForm.trieuChung.trim()) {
      updateData.trieuChung = this.editForm.trieuChung.split(',').map((s: string) => s.trim()).filter((s: string) => s);
    }
    if (this.editForm.chuanDoan.trim()) {
      updateData.chuanDoan = this.editForm.chuanDoan.split(',').map((s: string) => s.trim()).filter((s: string) => s);
    }

    this.doctorService.updateExamination(this.editingExamination.MaGiayKhamTongQuat, updateData).subscribe({
      next: () => {
        this.closeEditModal();
        this.searchExaminations();
        this.isUpdating = false;
      },
      error: (error: any) => {
        console.error('Error updating examination:', error);
        this.isUpdating = false;
      },
    });
  }

  // Delete confirmation modal state
  examinationToDelete: any = null;
  isDeleting = false;

  // Open delete confirmation modal
  openDeleteConfirmation(exam: any): void {
    this.examinationToDelete = exam;
  }

  // Close delete confirmation modal
  closeDeleteConfirmation(): void {
    this.examinationToDelete = null;
  }

  // Confirm and delete examination
  confirmDeleteExamination(): void {
    if (!this.examinationToDelete) return;

    this.isDeleting = true;
    this.doctorService.deleteExamination(this.examinationToDelete.MaGiayKhamTongQuat).subscribe({
      next: () => {
        this.closeDeleteConfirmation();
        this.searchExaminations();
        this.isDeleting = false;
      },
      error: (error: any) => {
        console.error('Error deleting examination:', error);
        this.isDeleting = false;
      },
    });
  }
}

