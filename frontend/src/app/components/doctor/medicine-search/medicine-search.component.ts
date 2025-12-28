import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DoctorService } from '../../../services/doctor.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-medicine-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './medicine-search.component.html',
  styleUrls: ['./medicine-search.component.css'],
})
export class MedicineSearchComponent implements OnInit, OnDestroy {
  medicines: any[] = [];
  searchParams: any = {
    tenSanPham: '',
    skip: 0,
    take: 10,
  };
  isLoading = false;
  totalResults = 0;
  currentPage = 1;
  private destroy$ = new Subject<void>();
  Math = Math; // Expose Math to template

  constructor(private doctorService: DoctorService) {}

  ngOnInit(): void {
    console.log('MedicineSearchComponent initialized');
    // Load all medicines by default
    this.loadAllMedicines();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadAllMedicines(): void {
    this.isLoading = true;
    console.log('Loading all medicines');
    this.doctorService.getAllMedicines(this.searchParams.skip, this.searchParams.take)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.medicines = response.data || [];
          this.totalResults = response.total || 0;
          this.isLoading = false;
          console.log(`Loaded ${this.medicines.length} medicines, total: ${this.totalResults}`);
        },
        error: (error: any) => {
          console.error('Error loading medicines:', error);
          this.isLoading = false;
          this.showError('Lỗi tải danh sách thuốc: ' + (error.error?.message || error.message));
        },
      });
  }

  loadMedicines(): void {
    this.isLoading = true;
    console.log('Loading medicines with params:', this.searchParams);
    this.doctorService.searchMedicines(this.searchParams)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.medicines = response.data || [];
          this.totalResults = response.total || 0;
          this.isLoading = false;
          console.log(`Loaded ${this.medicines.length} medicines, total: ${this.totalResults}`);
        },
        error: (error: any) => {
          console.error('Error searching medicines:', error);
          this.isLoading = false;
          this.showError('Lỗi tìm kiếm thuốc: ' + (error.error?.message || error.message));
        },
      });
  }

  searchMedicines(): void {
    console.log('Search triggered with keyword:', this.searchParams.tenSanPham);
    this.currentPage = 1;
    this.searchParams.skip = 0;
    if (this.searchParams.tenSanPham.trim()) {
      // If search term provided, use search endpoint
      this.loadMedicines();
    } else {
      // If empty search, load all medicines
      this.loadAllMedicines();
    }
  }

  resetSearch(): void {
    console.log('Reset search');
    this.searchParams = {
      tenSanPham: '',
      skip: 0,
      take: 10,
    };
    this.currentPage = 1;
    this.medicines = [];
    this.totalResults = 0;
    this.loadAllMedicines();
  }

  onPageChange(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    console.log('Page changed to:', page);
    this.currentPage = page;
    this.searchParams.skip = (page - 1) * this.searchParams.take;
    
    // Use appropriate loader based on whether searching or showing all
    if (this.searchParams.tenSanPham.trim()) {
      this.loadMedicines();
    } else {
      this.loadAllMedicines();
    }
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  get totalPages(): number {
    return Math.ceil(this.totalResults / this.searchParams.take);
  }

  get pages(): number[] {
    const pages = [];
    const maxPagesToShow = 5;
    let start = Math.max(1, this.currentPage - 2);
    let end = Math.min(this.totalPages, start + maxPagesToShow - 1);
    
    if (end - start < maxPagesToShow - 1) {
      start = Math.max(1, end - maxPagesToShow + 1);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  private showError(message: string): void {
    console.error(message);
    // TODO: Replace with toast/snackbar service
  }
}
