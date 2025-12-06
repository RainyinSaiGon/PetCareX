import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { GiayKhamBenhTongQuat } from '../entities/giay-kham-benh-tong-quat.entity';
import { GiayKhamBenhChuyenKhoa } from '../entities/giay-kham-benh-chuyen-khoa.entity';
import { ToaThuoc } from '../entities/toa-thuoc.entity';
import { CtToaThuoc } from '../entities/ct-toa-thuoc.entity';
import { GiayTiemPhong } from '../entities/giay-tiem-phong.entity';
import { PhieuDangKyTiemPhong } from '../entities/phieu-dang-ky-tiem-phong.entity';
import { PhieuDangKyGoi } from '../entities/phieu-dang-ky-goi.entity';
import { PhieuDangKyLe } from '../entities/phieu-dang-ky-le.entity';
import { DichVuYTe } from '../entities/dich-vu-y-te.entity';
import { Vaccine } from '../entities/vaccine.entity';
import { KhoVaccine } from '../entities/kho-vaccine.entity';
import { DanhGiaYTe } from '../entities/danh-gia-y-te.entity';
import {
  CreateKhamBenhTongQuatDto,
  CreateKhamBenhChuyenKhoaDto,
  CreateToaThuocDto,
  CreateGiayTiemPhongDto,
  CreatePhieuDangKyTiemPhongDto,
  CreateDanhGiaYTeDto,
} from './dto/y-te.dto';

@Injectable()
export class YTeService {
  constructor(
    @InjectRepository(GiayKhamBenhTongQuat)
    private khamTongQuatRepo: Repository<GiayKhamBenhTongQuat>,
    @InjectRepository(GiayKhamBenhChuyenKhoa)
    private khamChuyenKhoaRepo: Repository<GiayKhamBenhChuyenKhoa>,
    @InjectRepository(ToaThuoc)
    private toaThuocRepo: Repository<ToaThuoc>,
    @InjectRepository(CtToaThuoc)
    private ctToaThuocRepo: Repository<CtToaThuoc>,
    @InjectRepository(GiayTiemPhong)
    private giayTiemPhongRepo: Repository<GiayTiemPhong>,
    @InjectRepository(PhieuDangKyTiemPhong)
    private phieuDangKyRepo: Repository<PhieuDangKyTiemPhong>,
    @InjectRepository(PhieuDangKyGoi)
    private phieuGoiRepo: Repository<PhieuDangKyGoi>,
    @InjectRepository(PhieuDangKyLe)
    private phieuLeRepo: Repository<PhieuDangKyLe>,
    @InjectRepository(DichVuYTe)
    private dichVuYTeRepo: Repository<DichVuYTe>,
    @InjectRepository(Vaccine)
    private vaccineRepo: Repository<Vaccine>,
    @InjectRepository(KhoVaccine)
    private khoVaccineRepo: Repository<KhoVaccine>,
    @InjectRepository(DanhGiaYTe)
    private danhGiaRepo: Repository<DanhGiaYTe>,
  ) {}

  // ========================
  // PROCESS 1: KHÁM BỆNH
  // ========================

  // FV-01: Tra cứu lịch sử bệnh án
  async getLichSuBenhAn(maThuCung: number) {
    // ToaThuoc uses string for maThuCung, so convert it
    const maThuCungStr = String(maThuCung);
    
    const [tongQuat, chuyenKhoa, toaThuocs] = await Promise.all([
      this.khamTongQuatRepo.find({
        where: { maThuCung },
        relations: ['thuCung', 'phieuDangKy'],
      }),
      this.khamChuyenKhoaRepo.find({
        where: { maThuCung },
        relations: ['bacSi', 'thuCung', 'dichVu'],
        order: { ngayKham: 'DESC' },
      }),
      this.toaThuocRepo.find({
        where: { maThuCung: maThuCungStr },
        relations: ['bacSi', 'thuCung'],
        order: { ngayKeDon: 'DESC' },
      }),
    ]);

    return {
      khamTongQuat: tongQuat,
      khamChuyenKhoa: chuyenKhoa,
      toaThuocs: toaThuocs,
    };
  }

  // FV-02: Khám bệnh tổng quát
  async createKhamTongQuat(dto: CreateKhamBenhTongQuatDto) {
    const giayKham = this.khamTongQuatRepo.create({
      nhietDo: dto.nhietDo,
      moTa: dto.moTa,
      maThuCung: dto.maThuCung,
      maPhieuDangKyTiemPhong: dto.maPhieuDangKyTiemPhong,
    });
    return this.khamTongQuatRepo.save(giayKham);
  }

