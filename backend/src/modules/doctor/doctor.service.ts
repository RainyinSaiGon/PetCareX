import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { GiayKhamBenhTongQuat } from '../../entities/giay-kham-benh-tong-quat.entity';
import { ToaThuoc } from '../../entities/toa-thuoc.entity';
import { ChiTietToaThuoc } from '../../entities/chi-tiet-toa-thuoc.entity';
import { ThuCung } from '../../entities/thu-cung.entity';
import { Thuoc } from '../../entities/thuoc.entity';
import { SanPham } from '../../entities/san-pham.entity';
import { ChiTietKhamBenhTrieuChung } from '../../entities/chi-tiet-kham-benh-trieu-chung.entity';
import { ChiTietKhamBenhChuanDoan } from '../../entities/chi-tiet-kham-benh-chuan-doan.entity';
import { ChiTietTonKho } from '../../entities/chi-tiet-ton-kho.entity';
import { HoaDon } from '../../entities/hoa-don.entity';
import { HoaDonSanPham } from '../../entities/hoa-don-san-pham.entity';
import { SearchPetExaminationDto } from './dto/search-pet-examination.dto';
import { CreateExaminationDto } from './dto/create-examination.dto';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { SearchMedicineDto } from './dto/search-medicine.dto';
import { ExaminationHistoryDto } from './dto/examination-history.dto';
import { PrescriptionResponseDto, PrescriptionDetailResponseDto } from './dto/prescription-response.dto';

@Injectable()
export class DoctorService {
  constructor(
    @InjectRepository(GiayKhamBenhTongQuat)
    private examinationRepository: Repository<GiayKhamBenhTongQuat>,
    @InjectRepository(ToaThuoc)
    private prescriptionRepository: Repository<ToaThuoc>,
    @InjectRepository(ChiTietToaThuoc)
    private prescriptionDetailRepository: Repository<ChiTietToaThuoc>,
    @InjectRepository(ThuCung)
    private petRepository: Repository<ThuCung>,
    @InjectRepository(Thuoc)
    private medicineRepository: Repository<Thuoc>,
    @InjectRepository(SanPham)
    private sanPhamRepository: Repository<SanPham>,
    @InjectRepository(ChiTietKhamBenhTrieuChung)
    private symptomDetailRepository: Repository<ChiTietKhamBenhTrieuChung>,
    @InjectRepository(ChiTietKhamBenhChuanDoan)
    private diagnosisDetailRepository: Repository<ChiTietKhamBenhChuanDoan>,
    @InjectRepository(ChiTietTonKho)
    private inventoryRepository: Repository<ChiTietTonKho>,
    @InjectRepository(HoaDon)
    private invoiceRepository: Repository<HoaDon>,
    @InjectRepository(HoaDonSanPham)
    private invoiceDetailRepository: Repository<HoaDonSanPham>,
    private dataSource: DataSource,
  ) { }

  // Search for pet examination records
  async searchPetExaminations(searchDto: SearchPetExaminationDto) {
    const query = this.examinationRepository
      .createQueryBuilder('exam')
      .leftJoinAndSelect('exam.ThuCung', 'pet')
      .leftJoinAndSelect('pet.KhachHang', 'customer')
      .leftJoinAndSelect('pet.ChungLoai', 'breed');

    if (searchDto.maThuCung) {
      query.andWhere('exam.MaThuCung = :maThuCung', { maThuCung: searchDto.maThuCung });
    }

    if (searchDto.tenThuCung) {
      query.andWhere('pet.TenThuCung ILIKE :tenThuCung', { tenThuCung: `%${searchDto.tenThuCung}%` });
    }

    if (searchDto.maKhachHang) {
      query.andWhere('pet.MaKhachHang = :maKhachHang', { maKhachHang: searchDto.maKhachHang });
    }

    if (searchDto.fromDate && searchDto.toDate) {
      query.andWhere('exam.createdAt BETWEEN :fromDate AND :toDate', {
        fromDate: searchDto.fromDate,
        toDate: searchDto.toDate,
      });
    }

    const skip = searchDto.skip || 0;
    const take = searchDto.take || 10;

    const [data, total] = await query
      .skip(skip)
      .take(take)
      .getManyAndCount();

    return {
      data,
      total,
      skip,
      take,
    };
  }

