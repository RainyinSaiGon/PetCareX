import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import {
  GiayKhamBenhTongQuat,
  GiayKhamBenhChuyenKhoa,
  ToaThuoc,
  DichVuYTe,
  Vaccine,
  GiayTiemPhong,
  PhieuDangKyTiemPhong,
  DanhGiaYTe,
  LichSuBenhAn,
  CreateKhamTongQuatDto,
  CreateKhamChuyenKhoaDto,
  CreateToaThuocDto,
  CreateGiayTiemPhongDto,
  CreatePhieuDangKyDto,
} from '../models/y-te.model';

@Injectable({
  providedIn: 'root',
})
export class YTeService {
  private endpoint = 'y-te';

  constructor(private api: ApiService) {}

  // ========================
  // MEDICAL HISTORY
  // ========================
  getLichSuBenhAn(maThuCung: number): Observable<LichSuBenhAn> {
    return this.api.get<LichSuBenhAn>(`${this.endpoint}/lich-su/${maThuCung}`);
  }

  // ========================
  // GENERAL EXAMINATION
  // ========================
  createKhamTongQuat(dto: CreateKhamTongQuatDto): Observable<GiayKhamBenhTongQuat> {
    return this.api.post<GiayKhamBenhTongQuat>(`${this.endpoint}/kham-tong-quat`, dto);
  }

  getKhamTongQuat(maGiayKhamTongQuat: number): Observable<GiayKhamBenhTongQuat> {
    return this.api.get<GiayKhamBenhTongQuat>(`${this.endpoint}/kham-tong-quat/${maGiayKhamTongQuat}`);
  }

  getKhamBenhTongQuats(params?: Record<string, unknown>): Observable<{ data: GiayKhamBenhTongQuat[]; total: number }> {
    return this.api.get<{ data: GiayKhamBenhTongQuat[]; total: number }>(`${this.endpoint}/kham-tong-quat`, params);
  }

  getAllKhamTongQuat(): Observable<GiayKhamBenhTongQuat[]> {
    return this.api.get<GiayKhamBenhTongQuat[]>(`${this.endpoint}/kham-tong-quat`);
  }

  // ========================
  // SPECIALIST EXAMINATION
  // ========================
  createKhamChuyenKhoa(dto: CreateKhamChuyenKhoaDto): Observable<GiayKhamBenhChuyenKhoa> {
    return this.api.post<GiayKhamBenhChuyenKhoa>(`${this.endpoint}/kham-chuyen-khoa`, dto);
  }

  getKhamChuyenKhoa(maGiayKhamChuyenKhoa: number): Observable<GiayKhamBenhChuyenKhoa> {
    return this.api.get<GiayKhamBenhChuyenKhoa>(`${this.endpoint}/kham-chuyen-khoa/${maGiayKhamChuyenKhoa}`);
  }

  // ========================
  // PRESCRIPTIONS
  // ========================
  createToaThuoc(dto: CreateToaThuocDto): Observable<ToaThuoc> {
    return this.api.post<ToaThuoc>(`${this.endpoint}/toa-thuoc`, dto);
  }

  getToaThuoc(soToaThuoc: string): Observable<ToaThuoc> {
    return this.api.get<ToaThuoc>(`${this.endpoint}/toa-thuoc/${soToaThuoc}`);
  }

  // ========================
  // VACCINATION REGISTRATION
  // ========================
  createPhieuDangKy(dto: CreatePhieuDangKyDto): Observable<PhieuDangKyTiemPhong> {
    return this.api.post<PhieuDangKyTiemPhong>(`${this.endpoint}/phieu-dang-ky`, dto);
  }

  getPhieuDangKy(maDangKy: number): Observable<PhieuDangKyTiemPhong> {
    return this.api.get<PhieuDangKyTiemPhong>(`${this.endpoint}/phieu-dang-ky/${maDangKy}`);
  }

  getAllPhieuDangKy(): Observable<PhieuDangKyTiemPhong[]> {
    return this.api.get<PhieuDangKyTiemPhong[]>(`${this.endpoint}/phieu-dang-ky`);
  }

  // ========================
  // VACCINATION RECORDS
  // ========================
  createGiayTiemPhong(dto: CreateGiayTiemPhongDto): Observable<GiayTiemPhong> {
    return this.api.post<GiayTiemPhong>(`${this.endpoint}/giay-tiem-phong`, dto);
  }

  getGiayTiemPhongByKhamTongQuat(maGiayKhamTongQuat: number): Observable<GiayTiemPhong[]> {
    return this.api.get<GiayTiemPhong[]>(`${this.endpoint}/giay-tiem-phong/kham-tong-quat/${maGiayKhamTongQuat}`);
  }

