import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { KhachHang } from '../../entities/khach-hang.entity';
import { ThuCung } from '../../entities/thu-cung.entity';
import { ChungLoaiThuCung } from '../../entities/chung-loai-thu-cung.entity';
import { CreateKhachHangDto } from './dto/create-khach-hang.dto';
import { UpdateKhachHangDto } from './dto/update-khach-hang.dto';
import { CreateThuCungDto } from './dto/create-thu-cung.dto';
import { UpdateThuCungDto } from './dto/update-thu-cung.dto';

@Injectable()
export class CustomerService {
  constructor(
    @InjectRepository(KhachHang)
    private khachHangRepository: Repository<KhachHang>,
    @InjectRepository(ThuCung)
    private thuCungRepository: Repository<ThuCung>,
    @InjectRepository(ChungLoaiThuCung)
    private chungLoaiRepository: Repository<ChungLoaiThuCung>,
  ) {}

  // ==================== KHÁCH HÀNG CRUD ====================

  async createKhachHang(createDto: CreateKhachHangDto): Promise<KhachHang> {
    // Check if phone number already exists
    const existing = await this.khachHangRepository.findOne({
      where: { SoDienThoai: createDto.SoDienThoai },
    });

    if (existing) {
      throw new ConflictException('Số điện thoại đã được đăng ký');
    }

    const khachHang = this.khachHangRepository.create(createDto);
    return await this.khachHangRepository.save(khachHang);
  }

  async findAllKhachHang(page: number = 1, limit: number = 10): Promise<{ data: KhachHang[]; total: number; page: number; limit: number }> {
    const [data, total] = await this.khachHangRepository.findAndCount({
      relations: ['ThuCungs', 'ThanhVien'],
      skip: (page - 1) * limit,
      take: limit,
      order: { MaKhachHang: 'DESC' },
    });

    return { data, total, page, limit };
  }

  async findOneKhachHang(id: number): Promise<KhachHang> {
    const khachHang = await this.khachHangRepository.findOne({
      where: { MaKhachHang: id },
      relations: ['ThuCungs', 'ThuCungs.ChungLoai', 'ThuCungs.ChungLoai.LoaiThuCung', 'ThanhVien', 'ThanhVien.Hang'],
    });

    if (!khachHang) {
      throw new NotFoundException(`Không tìm thấy khách hàng với mã ${id}`);
    }

    return khachHang;
  }

  async findKhachHangByPhone(phone: string): Promise<KhachHang> {
    const khachHang = await this.khachHangRepository.findOne({
      where: { SoDienThoai: phone },
      relations: ['ThuCungs', 'ThanhVien'],
    });

    if (!khachHang) {
      throw new NotFoundException(`Không tìm thấy khách hàng với số điện thoại ${phone}`);
    }

    return khachHang;
  }

  async updateKhachHang(id: number, updateDto: UpdateKhachHangDto): Promise<KhachHang> {
    const khachHang = await this.findOneKhachHang(id);

    // If updating phone number, check for duplicates
    if (updateDto.SoDienThoai && updateDto.SoDienThoai !== khachHang.SoDienThoai) {
      const existing = await this.khachHangRepository.findOne({
        where: { SoDienThoai: updateDto.SoDienThoai },
      });

      if (existing) {
        throw new ConflictException('Số điện thoại đã được sử dụng bởi khách hàng khác');
      }
    }

    Object.assign(khachHang, updateDto);
    return await this.khachHangRepository.save(khachHang);
  }

  async deleteKhachHang(id: number): Promise<void> {
    const khachHang = await this.findOneKhachHang(id);

    // Check if customer has pets
    if (khachHang.ThuCungs && khachHang.ThuCungs.length > 0) {
      throw new BadRequestException('Không thể xóa khách hàng có thú cưng. Vui lòng xóa thú cưng trước.');
    }

    await this.khachHangRepository.remove(khachHang);
  }

  // ==================== THÚ CƯNG CRUD ====================

