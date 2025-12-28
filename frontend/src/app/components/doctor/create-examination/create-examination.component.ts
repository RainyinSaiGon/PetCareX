import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { DoctorService } from '../../../services/doctor.service';
import { PetService } from '../../../services/pet.service';

@Component({
  selector: 'app-create-examination',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-examination.component.html',
  styleUrls: ['./create-examination.component.css'],
})
export class CreateExaminationComponent implements OnInit {
  examinationForm: any = {
    maThuCung: 0,
    nhietDo: 0,
    moTa: '',
    trieuChung: [] as string[],
    chuanDoan: [] as string[],
  };

  symptoms: string[] = [];
  diagnoses: string[] = [];
  newSymptom: string = '';
  newDiagnosis: string = '';
  isSubmitting = false;
  maThuCung: number = 0;
  isLoadingMedicalRecord = false;
  hasMedicalRecord = false;
  medicalRecordStatus: any = null;

  // Pet search state
  petSearchQuery: string = '';
  searchedPets: any[] = [];
  selectedPet: any = null;
  isSearchingPets = false;

  constructor(
    private doctorService: DoctorService,
    private petService: PetService,
    private router: Router,
    private route: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      if (params['maThuCung']) {
        this.maThuCung = params['maThuCung'];
        this.examinationForm.maThuCung = this.maThuCung;
        this.loadPetById(this.maThuCung);
        this.checkMedicalRecordStatus();
      }
    });
  }

  // Load pet by ID from route params
  loadPetById(petId: number): void {
    this.petService.getPetById(petId).subscribe({
      next: (pet: any) => {
        this.selectedPet = pet;
        this.petSearchQuery = pet.TenThuCung;
      },
      error: (error: any) => {
        console.error('Error loading pet:', error);
      },
    });
  }

  // Search pets by name
  searchPets(): void {
    if (!this.petSearchQuery.trim()) {
      this.searchedPets = [];
      return;
    }

    this.isSearchingPets = true;
    this.petService.searchPets(this.petSearchQuery).subscribe({
      next: (pets: any[]) => {
        this.searchedPets = pets;
        this.isSearchingPets = false;
      },
      error: (error: any) => {
        console.error('Error searching pets:', error);
        this.searchedPets = [];
        this.isSearchingPets = false;
      },
    });
  }

  // Select a pet from the dropdown
  selectPet(pet: any): void {
    this.selectedPet = pet;
    this.examinationForm.maThuCung = pet.MaThuCung;
    this.maThuCung = pet.MaThuCung;
    this.petSearchQuery = pet.TenThuCung;
    this.searchedPets = [];
    this.checkMedicalRecordStatus();
  }

  // Clear pet selection
  clearPetSelection(): void {
    this.selectedPet = null;
    this.examinationForm.maThuCung = 0;
    this.maThuCung = 0;
    this.petSearchQuery = '';
    this.searchedPets = [];
    this.hasMedicalRecord = false;
  }

  checkMedicalRecordStatus(): void {
    if (!this.maThuCung) return;

    this.isLoadingMedicalRecord = true;
    this.doctorService.checkPetMedicalRecord(this.maThuCung).subscribe({
      next: (response: any) => {
        console.log('Medical record status:', response);
        this.hasMedicalRecord = response?.hasExisting || false;
        this.medicalRecordStatus = response;
        this.isLoadingMedicalRecord = false;
      },
      error: (error: any) => {
        console.error('Error checking medical record:', error);
        // Default to false if endpoint doesn't exist or errors
        this.hasMedicalRecord = false;
        this.isLoadingMedicalRecord = false;
      },
    });
  }

  addSymptom(): void {
    if (this.newSymptom.trim()) {
      this.symptoms.push(this.newSymptom.trim());
      this.examinationForm.trieuChung = this.symptoms;
      this.newSymptom = '';
    }
  }

  removeSymptom(index: number): void {
    this.symptoms.splice(index, 1);
    this.examinationForm.trieuChung = this.symptoms;
  }

  addDiagnosis(): void {
    if (this.newDiagnosis.trim()) {
      this.diagnoses.push(this.newDiagnosis.trim());
      this.examinationForm.chuanDoan = this.diagnoses;
      this.newDiagnosis = '';
    }
  }

  removeDiagnosis(index: number): void {
    this.diagnoses.splice(index, 1);
    this.examinationForm.chuanDoan = this.diagnoses;
  }

  submitForm(): void {
    if (!this.examinationForm.maThuCung || !this.selectedPet) {
      alert('Vui lòng chọn thú cưng từ hệ thống');
      return;
    }

    this.isSubmitting = true;
    this.doctorService.createExamination(this.examinationForm).subscribe({
      next: (response: any) => {
        // Navigate to examination search page
        this.router.navigate(['/doctor/examinations/search']);
        this.isSubmitting = false;
      },
      error: (error: any) => {
        console.error('Error creating examination:', error);
        alert('Lỗi: ' + (error.error?.message || 'Không thể tạo bệnh án'));
        this.isSubmitting = false;
      },
    });
  }

  resetForm(): void {
    this.examinationForm = {
      maThuCung: this.maThuCung || 0,
      nhietDo: 0,
      moTa: '',
      trieuChung: [],
      chuanDoan: [],
    };
    this.symptoms = [];
    this.diagnoses = [];
    if (!this.maThuCung) {
      this.clearPetSelection();
    }
  }
}