  // Get examination history for a specific pet
  async getPetExaminationHistory(maThuCung: number): Promise<ExaminationHistoryDto[]> {
    const examinations = await this.examinationRepository
      .createQueryBuilder('exam')
      .leftJoinAndSelect('exam.ThuCung', 'pet')
      .leftJoinAndSelect('exam.ChiTietTrieuChungs', 'symptoms')
      .leftJoinAndSelect('exam.ChiTietChuanDoans', 'diagnoses')
      .where('exam.MaThuCung = :maThuCung', { maThuCung })
      .orderBy('exam.MaGiayKhamTongQuat', 'DESC')
      .getMany();

    return examinations.map(exam => ({
      maGiayKhamTongQuat: exam.MaGiayKhamTongQuat,
      maThuCung: exam.MaThuCung,
      tenThuCung: exam.ThuCung?.TenThuCung || '',
      ngayKham: new Date(),
      nhietDo: exam.NhietDo || 0,
      moTa: exam.MoTa || '',
      trieuChung: exam.ChiTietTrieuChungs?.map(s => s.TrieuChung) || [],
      chuanDoan: exam.ChiTietChuanDoans?.map(d => d.ChuanDoan) || [],
    }));
  }

  // Get full examination details including symptoms, diagnoses and prescriptions
  async getExaminationDetails(maGiayKhamTongQuat: number) {
    const examination = await this.examinationRepository
      .createQueryBuilder('exam')
      .leftJoinAndSelect('exam.ThuCung', 'pet')
      .leftJoinAndSelect('pet.KhachHang', 'customer')
      .leftJoinAndSelect('pet.ChungLoai', 'breed')
      .leftJoinAndSelect('exam.ChiTietTrieuChungs', 'symptoms')
      .leftJoinAndSelect('exam.ChiTietChuanDoans', 'diagnoses')
      .where('exam.MaGiayKhamTongQuat = :maGiayKhamTongQuat', { maGiayKhamTongQuat })
      .getOne();

    if (!examination) {
      throw new NotFoundException('Examination not found');
    }

    // Get prescriptions for this specific examination record
    const prescriptions = await this.prescriptionRepository
      .createQueryBuilder('toa')
      .leftJoinAndSelect('toa.ChiTiets', 'chiTiets')
      .leftJoinAndSelect('chiTiets.Thuoc', 'thuoc')
      .leftJoinAndSelect('thuoc.SanPham', 'sanpham')
      .where('toa.MaGiayKhamTongQuat = :maGiayKhamTongQuat', { maGiayKhamTongQuat })
      .orderBy('toa.NgayKham', 'DESC')
      .getMany();

    return {
      maGiayKhamTongQuat: examination.MaGiayKhamTongQuat,
      ngayKham: examination.NgayKham,
      nhietDo: examination.NhietDo,
      moTa: examination.MoTa,
      thuCung: {
        maThuCung: examination.ThuCung?.MaThuCung,
        tenThuCung: examination.ThuCung?.TenThuCung,
        chungLoai: examination.ThuCung?.ChungLoai?.TenChungLoaiThuCung,
      },
      khachHang: {
        maKhachHang: examination.ThuCung?.KhachHang?.MaKhachHang,
        hoTen: examination.ThuCung?.KhachHang?.HoTen,
        sdt: examination.ThuCung?.KhachHang?.SoDienThoai,
      },
      trieuChung: examination.ChiTietTrieuChungs?.map(s => s.TrieuChung) || [],
      chuanDoan: examination.ChiTietChuanDoans?.map(d => d.ChuanDoan) || [],
      toaThuocs: prescriptions.map(toa => ({
        maToaThuoc: toa.MaToaThuoc,
        ngayKham: toa.NgayKham,
        tongTien: toa.TongTien,
        chiTiets: toa.ChiTiets?.map(ct => ({
          maThuoc: ct.MaThuoc,
          tenSanPham: ct.Thuoc?.SanPham?.TenSanPham || 'Unknown',
          soLuong: ct.SoLuong,
          ghiChu: ct.GhiChu,
        })) || [],
      })),
    };
  }

  // Check if pet has existing medical record
  async checkPetMedicalRecordStatus(maThuCung: number) {
    const examination = await this.examinationRepository.findOne({
      where: { MaThuCung: maThuCung },
    });

    return {
      maThuCung,
      hasExisting: !!examination,
      count: examination ? 1 : 0,
    };
  }

