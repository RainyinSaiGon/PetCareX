import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entities
import { NhanVien } from '../../entities/nhanvien.entity';
import { ChiNhanh } from '../../entities/chi-nhanh.entity';
import { HoaDon } from '../../entities/hoa-don.entity';
import { HoaDonSanPham } from '../../entities/hoa-don-san-pham.entity';
import { ChiTietTonKho } from '../../entities/chi-tiet-ton-kho.entity';
import { SanPham } from '../../entities/san-pham.entity';
import { Kho } from '../../entities/kho.entity';
import { CungCapDichVu } from '../../entities/cung-cap-dich-vu.entity';
import { DichVuYTe } from '../../entities/dich-vu-y-te.entity';

// Controllers
import { EmployeeController } from './controllers/employee.controller';
import { RevenueController } from './controllers/revenue.controller';
import { InventoryController } from './controllers/inventory.controller';
import { ServiceOfferingController } from './controllers/service-offering.controller';

// Services
import { EmployeeService } from './services/employee.service';
import { RevenueService } from './services/revenue.service';
import { InventoryService } from './services/inventory.service';
import { ServiceOfferingService } from './services/service-offering.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      NhanVien,
      ChiNhanh,
      HoaDon,
      HoaDonSanPham,
      ChiTietTonKho,
      SanPham,
      Kho,
      CungCapDichVu,
      DichVuYTe,
    ]),
  ],
  controllers: [
    EmployeeController,
    RevenueController,
    InventoryController,
    ServiceOfferingController,
  ],
  providers: [
    EmployeeService,
    RevenueService,
    InventoryService,
    ServiceOfferingService,
  ],
  exports: [
    EmployeeService,
    RevenueService,
    InventoryService,
    ServiceOfferingService,
  ],
})
export class BranchModule {}
