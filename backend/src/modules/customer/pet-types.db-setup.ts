/**
 * Pet Types & Breeds - Database Setup & Seed Script
 * 
 * This script initializes pet types (Loại Thú Cưng) and breeds (Chủng Loại)
 */

import { DataSource } from 'typeorm';
import { LoaiThuCung } from '../../entities/loai-thu-cung.entity';
import { ChungLoaiThuCung } from '../../entities/chung-loai-thu-cung.entity';

export class PetTypesAndBreedsSetup {
  constructor(private dataSource: DataSource) {}

  /**
   * Initialize pet types and breeds in database
   */
  async initializePetTypesAndBreeds(): Promise<{
    petTypesCreated: number;
    breedsCreated: number;
  }> {
    const loaiThuCungRepo = this.dataSource.getRepository(LoaiThuCung);
    const chungLoaiRepo = this.dataSource.getRepository(ChungLoaiThuCung);

    // Define pet types
    const petTypes = [
      { MaLoaiThuCung: 'C1', TenLoaiThuCung: 'Chó' },
      { MaLoaiThuCung: 'C2', TenLoaiThuCung: 'Mèo' },
      { MaLoaiThuCung: 'C3', TenLoaiThuCung: 'Gà' },
      { MaLoaiThuCung: 'C4', TenLoaiThuCung: 'Vịt' },
    ];

    // Define breeds
    const breeds = [
      // Dog breeds
      { MaChungLoaiThuCung: 'D1', TenChungLoaiThuCung: 'Husky', MaLoaiThuCung: 'C1' },
      { MaChungLoaiThuCung: 'D2', TenChungLoaiThuCung: 'Labrador', MaLoaiThuCung: 'C1' },
      { MaChungLoaiThuCung: 'D3', TenChungLoaiThuCung: 'Golden Retriever', MaLoaiThuCung: 'C1' },
      { MaChungLoaiThuCung: 'D4', TenChungLoaiThuCung: 'German Shepherd', MaLoaiThuCung: 'C1' },
      { MaChungLoaiThuCung: 'D5', TenChungLoaiThuCung: 'Poodle', MaLoaiThuCung: 'C1' },
      { MaChungLoaiThuCung: 'D6', TenChungLoaiThuCung: 'Bulldog', MaLoaiThuCung: 'C1' },
      { MaChungLoaiThuCung: 'D7', TenChungLoaiThuCung: 'Chihuahua', MaLoaiThuCung: 'C1' },
      { MaChungLoaiThuCung: 'D8', TenChungLoaiThuCung: 'Shiba Inu', MaLoaiThuCung: 'C1' },
      
      // Cat breeds
      { MaChungLoaiThuCung: 'M1', TenChungLoaiThuCung: 'Persian', MaLoaiThuCung: 'C2' },
      { MaChungLoaiThuCung: 'M2', TenChungLoaiThuCung: 'Siamese', MaLoaiThuCung: 'C2' },
      { MaChungLoaiThuCung: 'M3', TenChungLoaiThuCung: 'Bengal', MaLoaiThuCung: 'C2' },
      { MaChungLoaiThuCung: 'M4', TenChungLoaiThuCung: 'Maine Coon', MaLoaiThuCung: 'C2' },
      { MaChungLoaiThuCung: 'M5', TenChungLoaiThuCung: 'British Shorthair', MaLoaiThuCung: 'C2' },
      { MaChungLoaiThuCung: 'M6', TenChungLoaiThuCung: 'Ragdoll', MaLoaiThuCung: 'C2' },
      { MaChungLoaiThuCung: 'M7', TenChungLoaiThuCung: 'Scottish Fold', MaLoaiThuCung: 'C2' },
      { MaChungLoaiThuCung: 'M8', TenChungLoaiThuCung: 'Sphynx', MaLoaiThuCung: 'C2' },
      
      // Chicken breeds
      { MaChungLoaiThuCung: 'G1', TenChungLoaiThuCung: 'Gà Ngoại', MaLoaiThuCung: 'C3' },
      { MaChungLoaiThuCung: 'G2', TenChungLoaiThuCung: 'Gà Nội', MaLoaiThuCung: 'C3' },
      { MaChungLoaiThuCung: 'G3', TenChungLoaiThuCung: 'Gà Đông Tảo', MaLoaiThuCung: 'C3' },
      { MaChungLoaiThuCung: 'G4', TenChungLoaiThuCung: 'Gà Các', MaLoaiThuCung: 'C3' },
      
      // Duck breeds
      { MaChungLoaiThuCung: 'V1', TenChungLoaiThuCung: 'Vịt Ngoại', MaLoaiThuCung: 'C4' },
      { MaChungLoaiThuCung: 'V2', TenChungLoaiThuCung: 'Vịt Nội', MaLoaiThuCung: 'C4' },
      { MaChungLoaiThuCung: 'V3', TenChungLoaiThuCung: 'Vịt Aylesbury', MaLoaiThuCung: 'C4' },
      { MaChungLoaiThuCung: 'V4', TenChungLoaiThuCung: 'Vịt Pekin', MaLoaiThuCung: 'C4' },
    ];

    let petTypesCreated = 0;
    let breedsCreated = 0;

    // Insert pet types
    for (const petType of petTypes) {
      const existing = await loaiThuCungRepo.findOne({
        where: { MaLoaiThuCung: petType.MaLoaiThuCung },
      });

      if (!existing) {
        await loaiThuCungRepo.save(petType);
        petTypesCreated++;
      }
    }

    // Insert breeds
    for (const breed of breeds) {
      const existing = await chungLoaiRepo.findOne({
        where: { MaChungLoaiThuCung: breed.MaChungLoaiThuCung },
      });

      if (!existing) {
        await chungLoaiRepo.save(breed);
        breedsCreated++;
      }
    }

    return {
      petTypesCreated,
      breedsCreated,
    };
  }
}