  // Create new examination record
  async createExamination(createExaminationDto: CreateExaminationDto, maBacSi: string) {
    const pet = await this.petRepository.findOne({
      where: { MaThuCung: createExaminationDto.maThuCung },
    });

    if (!pet) {
      throw new NotFoundException('Pet not found');
    }

    const examination = this.examinationRepository.create({
      MaThuCung: createExaminationDto.maThuCung,
      NhietDo: createExaminationDto.nhietDo,
      MoTa: createExaminationDto.moTa,
      NgayKham: new Date(),
    });

    const savedExamination = await this.examinationRepository.save(examination);

    // Save symptoms if provided
    if (createExaminationDto.trieuChung && createExaminationDto.trieuChung.length > 0) {
      for (const trieuChung of createExaminationDto.trieuChung) {
        await this.symptomDetailRepository.save({
          MaGiayKhamBenhTongQuat: savedExamination.MaGiayKhamTongQuat,
          TrieuChung: trieuChung,
        });
      }
    }

    // Save diagnoses if provided
    if (createExaminationDto.chuanDoan && createExaminationDto.chuanDoan.length > 0) {
      for (const chuanDoan of createExaminationDto.chuanDoan) {
        await this.diagnosisDetailRepository.save({
          MaGiayKhamBenhTongQuat: savedExamination.MaGiayKhamTongQuat,
          ChuanDoan: chuanDoan,
        });
      }
    }

    return savedExamination;
  }

  // Update examination record
  async updateExamination(maGiayKhamTongQuat: number, updateData: Partial<CreateExaminationDto>) {
    const examination = await this.examinationRepository.findOne({
      where: { MaGiayKhamTongQuat: maGiayKhamTongQuat },
    });

    if (!examination) {
      throw new NotFoundException('Examination not found');
    }

    // Update basic fields
    if (updateData.nhietDo !== undefined) {
      examination.NhietDo = updateData.nhietDo;
    }
    if (updateData.moTa !== undefined) {
      examination.MoTa = updateData.moTa;
    }

    const savedExamination = await this.examinationRepository.save(examination);

    // Update symptoms if provided
    if (updateData.trieuChung) {
      // Delete existing symptoms
      await this.symptomDetailRepository.delete({ MaGiayKhamBenhTongQuat: maGiayKhamTongQuat });
      // Add new symptoms
      for (const trieuChung of updateData.trieuChung) {
        await this.symptomDetailRepository.save({
          MaGiayKhamBenhTongQuat: maGiayKhamTongQuat,
          TrieuChung: trieuChung,
        });
      }
    }

    // Update diagnoses if provided
    if (updateData.chuanDoan) {
      // Delete existing diagnoses
      await this.diagnosisDetailRepository.delete({ MaGiayKhamBenhTongQuat: maGiayKhamTongQuat });
      // Add new diagnoses
      for (const chuanDoan of updateData.chuanDoan) {
        await this.diagnosisDetailRepository.save({
          MaGiayKhamBenhTongQuat: maGiayKhamTongQuat,
          ChuanDoan: chuanDoan,
        });
      }
    }

    return savedExamination;
  }

  // Delete examination record
  async deleteExamination(maGiayKhamTongQuat: number) {
    const examination = await this.examinationRepository.findOne({
      where: { MaGiayKhamTongQuat: maGiayKhamTongQuat },
    });

    if (!examination) {
      throw new NotFoundException('Examination not found');
    }

    // Delete related symptoms
    await this.symptomDetailRepository.delete({ MaGiayKhamBenhTongQuat: maGiayKhamTongQuat });

    // Delete related diagnoses
    await this.diagnosisDetailRepository.delete({ MaGiayKhamBenhTongQuat: maGiayKhamTongQuat });

    // Delete related prescriptions and their details
    const prescriptions = await this.prescriptionRepository.find({
      where: { MaGiayKhamTongQuat: maGiayKhamTongQuat },
    });

    for (const prescription of prescriptions) {
      await this.prescriptionDetailRepository.delete({ MaToaThuoc: prescription.MaToaThuoc });
    }
    await this.prescriptionRepository.delete({ MaGiayKhamTongQuat: maGiayKhamTongQuat });

    // Delete the examination record
    await this.examinationRepository.delete({ MaGiayKhamTongQuat: maGiayKhamTongQuat });

    return { success: true, message: 'Examination deleted successfully' };
  }

