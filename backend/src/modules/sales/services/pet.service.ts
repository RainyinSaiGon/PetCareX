import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ThuCung } from '../../entities/thu-cung.entity';
import { LichHen } from '../../entities/lich-hen.entity';

export class CreatePetDto {
  TenThucUng: string;
  LoaiThucUng: string;
  GioiTinh?: string;
  MauLong?: string;
  CanNang?: number;
  ChieuCao?: number;
  NgaySinh?: Date;
  GhiChu?: string;
}

export class UpdatePetDto {
  TenThucUng?: string;
  GioiTinh?: string;
  MauLong?: string;
  CanNang?: number;
  ChieuCao?: number;
  GhiChu?: string;
}

export class PetResponseDto {
  MaThuCung: number;
  MaKhachHang: number;
  TenThuCung: string;
  LoaiThuCung: string;
  GioiTinh?: string;
  MauLong?: string;
  CanNang?: number;
  ChieuCao?: number;
  NgaySinh?: Date;
  GhiChu?: string;
  CreatedAt?: Date;
  IsActive: boolean;
}

@Injectable()
export class PetService {
  constructor(
    @InjectRepository(ThuCung)
    private petRepository: Repository<ThuCung>,
    @InjectRepository(LichHen)
    private appointmentRepository: Repository<LichHen>,
  ) {}

  /**
   * Add pet to customer
   */
  async createPet(customerId: number, createPetDto: CreatePetDto): Promise<PetResponseDto> {
    try {
      const pet = this.petRepository.create({
        MaKhachHang: customerId,
        TenThucUng: createPetDto.TenThucUng,
        LoaiThucUng: createPetDto.LoaiThucUng,
        GioiTinh: createPetDto.GioiTinh || 'Khác',
        MauLong: createPetDto.MauLong || null,
        CanNang: createPetDto.CanNang || null,
        ChieuCao: createPetDto.ChieuCao || null,
        NgaySinh: createPetDto.NgaySinh || null,
        GhiChu: createPetDto.GhiChu || null,
        IsActive: true,
      });

      const savedPet = await this.petRepository.save(pet);
      return this.mapPetToDto(savedPet);
    } catch (error) {
      throw new Error(`Failed to create pet: ${error.message}`);
    }
  }

  /**
   * Get pet by ID
   */
  async getPetById(petId: number): Promise<PetResponseDto> {
    try {
      const pet = await this.petRepository.findOne({
        where: { MaThucUng: petId },
        relations: ['KhachHang', 'LichHens'],
      });

      if (!pet) {
        throw new Error(`Pet with ID ${petId} not found`);
      }

      return this.mapPetToDto(pet);
    } catch (error) {
      throw new Error(`Failed to get pet: ${error.message}`);
    }
  }

  /**
   * Get all pets for a customer
   */
  async getCustomerPets(customerId: number): Promise<PetResponseDto[]> {
    try {
      const pets = await this.petRepository.find({
        where: { MaKhachHang: customerId, IsActive: true },
        relations: ['LichHens'],
        order: { MaThucUng: 'DESC' },
      });

      return pets.map(p => this.mapPetToDto(p));
    } catch (error) {
      throw new Error(`Failed to get customer pets: ${error.message}`);
    }
  }

  /**
   * Update pet information
   */
  async updatePet(petId: number, updatePetDto: UpdatePetDto): Promise<PetResponseDto> {
    try {
      const pet = await this.petRepository.findOne({
        where: { MaThucUng: petId },
      });

      if (!pet) {
        throw new Error(`Pet with ID ${petId} not found`);
      }

      if (updatePetDto.TenThucUng) pet.TenThucUng = updatePetDto.TenThucUng;
      if (updatePetDto.GioiTinh) pet.GioiTinh = updatePetDto.GioiTinh;
      if (updatePetDto.MauLong) pet.MauLong = updatePetDto.MauLong;
      if (updatePetDto.CanNang !== undefined) pet.CanNang = updatePetDto.CanNang;
      if (updatePetDto.ChieuCao !== undefined) pet.ChieuCao = updatePetDto.ChieuCao;
      if (updatePetDto.GhiChu) pet.GhiChu = updatePetDto.GhiChu;

      const updated = await this.petRepository.save(pet);
      return this.mapPetToDto(updated);
    } catch (error) {
      throw new Error(`Failed to update pet: ${error.message}`);
    }
  }

