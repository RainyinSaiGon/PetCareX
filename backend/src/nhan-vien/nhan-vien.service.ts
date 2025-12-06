import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { NhanVien } from '../entities/nhan-vien.entity';
import { ChiNhanh } from '../entities/chi-nhanh.entity';
import { LichLamViecBacSi } from '../entities/lich-lam-viec-bac-si.entity';
import { CreateNhanVienDto, UpdateNhanVienDto } from './dto/nhan-vien.dto';

@Injectable()
export class NhanVienService {
  constructor(
    @InjectRepository(NhanVien)
    private nhanVienRepo: Repository<NhanVien>,
    @InjectRepository(ChiNhanh)
    private chiNhanhRepo: Repository<ChiNhanh>,
    @InjectRepository(LichLamViecBacSi)
    private lichLamViecRepo: Repository<LichLamViecBacSi>,
  ) {}

  // FQ-01: Quản lý nhân sự toàn hệ thống
  async findAll(query?: { maChiNhanh?: string; loaiNhanVien?: string; search?: string }) {
    const where: any = {};
    
    if (query?.maChiNhanh) {
      where.maChiNhanh = query.maChiNhanh;
    }
    if (query?.loaiNhanVien) {
      where.loaiNhanVien = query.loaiNhanVien;
    }
    if (query?.search) {
      where.hoTen = Like(`%${query.search}%`);
    }

    return this.nhanVienRepo.find({
      where,
      relations: ['chiNhanh', 'khoa', 'loaiNhanVienLuong'],
      order: { maNhanVien: 'ASC' },
    });
  }

  async findOne(maNhanVien: string) {
    const nhanVien = await this.nhanVienRepo.findOne({
      where: { maNhanVien },
      relations: ['chiNhanh', 'khoa', 'loaiNhanVienLuong'],
    });
    if (!nhanVien) {
      throw new NotFoundException(`Không tìm thấy nhân viên với mã ${maNhanVien}`);
    }
    return nhanVien;
  }

  async create(dto: CreateNhanVienDto) {
    const existing = await this.nhanVienRepo.findOne({ where: { maNhanVien: dto.maNhanVien } });
    if (existing) {
      throw new BadRequestException(`Mã nhân viên ${dto.maNhanVien} đã tồn tại`);
    }
    
    const nhanVien = this.nhanVienRepo.create(dto);
    return this.nhanVienRepo.save(nhanVien);
  }

  async update(maNhanVien: string, dto: UpdateNhanVienDto) {
    const nhanVien = await this.findOne(maNhanVien);
    Object.assign(nhanVien, dto);
    return this.nhanVienRepo.save(nhanVien);
  }

  async remove(maNhanVien: string) {
    const nhanVien = await this.findOne(maNhanVien);
    // Soft delete: set NgayNghiLam
    nhanVien.ngayNghiLam = new Date();
    return this.nhanVienRepo.save(nhanVien);
  }

  // FB-01: Quản lý nhân viên chi nhánh
  async findByChiNhanh(maChiNhanh: string) {
    return this.nhanVienRepo.find({
      where: { maChiNhanh },
      relations: ['loaiNhanVienLuong', 'khoa'],
    });
  }

  // FV-04: Quản lý lịch làm việc bác sĩ
  async getLichLamViec(maBacSi: string, startDate?: Date, endDate?: Date) {
    const query = this.lichLamViecRepo.createQueryBuilder('lich')
      .leftJoinAndSelect('lich.chiNhanh', 'chiNhanh')
      .where('lich.maBacSi = :maBacSi', { maBacSi });

    if (startDate && endDate) {
      query.andWhere('lich.ngay BETWEEN :startDate AND :endDate', { startDate, endDate });
    }

    return query.orderBy('lich.ngay', 'ASC').getMany();
  }

  async createLichLamViec(data: { maBacSi: string; maChiNhanh: string; ngay: Date; trangThai?: string }) {
    const lichLamViec = this.lichLamViecRepo.create(data);
    return this.lichLamViecRepo.save(lichLamViec);
  }

  // FB-05: Báo cáo hiệu suất nhân viên
  async getHieuSuatNhanVien(maChiNhanh: string, startDate: Date, endDate: Date) {
    const result = await this.nhanVienRepo.query(`
      SELECT 
        nv.MaNhanVien,
        nv.HoTen,
        nv.LoaiNhanVien,
        COUNT(DISTINCT hd.MaHoaDon) as SoHoaDon,
        SUM(hd.TongTien) as TongDoanhThu,
        AVG(CAST(dg.MucDoHaiLong as FLOAT)) as DiemHaiLongTrungBinh
      FROM NHANVIEN nv
      LEFT JOIN HOADON hd ON nv.MaNhanVien = hd.MaNhanVien 
        AND hd.NgayLap BETWEEN @0 AND @1
      LEFT JOIN DANHGIAYTE dg ON hd.MaHoaDon = dg.MaHoaDon
      WHERE nv.MaChiNhanh = @2
      GROUP BY nv.MaNhanVien, nv.HoTen, nv.LoaiNhanVien
      ORDER BY TongDoanhThu DESC
    `, [startDate, endDate, maChiNhanh]);
    
    return result;
  }

  // Get all doctors (Bác sĩ)
  async findAllDoctors() {
    return this.nhanVienRepo.find({
      where: { loaiNhanVien: 'Bác sĩ' },
      relations: ['chiNhanh'],
    });
  }

  // Get available doctors for appointment
  async getAvailableDoctors(ngay: Date, maChiNhanh: string) {
    return this.lichLamViecRepo.find({
      where: {
        ngay,
        maChiNhanh,
        trangThai: 'Làm',
      },
      relations: ['bacSi'],
    });
  }
}
