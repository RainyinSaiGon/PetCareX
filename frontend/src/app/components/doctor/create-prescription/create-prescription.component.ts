import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { DoctorService } from '../../../services/doctor.service';
import { PetService } from '../../../services/pet.service';

interface PrescriptionItem {
  maThuoc: string;
  tenSanPham: string;
  soLuong: number;
  ghiChu: string;
  giaSanPham: number;
}

@Component({
  selector: 'app-create-prescription',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-prescription.component.html',
  styleUrls: ['./create-prescription.component.css'],
})
export class CreatePrescriptionComponent implements OnInit {
  prescriptionForm: any = {
    maThuCung: 0,
    maGiayKhamTongQuat: 0,
    chiTiets: [] as PrescriptionItem[],
  };

  examinations: any[] = [];
  searchExaminationQuery: string = '';
  filteredExaminations: any[] = [];
  selectedExamination: any = null;

  medicines: any[] = [];
  searchMedicineQuery: string = '';
  filteredMedicines: any[] = [];
  newPrescriptionItem: any = {
    maThuoc: '',
    soLuong: 1,
    ghiChu: '',
  };

  isSearching = false;
  isSubmitting = false;
  totalAmount: number = 0;

  constructor(
    private doctorService: DoctorService,
    private petService: PetService,
    private router: Router,
    private route: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    console.log('CreatePrescriptionComponent initialized');
    this.route.params.subscribe((params) => {
      if (params['maThuCung']) {
        console.log('Pet ID from route:', params['maThuCung']);
        this.loadAllExaminations();
      }
    });
    this.loadAllExaminations();
    this.loadMedicines();
  }

  loadAllExaminations(): void {
    this.isSearching = true;
    console.log('Loading all examinations...');
    // Load all examinations for all pets
    this.doctorService.searchPetExaminations({ skip: 0, take: 1000 }).subscribe({
      next: (response: any) => {
        console.log('Examinations loaded:', response);
        this.examinations = Array.isArray(response.data) ? response.data : [];
        this.filteredExaminations = this.examinations;
        this.isSearching = false;
      },
      error: (error: any) => {
        console.error('Error loading examinations:', error);
        this.examinations = [];
        this.filteredExaminations = [];
        this.isSearching = false;
      },
    });
  }

  searchExaminations(): void {
    if (!this.searchExaminationQuery.trim()) {
      this.filteredExaminations = this.examinations;
      return;
    }

    const query = this.searchExaminationQuery.toLowerCase();
    this.filteredExaminations = this.examinations.filter(
      (exam) =>
        exam.ThuCung?.TenThuCung?.toLowerCase().includes(query) ||
        exam.MaGiayKhamTongQuat?.toString().includes(query) ||
        exam.ThuCung?.KhachHang?.HoTen?.toLowerCase().includes(query),
    );
  }

  selectExamination(exam: any): void {
    this.selectedExamination = exam;
    this.prescriptionForm.maThuCung = exam.ThuCung?.MaThuCung;
    this.prescriptionForm.maGiayKhamTongQuat = exam.MaGiayKhamTongQuat;
    this.searchExaminationQuery = `${exam.ThuCung?.TenThuCung} - #${exam.MaGiayKhamTongQuat}`;
    this.filteredExaminations = [];
  }

  clearExaminationSelection(): void {
    this.selectedExamination = null;
    this.prescriptionForm.maThuCung = 0;
    this.searchExaminationQuery = '';
    this.filteredExaminations = this.examinations;
  }

  loadMedicines(): void {
    this.isSearching = true;
    console.log('Loading medicines...');
    this.doctorService.getAllMedicines(0, 100).subscribe({
      next: (response: any) => {
        console.log('Medicines loaded:', response);
        this.medicines = response.data;
        this.isSearching = false;
      },
      error: (error: any) => {
        console.error('Error loading medicines:', error);
        this.medicines = [];
        this.isSearching = false;
      },
    });
  }