  async createThuCung(createDto: CreateThuCungDto): Promise<ThuCung> {
    // Validate customer exists
    const khachHang = await this.khachHangRepository.findOne({
      where: { MaKhachHang: createDto.MaKhachHang },
    });

    if (!khachHang) {
      throw new NotFoundException(`Không tìm thấy khách hàng với mã ${createDto.MaKhachHang}`);
    }

    // Validate breed exists
    const chungLoai = await this.chungLoaiRepository.findOne({
      where: { MaChungLoaiThuCung: createDto.MaChungLoai },
    });

    if (!chungLoai) {
      throw new NotFoundException(`Không tìm thấy chủng loại thú cưng với mã ${createDto.MaChungLoai}`);
    }

    const thuCung = this.thuCungRepository.create(createDto);
    return await this.thuCungRepository.save(thuCung);
  }

  async findAllThuCung(page: number = 1, limit: number = 10, maKhachHang?: number): Promise<{ data: ThuCung[]; total: number; page: number; limit: number }> {
    const queryBuilder = this.thuCungRepository
      .createQueryBuilder('thuCung')
      .leftJoinAndSelect('thuCung.KhachHang', 'khachHang')
      .leftJoinAndSelect('thuCung.ChungLoai', 'chungLoai')
      .leftJoinAndSelect('chungLoai.LoaiThuCung', 'loaiThuCung')
      .orderBy('thuCung.MaThuCung', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (maKhachHang) {
      queryBuilder.where('thuCung.MaKhachHang = :maKhachHang', { maKhachHang });
    }

    const [data, total] = await queryBuilder.getManyAndCount();

    return { data, total, page, limit };
  }

  async findOneThuCung(id: number): Promise<ThuCung> {
    const thuCung = await this.thuCungRepository.findOne({
      where: { MaThuCung: id },
      relations: [
        'KhachHang',
        'ChungLoai',
        'ChungLoai.LoaiThuCung',
        'GiayKhamTongQuats',
        'GiayKhamChuyenKhoas',
        'ToaThuocs',
      ],
    });

    if (!thuCung) {
      throw new NotFoundException(`Không tìm thấy thú cưng với mã ${id}`);
    }

    return thuCung;
  }

  async updateThuCung(id: number, updateDto: UpdateThuCungDto): Promise<ThuCung> {
    const thuCung = await this.findOneThuCung(id);

    // Validate breed if updating
    if (updateDto.MaChungLoai) {
      const chungLoai = await this.chungLoaiRepository.findOne({
        where: { MaChungLoaiThuCung: updateDto.MaChungLoai },
      });

      if (!chungLoai) {
        throw new NotFoundException(`Không tìm thấy chủng loại thú cưng với mã ${updateDto.MaChungLoai}`);
      }
    }

    Object.assign(thuCung, updateDto);
    return await this.thuCungRepository.save(thuCung);
  }

  async deleteThuCung(id: number): Promise<void> {
    const thuCung = await this.findOneThuCung(id);

    // Check if pet has medical records
    if (thuCung.GiayKhamTongQuats?.length > 0 || thuCung.GiayKhamChuyenKhoas?.length > 0 || thuCung.ToaThuocs?.length > 0) {
      throw new BadRequestException('Không thể xóa thú cưng có hồ sơ y tế. Thú cưng này đã có lịch sử khám bệnh.');
    }

    await this.thuCungRepository.remove(thuCung);
  }

  // ==================== SEARCH & FILTER ====================

  async searchKhachHang(keyword: string): Promise<KhachHang[]> {
    return await this.khachHangRepository
      .createQueryBuilder('kh')
      .where('kh.HoTen ILIKE :keyword OR kh.SoDienThoai LIKE :keyword', {
        keyword: `%${keyword}%`,
      })
      .leftJoinAndSelect('kh.ThuCungs', 'thuCung')
      .leftJoinAndSelect('kh.ThanhVien', 'thanhVien')
      .take(20)
      .getMany();
  }

  async searchThuCung(keyword: string): Promise<ThuCung[]> {
    return await this.thuCungRepository
      .createQueryBuilder('tc')
      .leftJoinAndSelect('tc.KhachHang', 'kh')
      .leftJoinAndSelect('tc.ChungLoai', 'cl')
      .where('tc.TenThuCung ILIKE :keyword OR kh.HoTen ILIKE :keyword OR kh.SoDienThoai LIKE :keyword', {
        keyword: `%${keyword}%`,
      })
      .take(20)
      .getMany();
  }
}