  getTiemPhongs(params?: Record<string, unknown>): Observable<{ data: GiayTiemPhong[]; total: number }> {
    return this.api.get<{ data: GiayTiemPhong[]; total: number }>(`${this.endpoint}/giay-tiem-phong`, params);
  }

  getAllTiemPhong(): Observable<GiayTiemPhong[]> {
    return this.api.get<GiayTiemPhong[]>(`${this.endpoint}/giay-tiem-phong`);
  }

  // ========================
  // MEDICAL SERVICES
  // ========================
  getAllDichVuYTe(): Observable<DichVuYTe[]> {
    return this.api.get<DichVuYTe[]>(`${this.endpoint}/dich-vu`);
  }

  getDichVuYTeByLoai(loaiDichVu: string): Observable<DichVuYTe[]> {
    return this.api.get<DichVuYTe[]>(`${this.endpoint}/dich-vu/loai/${loaiDichVu}`);
  }

  // ========================
  // VACCINES
  // ========================
  getAllVaccines(): Observable<Vaccine[]> {
    return this.api.get<Vaccine[]>(`${this.endpoint}/vaccine`);
  }

  getVaccinesByLoai(loaiVaccine: string): Observable<Vaccine[]> {
    return this.api.get<Vaccine[]>(`${this.endpoint}/vaccine/loai/${loaiVaccine}`);
  }

  // ========================
  // REVIEWS
  // ========================
  createDanhGia(data: Partial<DanhGiaYTe>): Observable<DanhGiaYTe> {
    return this.api.post<DanhGiaYTe>(`${this.endpoint}/danh-gia`, data);
  }

  getDanhGiaByHoaDon(maHoaDon: number): Observable<DanhGiaYTe> {
    return this.api.get<DanhGiaYTe>(`${this.endpoint}/danh-gia/hoa-don/${maHoaDon}`);
  }

  getAllDanhGia(): Observable<DanhGiaYTe[]> {
    return this.api.get<DanhGiaYTe[]>(`${this.endpoint}/danh-gia`);
  }

  // ========================
  // STATISTICS
  // ========================
  // UPDATE & DELETE METHODS
  // ========================
  
  updateKhamTongQuat(maGiayKhamTongQuat: number, dto: Partial<CreateKhamTongQuatDto>): Observable<GiayKhamBenhTongQuat> {
    return this.api.patch<GiayKhamBenhTongQuat>(`${this.endpoint}/kham-tong-quat/${maGiayKhamTongQuat}`, dto);
  }

  deleteKhamTongQuat(maGiayKhamTongQuat: number): Observable<void> {
    return this.api.delete<void>(`${this.endpoint}/kham-tong-quat/${maGiayKhamTongQuat}`);
  }

  createTiemPhong(dto: Partial<CreateGiayTiemPhongDto>): Observable<GiayTiemPhong> {
    return this.api.post<GiayTiemPhong>(`${this.endpoint}/giay-tiem-phong`, dto);
  }

  updateTiemPhong(maGiayTiem: number, dto: Partial<CreateGiayTiemPhongDto>): Observable<GiayTiemPhong> {
    return this.api.patch<GiayTiemPhong>(`${this.endpoint}/giay-tiem-phong/${maGiayTiem}`, dto);
  }

  deleteTiemPhong(maGiayTiem: number): Observable<void> {
    return this.api.delete<void>(`${this.endpoint}/giay-tiem-phong/${maGiayTiem}`);
  }

  getAllToaThuoc(): Observable<ToaThuoc[]> {
    return this.api.get<ToaThuoc[]>(`${this.endpoint}/toa-thuoc`);
  }

  getAllPhieuDangKyTiemPhong(): Observable<PhieuDangKyTiemPhong[]> {
    return this.api.get<PhieuDangKyTiemPhong[]>(`${this.endpoint}/phieu-dang-ky`);
  }

  updatePhieuDangKyTiemPhong(maPhieu: number, dto: Partial<PhieuDangKyTiemPhong>): Observable<PhieuDangKyTiemPhong> {
    return this.api.patch<PhieuDangKyTiemPhong>(`${this.endpoint}/phieu-dang-ky/${maPhieu}`, dto);
  }

  // ========================
  // STATISTICS
  // ========================
  getStatistics(startDate?: string, endDate?: string): Observable<any> {
    let url = `${this.endpoint}/thong-ke`;
    if (startDate && endDate) {
      url += `?startDate=${startDate}&endDate=${endDate}`;
    }
    return this.api.get(url);
  }
}
