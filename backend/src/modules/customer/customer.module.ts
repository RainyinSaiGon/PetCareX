import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CustomerController } from './customer.controller';
import { CustomerService } from './customer.service';
import { KhachHang } from '../../entities/khach-hang.entity';
import { ThuCung } from '../../entities/thu-cung.entity';
import { ChungLoaiThuCung } from '../../entities/chung-loai-thu-cung.entity';
import { LoaiThuCung } from '../../entities/loai-thu-cung.entity';
import { PetTypesAndBreedsSetup } from './pet-types.db-setup';

@Module({
  imports: [
    TypeOrmModule.forFeature([KhachHang, ThuCung, ChungLoaiThuCung, LoaiThuCung]),
  ],
  controllers: [CustomerController],
  providers: [CustomerService],
  exports: [CustomerService],
})
export class CustomerModule implements OnModuleInit {
  constructor(private dataSource: DataSource) {}

  async onModuleInit() {
    // Initialize pet types and breeds on module startup
    try {
      const setup = new PetTypesAndBreedsSetup(this.dataSource);
      const result = await setup.initializePetTypesAndBreeds();
      if (result.petTypesCreated > 0 || result.breedsCreated > 0) {
        console.log(
          `✓ Pet types and breeds initialized: ${result.petTypesCreated} types, ${result.breedsCreated} breeds`,
        );
      }
    } catch (error) {
      console.warn('Pet types and breeds already initialized or error occurred:', error.message);
    }
  }
}