  // Search medicines - only returns items in THUOC table
  async searchMedicines(searchDto: SearchMedicineDto) {
    const query = this.medicineRepository
      .createQueryBuilder('thuoc')
      .leftJoinAndSelect('thuoc.SanPham', 'sanpham')
      .leftJoinAndSelect('sanpham.ChiTietTonKhos', 'chitiet');

    if (searchDto.maSanPham) {
      query.andWhere('thuoc.MaSanPham = :maSanPham', { maSanPham: searchDto.maSanPham });
    }

    if (searchDto.tenSanPham && searchDto.tenSanPham.trim()) {
      // Match anywhere in the name, case-insensitive
      const searchTerm = searchDto.tenSanPham.trim();
      query.andWhere('LOWER(sanpham.TenSanPham) LIKE LOWER(:tenSanPham)', { tenSanPham: `%${searchTerm}%` });
    }

    const skip = searchDto.skip || 0;
    const take = searchDto.take || 10;

    const [items, total] = await query
      .skip(skip)
      .take(take)
      .getManyAndCount();

    // Transform data to include all required fields
    const data = items.map(item => ({
      MaSanPham: item.MaSanPham,
      TenSanPham: item.SanPham?.TenSanPham || '',
      GiaSanPham: item.SanPham?.GiaTienSanPham || 0,
      DonVi: 'Hộp', // Default unit for medicines
      SoLuongTon: item.SanPham?.ChiTietTonKhos?.reduce((total, ct) => total + (ct.SoLuong || 0), 0) || 0,
      LoaiSanPham: item.SanPham?.LoaiSanPham || 'Thuốc',
      HinhAnh: item.SanPham?.HinhAnh,
    }));

    return {
      data,
      total,
      skip,
      take,
    };
  }

