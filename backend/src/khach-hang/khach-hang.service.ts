import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { KhachHang } from '../entities/khach-hang.entity';
import { KhachHangThanhVien } from '../entities/khach-hang-thanh-vien.entity';
import { HangThanhVien } from '../entities/hang-thanh-vien.entity';
import { ThuCung } from '../entities/thu-cung.entity';
import { CreateKhachHangDto, UpdateKhachHangDto, CreateThuCungDto, UpdateThuCungDto } from './dto/khach-hang.dto';

@Injectable()
export class KhachHangService {
  constructor(
    @InjectRepository(KhachHang)
    private khachHangRepo: Repository<KhachHang>,
    @InjectRepository(KhachHangThanhVien)
    private thanhVienRepo: Repository<KhachHangThanhVien>,
    @InjectRepository(HangThanhVien)
    private hangThanhVienRepo: Repository<HangThanhVien>,
    @InjectRepository(ThuCung)
    private thuCungRepo: Repository<ThuCung>,
  ) {}

  // FS-01: Quản lý thông tin khách hàng
  async findAll(query?: { search?: string }) {
    if (query?.search) {
      return this.khachHangRepo.find({
        where: [
          { hoTen: Like(`%${query.search}%`) },
          { soDienThoai: Like(`%${query.search}%`) },
        ],
        relations: ['thanhVien'],
        order: { maKhachHang: 'ASC' },
      });
    }

    return this.khachHangRepo.find({
      relations: ['thanhVien'],
      order: { maKhachHang: 'ASC' },
    });
  }

  async findOne(maKhachHang: number) {
    const khachHang = await this.khachHangRepo.findOne({
      where: { maKhachHang },
      relations: ['thanhVien', 'thanhVien.hangThanhVien', 'thuCungs'],
    });
    if (!khachHang) {
      throw new NotFoundException(`Không tìm thấy khách hàng với mã ${maKhachHang}`);
    }
    return khachHang;
  }

  async create(dto: CreateKhachHangDto) {
    const khachHang = this.khachHangRepo.create({
      hoTen: dto.hoTen,
      soDienThoai: dto.sdt,
    });
    return this.khachHangRepo.save(khachHang);
  }

  async update(maKhachHang: number, dto: UpdateKhachHangDto) {
    const khachHang = await this.findOne(maKhachHang);
    if (dto.hoTen) khachHang.hoTen = dto.hoTen;
    if (dto.sdt) khachHang.soDienThoai = dto.sdt;
    return this.khachHangRepo.save(khachHang);
  }

  async remove(maKhachHang: number) {
    const khachHang = await this.findOne(maKhachHang);
    return this.khachHangRepo.remove(khachHang);
  }

  // FQ-05 & FC-03: Quản lý hạng thành viên
  async registerMembership(maKhachHang: number, data: { email?: string; gioiTinh?: string; ngaySinh?: Date; cccd?: string; diaChi?: string }) {
    // Check if already a member
    const existingMember = await this.thanhVienRepo.findOne({ where: { maKhachHang } });
    if (existingMember) {
      throw new BadRequestException('Khách hàng đã là thành viên');
    }

    // Get default membership tier
    const defaultHang = await this.hangThanhVienRepo.findOne({
      order: { giamGia: 'ASC' },
    });

    const thanhVien = this.thanhVienRepo.create({
      maKhachHang,
      email: data.email,
      gioiTinh: data.gioiTinh,
      ngaySinh: data.ngaySinh,
      cccd: data.cccd,
      diaChi: data.diaChi,
      tongChiTieu: 0,
      tenHang: defaultHang?.tenHang,
    });

    return this.thanhVienRepo.save(thanhVien);
  }

  async getMembershipInfo(maKhachHang: number) {
    const thanhVien = await this.thanhVienRepo.findOne({
      where: { maKhachHang },
      relations: ['hangThanhVien', 'khachHang'],
    });
    if (!thanhVien) {
      throw new NotFoundException('Khách hàng không phải là thành viên');
    }
    return thanhVien;
  }

  // FS-02: Quản lý thú cưng
  async getThuCungs(maKhachHang: number) {
    return this.thuCungRepo.find({
      where: { maKhachHang },
      relations: ['chungLoai'],
      order: { maThuCung: 'ASC' },
    });
  }

  async getThuCung(maThuCung: number) {
    const thuCung = await this.thuCungRepo.findOne({
      where: { maThuCung },
      relations: ['chungLoai', 'khachHang'],
    });
    if (!thuCung) {
      throw new NotFoundException(`Không tìm thấy thú cưng với mã ${maThuCung}`);
    }
    return thuCung;
  }

  async createThuCung(dto: CreateThuCungDto) {
    const thuCung = this.thuCungRepo.create({
      maKhachHang: dto.maKhachHang ? Number(dto.maKhachHang) : undefined,
      tenThuCung: dto.tenThuCung,
      ngaySinhThuCung: dto.ngaySinh ? new Date(dto.ngaySinh) : undefined,
      maChungLoai: dto.maLoai,
    });
    return this.thuCungRepo.save(thuCung);
  }

  async updateThuCung(maThuCung: number, dto: UpdateThuCungDto) {
    const thuCung = await this.getThuCung(maThuCung);
    if (dto.tenThuCung) thuCung.tenThuCung = dto.tenThuCung;
    if (dto.ngaySinh) thuCung.ngaySinhThuCung = new Date(dto.ngaySinh);
    if (dto.maLoai) thuCung.maChungLoai = dto.maLoai;
    return this.thuCungRepo.save(thuCung);
  }

  async removeThuCung(maThuCung: number) {
    const thuCung = await this.getThuCung(maThuCung);
    return this.thuCungRepo.remove(thuCung);
  }

  // FC-02: Theo dõi hồ sơ bệnh án
  async getPetMedicalHistory(maThuCung: number) {
    const thuCung = await this.thuCungRepo.findOne({
      where: { maThuCung },
      relations: ['khachHang', 'loaiThuCung'],
    });
    if (!thuCung) {
      throw new NotFoundException(`Không tìm thấy thú cưng với mã ${maThuCung}`);
    }
    return thuCung;
  }

  // Statistics for Admin dashboard
  async getKhachHangStatistics() {
    const totalCustomers = await this.khachHangRepo.count();
    const totalMembers = await this.thanhVienRepo.count();
    
    const membersByTier = await this.thanhVienRepo
      .createQueryBuilder('tv')
      .select('tv.TenHang', 'tenHang')
      .addSelect('COUNT(*)', 'soLuong')
      .groupBy('tv.TenHang')
      .getRawMany();

    const topSpenders = await this.thanhVienRepo.find({
      relations: ['khachHang', 'hangThanhVien'],
      order: { tongChiTieu: 'DESC' },
      take: 10,
    });

    return {
      totalCustomers,
      totalMembers,
      membersByTier,
      topSpenders,
    };
  }
}
