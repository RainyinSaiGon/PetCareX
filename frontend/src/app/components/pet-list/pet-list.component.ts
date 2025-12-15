import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CustomerService } from '../../services/customer.service';
import { ThuCung } from '../../models/pet.model';
import { PaginatedResponse } from '../../models/customer.model';

@Component({
  selector: 'app-pet-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pet-list.component.html',
  styleUrls: ['./pet-list.component.css']
})
export class PetListComponent implements OnInit {
  pets: ThuCung[] = [];
  customerId?: number;
  customerName?: string;
  loading = false;
  error = '';
  
  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalItems = 0;
  totalPages = 0;
  
  // Search
  searchKeyword = '';

  constructor(
    private customerService: CustomerService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.customerId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.customerId) {
      this.loadPets();
      this.loadCustomerInfo();
    }
  }

  loadCustomerInfo(): void {
    if (!this.customerId) return;
    
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

  loadPets(): void {
    if (!this.customerId) return;
    
    this.loading = true;
    this.error = '';
    
    this.customerService.getPets(this.customerId, this.currentPage, this.pageSize)
      .subscribe({
        next: (response: PaginatedResponse<ThuCung>) => {
          this.pets = response.data;
          this.totalItems = response.total;
          this.totalPages = response.totalPages;
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Không thể tải danh sách thú cưng. Vui lòng thử lại.';
          this.loading = false;
          console.error('Error loading pets:', err);
        }
      });
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadPets();
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadPets();
    }
  }

  viewPet(petId: number): void {
    this.router.navigate(['/customers', this.customerId, 'pets', petId, 'edit']);
  }

  editPet(petId: number): void {
    this.router.navigate(['/customers', this.customerId, 'pets', petId, 'edit']);
  }

  deletePet(pet: ThuCung): void {
    if (!this.customerId) return;
    
    if (confirm(`Bạn có chắc chắn muốn xóa thú cưng "${pet.TenThuCung}"?`)) {
      this.customerService.deletePet(this.customerId, pet.MaThuCung)
        .subscribe({
          next: () => {
            this.loadPets();
          },
          error: (err) => {
            this.error = err.error?.message || 'Không thể xóa thú cưng. Vui lòng thử lại.';
            console.error('Error deleting pet:', err);
          }
        });
    }
  }

  createPet(): void {
    this.router.navigate(['/customers', this.customerId, 'pets', 'new']);
  }

  backToCustomers(): void {
    this.router.navigate(['/customers']);
  }

  getPaginationPages(): number[] {
    const pages: number[] = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(this.totalPages, startPage + maxPagesToShow - 1);
    
    if (endPage - startPage < maxPagesToShow - 1) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  getPetIcon(breedName?: string): string {
    if (!breedName) return 'fas fa-paw';
    
    const breed = breedName.toLowerCase();
    
    // Dog breeds
    if (breed.includes('husky') || breed.includes('poodle') || breed.includes('bulldog') || 
        breed.includes('beagle') || breed.includes('corgi') || breed.includes('chó') || 
        breed.includes('dog') || breed.includes('retriever') || breed.includes('shepherd')) {
      return 'fas fa-dog';
    }
    
    // Cat breeds
    if (breed.includes('persian') || breed.includes('siamese') || breed.includes('bengal') || 
        breed.includes('ragdoll') || breed.includes('mèo') || breed.includes('cat')) {
      return 'fas fa-cat';
    }
    
    // Birds
    if (breed.includes('chicken') || breed.includes('gà') || breed.includes('parrot') || 
        breed.includes('canary') || breed.includes('cockatiel') || breed.includes('bird') || 
        breed.includes('chim')) {
      return 'fas fa-dove';
    }
    
    // Fish
    if (breed.includes('cá') || breed.includes('fish') || breed.includes('goldfish') || 
        breed.includes('koi')) {
      return 'fas fa-fish';
    }
    
    // Rabbit
    if (breed.includes('rabbit') || breed.includes('thỏ') || breed.includes('bunny')) {
      return 'fas fa-rabbit';
    }
    
    // Default
    return 'fas fa-paw';
  }
}