  // Create new prescription
  async createPrescription(
    createPrescriptionDto: CreatePrescriptionDto,
    maBacSi: string,
  ): Promise<PrescriptionResponseDto> {
    // Use transaction to ensure data consistency
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const pet = await queryRunner.manager.findOne(ThuCung, {
        where: { MaThuCung: createPrescriptionDto.maThuCung },
        relations: ['KhachHang'],
      });

      if (!pet) {
        throw new NotFoundException('Pet not found');
      }

      if (!pet.KhachHang) {
        throw new BadRequestException('Pet must have an owner to create prescription');
      }

      // Validate all medicines exist and check stock availability
      const medicineDetails: Array<{ maThuoc: string; soLuong: number; donGia: number; tenSanPham: string }> = [];

      for (const detail of createPrescriptionDto.chiTiets) {
        const thuoc = await queryRunner.manager.findOne(Thuoc, {
          where: { MaSanPham: detail.maThuoc },
          relations: ['SanPham'],
        });

        if (!thuoc) {
          throw new BadRequestException(`Medicine ${detail.maThuoc} not found. Please ensure the product is registered as a medicine in the system.`);
        }

        // Check total stock across all warehouses
        const inventoryItems = await queryRunner.manager.find(ChiTietTonKho, {
          where: { MaSanPham: detail.maThuoc },
        });

        const totalStock = inventoryItems.reduce((sum, item) => sum + (item.SoLuong || 0), 0);

        if (totalStock < detail.soLuong) {
          throw new BadRequestException(
            `Insufficient stock for ${thuoc.SanPham?.TenSanPham || detail.maThuoc}. ` +
            `Available: ${totalStock}, Required: ${detail.soLuong}`
          );
        }

        medicineDetails.push({
          maThuoc: detail.maThuoc,
          soLuong: detail.soLuong,
          donGia: thuoc.SanPham?.GiaTienSanPham || 0,
          tenSanPham: thuoc.SanPham?.TenSanPham || 'Unknown',
        });
      }

      // Calculate total cost
      const tongTien = medicineDetails.reduce((sum, item) => sum + (item.donGia * item.soLuong), 0);

      // Create prescription
      const prescription = queryRunner.manager.create(ToaThuoc, {
        MaThuCung: createPrescriptionDto.maThuCung,
        MaGiayKhamTongQuat: createPrescriptionDto.maGiayKhamTongQuat,
        MaBacSi: maBacSi && maBacSi !== 'UNKNOWN' ? maBacSi : undefined,
        NgayKham: new Date(),
        TongTien: tongTien,
      });

      const savedPrescription = await queryRunner.manager.save(prescription);

      // Create prescription details and deduct inventory
      const chiTiets: PrescriptionDetailResponseDto[] = [];

      for (const detail of createPrescriptionDto.chiTiets) {
        // Create prescription detail
        const prescriptionDetail = queryRunner.manager.create(ChiTietToaThuoc, {
          MaToaThuoc: savedPrescription.MaToaThuoc,
          MaThuoc: detail.maThuoc,
          SoLuong: detail.soLuong,
          GhiChu: detail.ghiChu || '',
        });

        await queryRunner.manager.save(prescriptionDetail);

        // Deduct from inventory using FIFO (First In First Out)
        let remainingQty = detail.soLuong;
        const inventoryItems = await queryRunner.manager.find(ChiTietTonKho, {
          where: { MaSanPham: detail.maThuoc },
          order: { MaKho: 'ASC' }, // FIFO by warehouse code
        });

        for (const invItem of inventoryItems) {
          if (remainingQty <= 0) break;

          const deductQty = Math.min(invItem.SoLuong, remainingQty);
          invItem.SoLuong -= deductQty;
          remainingQty -= deductQty;

          await queryRunner.manager.save(invItem);
        }

        const medDetail = medicineDetails.find(m => m.maThuoc === detail.maThuoc);
        chiTiets.push({
          maThuoc: detail.maThuoc,
          tenSanPham: medDetail?.tenSanPham || 'Unknown',
          soLuong: detail.soLuong,
          ghiChu: detail.ghiChu || '',
        });
      }

      // Create invoice for the prescription
      const invoice = queryRunner.manager.create(HoaDon, {
        MaKhachHang: pet.KhachHang.MaKhachHang,
        NgayLap: new Date(),
        TongTien: tongTien,
        GiamGia: 0,
        TrangThai: 'Đã thanh toán',
        MaNhanVien: maBacSi && maBacSi !== 'UNKNOWN' ? maBacSi : undefined,
      });

      const savedInvoice = await queryRunner.manager.save(invoice);

      // Create invoice details
      for (const medDetail of medicineDetails) {
        const invoiceDetail = queryRunner.manager.create(HoaDonSanPham, {
          MaHoaDon: savedInvoice.MaHoaDon,
          MaSanPham: medDetail.maThuoc,
          SoLuong: medDetail.soLuong,
          DonGia: medDetail.donGia,
          ThanhTien: medDetail.donGia * medDetail.soLuong,
        });

        await queryRunner.manager.save(invoiceDetail);
      }

      // Commit transaction
      await queryRunner.commitTransaction();

      return {
        maToaThuoc: savedPrescription.MaToaThuoc,
        maThuCung: savedPrescription.MaThuCung,
        tenThuCung: pet.TenThuCung,
        ngayKham: savedPrescription.NgayKham,
        tongTien: savedPrescription.TongTien,
        chiTiets,
      };
    } catch (error) {
      // Rollback transaction on error
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // Release query runner
      await queryRunner.release();
    }
  }

  // Get prescription details
  async getPrescriptionDetails(maToaThuoc: number): Promise<PrescriptionResponseDto> {
    const prescription = await this.prescriptionRepository
      .createQueryBuilder('toa')
      .leftJoinAndSelect('toa.ThuCung', 'pet')
      .leftJoinAndSelect('toa.ChiTiets', 'chiTiets')
      .leftJoinAndSelect('chiTiets.Thuoc', 'thuoc')
      .leftJoinAndSelect('thuoc.SanPham', 'sanpham')
      .where('toa.MaToaThuoc = :maToaThuoc', { maToaThuoc })
      .getOne();

    if (!prescription) {
      throw new NotFoundException('Prescription not found');
    }

    const chiTiets: PrescriptionDetailResponseDto[] = prescription.ChiTiets.map(ct => ({
      maThuoc: ct.MaThuoc,
      tenSanPham: ct.Thuoc?.SanPham?.TenSanPham || 'Unknown',
      soLuong: ct.SoLuong,
      ghiChu: ct.GhiChu,
    }));

    return {
      maToaThuoc: prescription.MaToaThuoc,
      maThuCung: prescription.MaThuCung,
      tenThuCung: prescription.ThuCung?.TenThuCung,
      ngayKham: prescription.NgayKham,
      tongTien: prescription.TongTien,
      chiTiets,
    };
  }

  // Get prescriptions for a specific pet
  async getPrescriptionsForPet(maThuCung: number) {
    const prescriptions = await this.prescriptionRepository
      .createQueryBuilder('toa')
      .leftJoinAndSelect('toa.ThuCung', 'pet')
      .leftJoinAndSelect('toa.ChiTiets', 'chiTiets')
      .where('toa.MaThuCung = :maThuCung', { maThuCung })
      .orderBy('toa.NgayKham', 'DESC')
      .getMany();

    return prescriptions.map(toa => ({
      maToaThuoc: toa.MaToaThuoc,
      maThuCung: toa.MaThuCung,
      tenThuCung: toa.ThuCung?.TenThuCung,
      ngayKham: toa.NgayKham,
      tongTien: toa.TongTien,
      soChiTiet: toa.ChiTiets?.length || 0,
    }));
  }
}