  /**
   * Delete pet (soft delete)
   */
  async deletePet(petId: number): Promise<{ success: boolean; message: string }> {
    try {
      const pet = await this.petRepository.findOne({
        where: { MaThucUng: petId },
      });

      if (!pet) {
        throw new Error(`Pet with ID ${petId} not found`);
      }

      pet.IsActive = false;
      await this.petRepository.save(pet);

      return { success: true, message: `Pet ${petId} deactivated successfully` };
    } catch (error) {
      throw new Error(`Failed to delete pet: ${error.message}`);
    }
  }

  /**
   * Get pet medical history (appointments)
   */
  async getPetMedicalHistory(petId: number): Promise<any[]> {
    try {
      const pet = await this.petRepository.findOne({
        where: { MaThucUng: petId },
        relations: ['LichHens'],
      });

      if (!pet) {
        throw new Error(`Pet with ID ${petId} not found`);
      }

      // Get appointments (representing medical visits)
      const appointments = await this.appointmentRepository.find({
        where: { MaThucUng: petId },
        order: { NgayLap: 'DESC' },
      });

      return appointments.map(a => ({
        appointmentId: a.MaLichHen,
        date: a.NgayLap,
        service: a.GhiChu,
        status: a.TrangThaiHen,
      }));
    } catch (error) {
      throw new Error(`Failed to get pet medical history: ${error.message}`);
    }
  }

  /**
   * Get pet statistics
   */
  async getPetStatistics(): Promise<{
    totalPets: number;
    activePets: number;
    petsByType: Record<string, number>;
    petsPerCustomer: number;
  }> {
    try {
      const allPets = await this.petRepository.find();
      const activePets = allPets.filter(p => p.IsActive !== false).length;

      const petsByType: Record<string, number> = {};
      allPets.forEach(p => {
        petsByType[p.LoaiThucUng] = (petsByType[p.LoaiThucUng] || 0) + 1;
      });

      // Get customer count to calculate average
      const customers = await this.petRepository.createQueryBuilder('p')
        .select('COUNT(DISTINCT p.MaKhachHang)', 'count')
        .getRawOne();

      const petsPerCustomer = customers?.count ? allPets.length / customers.count : 0;

      return {
        totalPets: allPets.length,
        activePets,
        petsByType,
        petsPerCustomer: Math.round(petsPerCustomer * 100) / 100,
      };
    } catch (error) {
      throw new Error(`Failed to get pet statistics: ${error.message}`);
    }
  }

  /**
   * Search pets
   */
  async searchPets(query: string): Promise<PetResponseDto[]> {
    try {
      const pets = await this.petRepository
        .createQueryBuilder('p')
        .where('p.TenThucUng LIKE :query', { query: `%${query}%` })
        .orWhere('p.LoaiThucUng LIKE :query', { query: `%${query}%` })
        .orderBy('p.TenThucUng', 'ASC')
        .getMany();

      return pets.map(p => this.mapPetToDto(p));
    } catch (error) {
      throw new Error(`Failed to search pets: ${error.message}`);
    }
  }

  /**
   * Helper method to map pet entity to DTO
   */
  private mapPetToDto(pet: KhachHangThucUng): PetResponseDto {
    return {
      MaThucUng: pet.MaThucUng,
      MaKhachHang: pet.MaKhachHang,
      TenThucUng: pet.TenThucUng,
      LoaiThucUng: pet.LoaiThucUng,
      GioiTinh: pet.GioiTinh || undefined,
      MauLong: pet.MauLong || undefined,
      CanNang: pet.CanNang || undefined,
      ChieuCao: pet.ChieuCao || undefined,
      NgaySinh: pet.NgaySinh || undefined,
      GhiChu: pet.GhiChu || undefined,
      CreatedAt: pet.CreatedAt,
      IsActive: pet.IsActive !== false,
    };
  }
}
