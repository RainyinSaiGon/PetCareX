import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ThuCung } from '../../../entities/thu-cung.entity';
import { LichHen } from '../../../entities/lich-hen.entity';

export class CreatePetDto {
  TenThuCung: string;
  MaChungLoai: string;
  NgaySinhThuCung?: Date;
}

export class UpdatePetDto {
  TenThuCung?: string;
  MaChungLoai?: string;
  NgaySinhThuCung?: Date;
}

export class PetResponseDto {
  MaThuCung: number;
  MaKhachHang: number;
  TenThuCung: string;
  MaChungLoai: string;
  NgaySinhThuCung?: Date;
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
        TenThuCung: createPetDto.TenThuCung,
        MaChungLoai: createPetDto.MaChungLoai,
        NgaySinhThuCung: createPetDto.NgaySinhThuCung,
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
        where: { MaThuCung: petId },
        relations: ['ChungLoai'],
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
        where: { MaKhachHang: customerId },
        relations: ['ChungLoai'],
        order: { MaThuCung: 'DESC' },
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
        where: { MaThuCung: petId },
      });

      if (!pet) {
        throw new Error(`Pet with ID ${petId} not found`);
      }

      if (updatePetDto.TenThuCung) pet.TenThuCung = updatePetDto.TenThuCung;
      if (updatePetDto.MaChungLoai) pet.MaChungLoai = updatePetDto.MaChungLoai;
      if (updatePetDto.NgaySinhThuCung) pet.NgaySinhThuCung = updatePetDto.NgaySinhThuCung;

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
        where: { MaThuCung: petId },
      });

      if (!pet) {
        throw new Error(`Pet with ID ${petId} not found`);
      }

      await this.petRepository.remove(pet);
      return { success: true, message: `Pet ${petId} deleted successfully` };
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
        where: { MaThuCung: petId },
      });

      if (!pet) {
        throw new Error(`Pet with ID ${petId} not found`);
      }

      // Get appointments (representing medical visits)
      const appointments = await this.appointmentRepository.find({
        where: { MaThuCung: petId },
        order: { NgayHen: 'DESC' },
      });

      return appointments.map(a => ({
        appointmentId: a.MaLichHen,
        date: a.NgayHen,
        time: a.GioHen,
        status: a.TrangThai,
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
    petsByType: Record<string, number>;
    petsPerCustomer: number;
  }> {
    try {
      const allPets = await this.petRepository.find({
        relations: ['ChungLoai'],
      });

      const petsByType: Record<string, number> = {};
      allPets.forEach(p => {
        const typeName = p.ChungLoai?.TenChungLoaiThuCung || 'Unknown';
        petsByType[typeName] = (petsByType[typeName] || 0) + 1;
      });

      // Get customer count to calculate average
      const customers = await this.petRepository.createQueryBuilder('p')
        .select('COUNT(DISTINCT p.MaKhachHang)', 'count')
        .getRawOne();

      const petsPerCustomer = customers?.count ? allPets.length / customers.count : 0;

      return {
        totalPets: allPets.length,
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
        .leftJoinAndSelect('p.ChungLoai', 'cl')
        .where('p.TenThuCung LIKE :query', { query: `%${query}%` })
        .orderBy('p.TenThuCung', 'ASC')
        .getMany();

      return pets.map(p => this.mapPetToDto(p));
    } catch (error) {
      throw new Error(`Failed to search pets: ${error.message}`);
    }
  }

  /**
   * Helper method to map pet entity to DTO
   */
  private mapPetToDto(pet: ThuCung): PetResponseDto {
    return {
      MaThuCung: pet.MaThuCung,
      MaKhachHang: pet.MaKhachHang,
      TenThuCung: pet.TenThuCung,
      MaChungLoai: pet.MaChungLoai,
      NgaySinhThuCung: pet.NgaySinhThuCung || undefined,
    };
  }
}