  searchMedicines(): void {
    if (!this.searchMedicineQuery.trim()) {
      this.filteredMedicines = [];
      return;
    }

    this.filteredMedicines = this.medicines.filter(
      (m) =>
        m.TenSanPham?.toLowerCase().includes(this.searchMedicineQuery.toLowerCase()) ||
        m.MaSanPham?.toLowerCase().includes(this.searchMedicineQuery.toLowerCase()),
    );
  }

  selectMedicine(medicine: any): void {
    this.newPrescriptionItem.maThuoc = medicine.MaSanPham;
    this.newPrescriptionItem.tenSanPham = medicine.TenSanPham;
    this.newPrescriptionItem.giaSanPham = medicine.GiaSanPham || 0;
    this.searchMedicineQuery = medicine.TenSanPham;
    this.filteredMedicines = [];
  }

  addPrescriptionItem(): void {
    if (!this.newPrescriptionItem.maThuoc || !this.newPrescriptionItem.soLuong) {
      alert('Vui lòng chọn thuốc và nhập số lượng');
      return;
    }

    const item: PrescriptionItem = {
      maThuoc: this.newPrescriptionItem.maThuoc,
      tenSanPham: this.newPrescriptionItem.tenSanPham,
      soLuong: this.newPrescriptionItem.soLuong,
      ghiChu: this.newPrescriptionItem.ghiChu,
      giaSanPham: this.newPrescriptionItem.giaSanPham,
    };

    // Check if medicine already in list
    const existingIndex = this.prescriptionForm.chiTiets.findIndex(
      (ct: PrescriptionItem) => ct.maThuoc === item.maThuoc,
    );

    if (existingIndex >= 0) {
      this.prescriptionForm.chiTiets[existingIndex].soLuong += item.soLuong;
    } else {
      this.prescriptionForm.chiTiets.push(item);
    }

    this.calculateTotal();
    this.resetPrescriptionItemInput();
  }

  removePrescriptionItem(index: number): void {
    this.prescriptionForm.chiTiets.splice(index, 1);
    this.calculateTotal();
  }

  calculateTotal(): void {
    this.totalAmount = this.prescriptionForm.chiTiets.reduce(
      (sum: number, item: PrescriptionItem) => sum + item.giaSanPham * item.soLuong,
      0,
    );
  }

  resetPrescriptionItemInput(): void {
    this.newPrescriptionItem = {
      maThuoc: '',
      soLuong: 1,
      ghiChu: '',
    };
    this.searchMedicineQuery = '';
  }

  submitForm(): void {
    if (!this.prescriptionForm.maThuCung) {
      alert('Vui lòng nhập mã thú cưng');
      return;
    }

    if (this.prescriptionForm.chiTiets.length === 0) {
      alert('Vui lòng thêm ít nhất một thuốc vào toa');
      return;
    }

    this.isSubmitting = true;

    const submitData = {
      maThuCung: this.prescriptionForm.maThuCung,
      maGiayKhamTongQuat: this.prescriptionForm.maGiayKhamTongQuat,
      chiTiets: this.prescriptionForm.chiTiets.map((item: PrescriptionItem) => ({
        maThuoc: item.maThuoc,
        soLuong: item.soLuong,
        ghiChu: item.ghiChu,
      })),
    };

    this.doctorService.createPrescription(submitData).subscribe({
      next: (response: any) => {
        // Navigate to examination search page where prescriptions can be viewed
        this.router.navigate(['/doctor/examinations/search']);
        this.isSubmitting = false;
      },
      error: (error: any) => {
        console.error('Error creating prescription:', error);
        alert('Lỗi: ' + (error.error?.message || 'Không thể kê toa'));
        this.isSubmitting = false;
      },
    });
  }

  resetForm(): void {
    this.prescriptionForm = {
      maThuCung: 0,
      maGiayKhamTongQuat: 0,
      chiTiets: [],
    };
    this.selectedExamination = null;
    this.searchExaminationQuery = '';
    this.filteredExaminations = [];
    this.totalAmount = 0;
    this.resetPrescriptionItemInput();
  }
}