  async getKhamTongQuat(maGiayKhamTongQuat: number) {
    const giayKham = await this.khamTongQuatRepo.findOne({
      where: { maGiayKhamTongQuat },
      relations: ['thuCung', 'phieuDangKy'],
    });
    if (!giayKham) {
      throw new NotFoundException('Không tìm thấy giấy khám bệnh tổng quát');
    }
    return giayKham;
  }

  // FV-02: Khám bệnh chuyên khoa (sau khi có kết quả khám tổng quát)
  async createKhamChuyenKhoa(dto: CreateKhamBenhChuyenKhoaDto) {
    const giayKham = this.khamChuyenKhoaRepo.create({
      ngayKham: dto.ngayKham ? new Date(dto.ngayKham) : new Date(),
      ngayTaiKham: dto.ngayTaiKham ? new Date(dto.ngayTaiKham) : undefined,
      maBacSi: dto.maBacSi,
      maThuCung: dto.maThuCung,
      maDichVu: dto.maDichVu,
    });
    return this.khamChuyenKhoaRepo.save(giayKham);
  }

  async getKhamChuyenKhoa(maGiayKhamChuyenKhoa: number) {
    const giayKham = await this.khamChuyenKhoaRepo.findOne({
      where: { maGiayKhamChuyenKhoa },
      relations: ['thuCung', 'bacSi', 'dichVu'],
    });
    if (!giayKham) {
      throw new NotFoundException('Không tìm thấy giấy khám bệnh chuyên khoa');
    }
    return giayKham;
  }

  // FV-03: Kê đơn thuốc
  async createToaThuoc(dto: CreateToaThuocDto) {
    const toaThuoc = this.toaThuocRepo.create({
      soToaThuoc: dto.soToaThuoc,
      maThuCung: dto.maThuCung,
      maBacSi: dto.maBacSi,
      ngayKeDon: dto.ngayKeDon ? new Date(dto.ngayKeDon) : new Date(),
      ghiChu: dto.ghiChu,
    });
    
    const savedToa = await this.toaThuocRepo.save(toaThuoc);

    // Add prescription details
    if (dto.chiTiet && dto.chiTiet.length > 0) {
      const chiTietEntities = dto.chiTiet.map(ct => 
        this.ctToaThuocRepo.create({
          soToaThuoc: savedToa.soToaThuoc,
          maThuoc: ct.maThuoc,
          soLuong: ct.soLuong,
          lieuDung: ct.lieuDung,
        })
      );
      await this.ctToaThuocRepo.save(chiTietEntities);
    }

    return this.getToaThuoc(savedToa.soToaThuoc);
  }

  async getToaThuoc(soToaThuoc: string) {
    const toaThuoc = await this.toaThuocRepo.findOne({
      where: { soToaThuoc },
      relations: ['thuCung', 'bacSi'],
    });
    if (!toaThuoc) {
      throw new NotFoundException('Không tìm thấy toa thuốc');
    }
    return toaThuoc;
  }

  // ========================
  // PROCESS 2: TIÊM PHÒNG
  // ========================

  // Đăng ký tiêm phòng
  async createPhieuDangKy(dto: CreatePhieuDangKyTiemPhongDto) {
    const phieu = this.phieuDangKyRepo.create({
      maKhachHang: dto.maKhachHang,
      maThuCung: dto.maThuCung,
      maDichVu: dto.maDichVu,
      ngayDangKy: new Date(),
    });
    return this.phieuDangKyRepo.save(phieu);
    // Note: PhieuDangKyGoi and PhieuDangKyLe need to be created separately
    // if the sub-registration feature is needed
  }

  async getPhieuDangKy(maDangKy: number) {
    const phieu = await this.phieuDangKyRepo.findOne({
      where: { maDangKy },
      relations: ['thuCung', 'khachHang', 'dichVu'],
    });
    if (!phieu) {
      throw new NotFoundException('Không tìm thấy phiếu đăng ký tiêm phòng');
    }
    return phieu;
  }

  async getAllPhieuDangKy() {
    return this.phieuDangKyRepo.find({
      relations: ['thuCung', 'khachHang', 'dichVu'],
      order: { ngayDangKy: 'DESC' },
    });
  }

