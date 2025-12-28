import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DoctorService {
  private apiUrl = 'http://localhost:3000/doctor';

  constructor(private http: HttpClient) { }

  /**
   * Search pet examination records
   */
  searchPetExaminations(searchParams: any): Observable<any> {
    let params = new HttpParams();
    if (searchParams.maThuCung) {
      params = params.set('maThuCung', searchParams.maThuCung);
    }
    if (searchParams.tenThuCung) {
      params = params.set('tenThuCung', searchParams.tenThuCung);
    }
    if (searchParams.maKhachHang) {
      params = params.set('maKhachHang', searchParams.maKhachHang);
    }
    if (searchParams.skip) {
      params = params.set('skip', searchParams.skip);
    }
    if (searchParams.take) {
      params = params.set('take', searchParams.take);
    }

    return this.http.get<any>(`${this.apiUrl}/examinations/search`, { params });
  }

  /**
   * Get examination history for a specific pet
   */
  getPetExaminationHistory(maThuCung: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/pets/${maThuCung}/examination-history`);
  }

  /**
   * Get full examination details including symptoms, diagnoses and prescriptions
   */
  getExaminationDetails(maGiayKhamTongQuat: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/examinations/${maGiayKhamTongQuat}`);
  }

  /**
   * Check if pet has existing medical record
   */
  checkPetMedicalRecord(maThuCung: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/pets/${maThuCung}/medical-record-status`);
  }

  /**
   * Create new examination record
   */
  createExamination(examinationData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/examinations`, examinationData);
  }

  /**
   * Update examination record
   */
  updateExamination(maGiayKhamTongQuat: number, updateData: any): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/examinations/${maGiayKhamTongQuat}`, updateData);
  }

  /**
   * Delete examination record
   */
  deleteExamination(maGiayKhamTongQuat: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/examinations/${maGiayKhamTongQuat}`);
  }

  /**
   * Search medicines
   */
  searchMedicines(searchParams: any): Observable<any> {
    let params = new HttpParams();
    if (searchParams.tenSanPham) {
      params = params.set('tenSanPham', searchParams.tenSanPham);
    }
    if (searchParams.skip) {
      params = params.set('skip', searchParams.skip);
    }
    if (searchParams.take) {
      params = params.set('take', searchParams.take);
    }

    return this.http.get<any>(`${this.apiUrl}/medicines/search`, { params });
  }

  /**
   * Get all medicines
   */
  getAllMedicines(skip: number = 0, take: number = 10): Observable<any> {
    const params = new HttpParams()
      .set('skip', skip.toString())
      .set('take', take.toString());
    return this.http.get<any>(`${this.apiUrl}/medicines`, { params });
  }

  /**
   * Create new prescription
   */
  createPrescription(prescriptionData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/prescriptions`, prescriptionData);
  }

  /**
   * Get prescription details
   */
  getPrescriptionDetails(maToaThuoc: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/prescriptions/${maToaThuoc}`);
  }

  /**
   * Get prescriptions for a pet
   */
  getPrescriptionsForPet(maThuCung: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/pets/${maThuCung}/prescriptions`);
  }
}
