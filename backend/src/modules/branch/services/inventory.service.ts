import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChiTietTonKho } from '../../../entities/chi-tiet-ton-kho.entity';
import { SanPham } from '../../../entities/san-pham.entity';
import { Kho } from '../../../entities/kho.entity';
import { CreateInventoryImportDto, CreateInventoryExportDto, InventoryLevelDto, InventoryTransactionDto, LowStockAlertDto } from '../dto/inventory.dto';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(ChiTietTonKho) private inventoryRepo: Repository<ChiTietTonKho>,
    @InjectRepository(SanPham) private productRepo: Repository<SanPham>,
    @InjectRepository(Kho) private khoRepo: Repository<Kho>,
  ) {}

  // FB-03: Create inventory import transaction
  async createInventoryImport(importDto: CreateInventoryImportDto): Promise<any> {
    const { MaChiNhanh, MaSanPham, SoLuong, GhiChu } = importDto;
    const maSanPhamStr = String(MaSanPham).padStart(5, '0');

    // Find or create inventory record
    let inventory = await this.inventoryRepo.findOne({
      where: { MaKho: MaChiNhanh, MaSanPham: maSanPhamStr },
    });

    if (!inventory) {
      inventory = this.inventoryRepo.create({
        MaKho: MaChiNhanh,
        MaSanPham: maSanPhamStr,
        SoLuong: 0,
      });
    }

    // Update quantity
    inventory.SoLuong += SoLuong;
    await this.inventoryRepo.save(inventory);

    return {
      success: true,
      message: `Imported ${SoLuong} units`,
      inventory,
    };
  }

  // FB-03: Create inventory export transaction
  async createInventoryExport(exportDto: CreateInventoryExportDto): Promise<any> {
    const { MaChiNhanh, MaSanPham, SoLuong, GhiChu } = exportDto;
    const maSanPhamStr = String(MaSanPham).padStart(5, '0');

    const inventory = await this.inventoryRepo.findOne({
      where: { MaKho: MaChiNhanh, MaSanPham: maSanPhamStr },
    });

    if (!inventory || inventory.SoLuong < SoLuong) {
      throw new Error('Insufficient inventory');
    }

    inventory.SoLuong -= SoLuong;
    await this.inventoryRepo.save(inventory);

    return {
      success: true,
      message: `Exported ${SoLuong} units`,
      inventory,
    };
  }

  // FB-03: Get inventory levels for branch
  async getInventoryLevelsByBranch(branchId: string, page: number = 1, limit: number = 10): Promise<any> {
    const skip = (page - 1) * limit;
    const [inventories, total] = await this.inventoryRepo.findAndCount({
      where: { MaKho: branchId },
      relations: ['SanPham'],
      skip,
      take: limit,
      order: { MaSanPham: 'ASC' },
    });

    const data = inventories.map(inv => ({
      MaSanPham: inv.MaSanPham,
      TenSanPham: inv.SanPham?.TenSanPham || 'Unknown',
      MaKho: inv.MaKho,
      SoLuong: inv.SoLuong,
      GiaTienSanPham: inv.SanPham?.GiaTienSanPham || 0,
      TotalValue: (inv.SoLuong * (inv.SanPham?.GiaTienSanPham || 0)),
      LastUpdated: new Date(),
      Status: inv.SoLuong === 0 ? 'Out of Stock' : inv.SoLuong < 10 ? 'Low Stock' : 'In Stock',
    }));

    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  // FB-03: Get all inventory levels
  async getAllInventoryLevels(page: number = 1, limit: number = 10): Promise<any> {
    const skip = (page - 1) * limit;
    const [inventories, total] = await this.inventoryRepo.findAndCount({
      relations: ['SanPham'],
      skip,
      take: limit,
      order: { MaKho: 'ASC', MaSanPham: 'ASC' },
    });

    const data = inventories.map(inv => ({
      MaSanPham: inv.MaSanPham,
      TenSanPham: inv.SanPham?.TenSanPham || 'Unknown',
      MaKho: inv.MaKho,
      SoLuong: inv.SoLuong,
      GiaTienSanPham: inv.SanPham?.GiaTienSanPham || 0,
      TotalValue: (inv.SoLuong * (inv.SanPham?.GiaTienSanPham || 0)),
      LastUpdated: new Date(),
      Status: inv.SoLuong === 0 ? 'Out of Stock' : inv.SoLuong < 10 ? 'Low Stock' : 'In Stock',
    }));

    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  // FB-03: Get low stock alerts
  async getLowStockAlerts(threshold: number = 10): Promise<any> {
    const lowStockItems = await this.inventoryRepo
      .createQueryBuilder('inventory')
      .leftJoinAndSelect('inventory.SanPham', 'sanpham')
      .where('inventory.SoLuong <= :threshold', { threshold })
      .orderBy('inventory.SoLuong', 'ASC')
      .getMany();

    const alerts = lowStockItems.map(inv => ({
      MaSanPham: inv.MaSanPham,
      TenSanPham: inv.SanPham?.TenSanPham || 'Unknown',
      MaKho: inv.MaKho,
      CurrentStock: inv.SoLuong,
      ThresholdLevel: threshold,
      DeficitCount: Math.max(0, threshold - inv.SoLuong),
    }));

    return {
      data: alerts,
      total: alerts.length,
      alertCount: alerts.length,
    };
  }

  // FB-03: Get inventory summary
  async getInventorySummary(): Promise<any> {
    const allInventories = await this.inventoryRepo.find({
      relations: ['SanPham'],
    });

    const khos = await this.khoRepo.find();
    let totalValue = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;

    allInventories.forEach(inv => {
      totalValue += inv.SoLuong * (inv.SanPham?.GiaTienSanPham || 0);
      if (inv.SoLuong === 0) outOfStockCount++;
      if (inv.SoLuong > 0 && inv.SoLuong < 10) lowStockCount++;
    });

    return {
      totalItems: allInventories.length,
      totalWarehouses: khos.length,
      totalValue,
      lowStockCount,
      outOfStockCount,
      lastUpdated: new Date(),
    };
  }

  // Helper: Update inventory after transaction
  async updateInventoryQuantity(khoId: string, productId: string, quantity: number): Promise<void> {
    let inventory = await this.inventoryRepo.findOne({
      where: { MaKho: khoId, MaSanPham: productId },
    });

    if (!inventory) {
      inventory = this.inventoryRepo.create({
        MaKho: khoId,
        MaSanPham: productId,
        SoLuong: quantity,
      });
    } else {
      inventory.SoLuong += quantity;
    }

    await this.inventoryRepo.save(inventory);
  }
}