  // Thực hiện tiêm phòng - ghi giấy tiêm phòng
  async createGiayTiemPhong(dto: CreateGiayTiemPhongDto) {
    // Check vaccine availability (KhoVaccine uses maKho not maChiNhanh)
    const khoVaccine = await this.khoVaccineRepo.findOne({
      where: { maVaccine: dto.maVaccine, maKho: dto.maKho },
    });

    if (!khoVaccine || khoVaccine.soLuong < 1) {
      throw new BadRequestException('Vaccine không đủ số lượng trong kho');
    }

    // Create vaccination record
    const giayTiemPhong = this.giayTiemPhongRepo.create({
      maVaccine: dto.maVaccine,
      maBacSi: dto.maBacSi,
      lieuLuong: dto.lieuLuong,
      ngayTiem: dto.ngayTiem ? new Date(dto.ngayTiem) : new Date(),
      maGiayKhamTongQuat: dto.maGiayKhamTongQuat,
    });
    const savedGiay = await this.giayTiemPhongRepo.save(giayTiemPhong);

    // Deduct vaccine from inventory
    khoVaccine.soLuong -= 1;
    await this.khoVaccineRepo.save(khoVaccine);

    return savedGiay;
  }

  // Get vaccination records by general exam certificate
  async getGiayTiemPhongByKhamTongQuat(maGiayKhamTongQuat: number) {
    return this.giayTiemPhongRepo.find({
      where: { maGiayKhamTongQuat },
      relations: ['vaccine', 'bacSi'],
      order: { ngayTiem: 'DESC' },
    });
  }

  // ========================
  // DỊCH VỤ Y TẾ
  // ========================

  async getAllDichVuYTe() {
    return this.dichVuYTeRepo.find({
      order: { maDichVu: 'ASC' },
    });
  }

  async getDichVuYTeByLoai(loaiDichVu: string) {
    return this.dichVuYTeRepo.find({
      where: { loaiDichVu },
      order: { maDichVu: 'ASC' },
    });
  }

  // ========================
  // VACCINE
  // ========================

  async getAllVaccines() {
    return this.vaccineRepo.find({
      order: { maVaccine: 'ASC' },
    });
  }

  async getVaccinesByLoai(loaiVaccine: string) {
    return this.vaccineRepo.find({
      where: { loaiVaccine },
      order: { maVaccine: 'ASC' },
    });
  }

  // ========================
  // ĐÁNH GIÁ
  // ========================

  // FC-05: Đánh giá dịch vụ y tế
  async createDanhGia(dto: CreateDanhGiaYTeDto) {
    const danhGia = this.danhGiaRepo.create({
      binhLuan: dto.binhLuan,
      mucDoHaiLong: dto.mucDoHaiLong,
      thaiDoNhanVien: dto.thaiDoNhanVien,
      diemChatLuongDichVu: dto.diemChatLuongDichVu,
      maHoaDon: dto.maHoaDon,
    });
    return this.danhGiaRepo.save(danhGia);
  }

  async getDanhGiaByHoaDon(maHoaDon: number) {
    return this.danhGiaRepo.findOne({
      where: { maHoaDon },
      relations: ['hoaDon'],
    });
  }

  async getAllDanhGiaYTe() {
    return this.danhGiaRepo.find({
      relations: ['hoaDon'],
      order: { maDanhGia: 'DESC' },
    });
  }

  // ========================
  // STATISTICS
  // ========================

  async getYTeStatistics(startDate?: Date, endDate?: Date) {
    const start = startDate || new Date(new Date().setMonth(new Date().getMonth() - 1));
    const end = endDate || new Date();

    const [chuyenKhoaCount, tiemPhongCount] = await Promise.all([
      this.khamChuyenKhoaRepo.count({
        where: { ngayKham: Between(start, end) },
      }),
      this.giayTiemPhongRepo.count({
        where: { ngayTiem: Between(start, end) },
      }),
    ]);

    // Count total general exams (no date filter since GiayKhamBenhTongQuat has no date field)
    const tongQuatCount = await this.khamTongQuatRepo.count();

    return {
      khamTongQuat: tongQuatCount,
      khamChuyenKhoa: chuyenKhoaCount,
      tiemPhong: tiemPhongCount,
      total: tongQuatCount + chuyenKhoaCount + tiemPhongCount,
    };
  }
}
