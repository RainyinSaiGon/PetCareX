import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChiTietTonKho } from '../../../entities/chi-tiet-ton-kho.entity';
import { SanPham } from '../../../entities/san-pham.entity';
import { Kho } from '../../../entities/kho.entity';
import { ChiNhanh } from '../../../entities/chi-nhanh.entity';
import { CreateInventoryImportDto, CreateInventoryExportDto } from '../dto/inventory.dto';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(ChiTietTonKho) private inventoryRepo: Repository<ChiTietTonKho>,
    @InjectRepository(SanPham) private productRepo: Repository<SanPham>,
    @InjectRepository(Kho) private khoRepo: Repository<Kho>,
    @InjectRepository(ChiNhanh) private branchRepo: Repository<ChiNhanh>,
  ) {}

  // Create inventory import transaction with validation
  async createInventoryImport(importDto: CreateInventoryImportDto): Promise<any> {
    const { MaChiNhanh, MaSanPham, SoLuong, GhiChu } = importDto;

    // Validate inputs
    if (!MaChiNhanh || !MaSanPham || SoLuong <= 0) {
      throw new BadRequestException('Invalid import data');
    }

    const maSanPhamStr = String(MaSanPham).padStart(5, '0');

    // Verify branch and product exist
    const branch = await this.branchRepo.findOne({ where: { MaChiNhanh } });
    if (!branch) {
      throw new NotFoundException(`Branch ${MaChiNhanh} not found`);
    }

    const product = await this.productRepo.findOne({ where: { MaSanPham: maSanPhamStr } });
    if (!product) {
      throw new NotFoundException(`Product ${MaSanPham} not found`);
    }

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

    const oldQuantity = inventory.SoLuong;
    inventory.SoLuong += SoLuong;
    const savedInventory = await this.inventoryRepo.save(inventory);

    return {
      success: true,
      message: `Imported ${SoLuong} units successfully`,
      data: {
        MaChiNhanh,
        MaSanPham: maSanPhamStr,
        TenSanPham: product.TenSanPham,
        OldQuantity: oldQuantity,
        ImportedQuantity: SoLuong,
        NewQuantity: savedInventory.SoLuong,
        Timestamp: new Date(),
        Note: GhiChu || '',
      },
    };
  }

  // Create inventory export transaction with validation
  async createInventoryExport(exportDto: CreateInventoryExportDto): Promise<any> {
    const { MaChiNhanh, MaSanPham, SoLuong, GhiChu } = exportDto;

    // Validate inputs
    if (!MaChiNhanh || !MaSanPham || SoLuong <= 0) {
      throw new BadRequestException('Invalid export data');
    }

    const maSanPhamStr = String(MaSanPham).padStart(5, '0');

    // Verify branch and product exist
    const branch = await this.branchRepo.findOne({ where: { MaChiNhanh } });
    if (!branch) {
      throw new NotFoundException(`Branch ${MaChiNhanh} not found`);
    }

    const product = await this.productRepo.findOne({ where: { MaSanPham: maSanPhamStr } });
    if (!product) {
      throw new NotFoundException(`Product ${MaSanPham} not found`);
    }

    const inventory = await this.inventoryRepo.findOne({
      where: { MaKho: MaChiNhanh, MaSanPham: maSanPhamStr },
    });

    // Check if product exists and has sufficient stock
    if (!inventory || inventory.SoLuong < SoLuong) {
      throw new BadRequestException(
        `Insufficient inventory. Available: ${inventory?.SoLuong || 0}, Requested: ${SoLuong}`
      );
    }

    const oldQuantity = inventory.SoLuong;
    inventory.SoLuong -= SoLuong;
    const savedInventory = await this.inventoryRepo.save(inventory);

    return {
      success: true,
      message: `Exported ${SoLuong} units successfully`,
      data: {
        MaChiNhanh,
        MaSanPham: maSanPhamStr,
        TenSanPham: product.TenSanPham,
        OldQuantity: oldQuantity,
        ExportedQuantity: SoLuong,
        NewQuantity: savedInventory.SoLuong,
        Timestamp: new Date(),
        Note: GhiChu || '',
      },
    };
  }

  // Get inventory levels for specific branch
  async getInventoryLevelsByBranch(branchId: string, page: number = 1, limit: number = 10): Promise<any> {
    const skip = (page - 1) * limit;

    // Verify branch exists
    const branch = await this.branchRepo.findOne({ where: { MaChiNhanh: branchId } });
    if (!branch) {
      throw new NotFoundException(`Branch ${branchId} not found`);
    }

    const [inventories, total] = await this.inventoryRepo.findAndCount({
      where: { MaKho: branchId },
      relations: ['SanPham'],
      skip,
      take: limit,
      order: { MaSanPham: 'ASC' },
    });

    const data = inventories.map(inv => this.formatInventoryLevel(inv, branch.TenChiNhanh));

    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      branchId,
      branchName: branch.TenChiNhanh,
    };
  }

  // Get all inventory levels across all branches
  async getAllInventoryLevels(page: number = 1, limit: number = 10): Promise<any> {
    const skip = (page - 1) * limit;

    const [inventories, total] = await this.inventoryRepo.findAndCount({
      relations: ['SanPham'],
      skip,
      take: limit,
      order: { MaKho: 'ASC', MaSanPham: 'ASC' },
    });

    const branches = await this.branchRepo.find();
    const branchMap = new Map(branches.map(b => [b.MaChiNhanh, b.TenChiNhanh]));

    const data = inventories.map(inv => 
      this.formatInventoryLevel(inv, branchMap.get(inv.MaKho) || 'Unknown')
    );

    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      lastUpdated: new Date(),
    };
  }

  // Get low stock alerts
  async getLowStockAlerts(threshold: number = 10): Promise<any> {
    const lowStockItems = await this.inventoryRepo
      .createQueryBuilder('inventory')
      .leftJoinAndSelect('inventory.SanPham', 'sanpham')
      .where('inventory.SoLuong <= :threshold', { threshold })
      .orderBy('inventory.SoLuong', 'ASC')
      .getMany();

    const branches = await this.branchRepo.find();
    const branchMap = new Map(branches.map(b => [b.MaChiNhanh, b.TenChiNhanh]));

    const alerts = lowStockItems.map(inv => ({
      MaSanPham: inv.MaSanPham,
      TenSanPham: inv.SanPham?.TenSanPham || 'Unknown',
      MaChiNhanh: inv.MaKho,
      TenChiNhanh: branchMap.get(inv.MaKho) || 'Unknown',
      CurrentStock: inv.SoLuong,
      ThresholdLevel: threshold,
      DeficitCount: Math.max(0, threshold - inv.SoLuong),
      UrgencyLevel: this.getUrgencyLevel(inv.SoLuong),
      ReorderQuantity: Math.max(50, threshold * 2),
    }));

    return {
      data: alerts,
      total: alerts.length,
      alertCount: alerts.length,
      threshold,
      criticalItems: alerts.filter(a => a.CurrentStock === 0).length,
      lowItems: alerts.filter(a => a.CurrentStock > 0 && a.CurrentStock < threshold / 2).length,
    };
  }

  // Get inventory summary dashboard
  async getInventorySummary(): Promise<any> {
    const allInventories = await this.inventoryRepo.find({
      relations: ['SanPham'],
    });

    const branches = await this.branchRepo.find();
    const khos = await this.khoRepo.find();

    let totalValue = 0;
    let totalQuantity = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;
    let inStockCount = 0;

    allInventories.forEach(inv => {
      const value = inv.SoLuong * (inv.SanPham?.GiaTienSanPham || 0);
      totalValue += value;
      totalQuantity += inv.SoLuong;

      if (inv.SoLuong === 0) {
        outOfStockCount++;
      } else if (inv.SoLuong < 10) {
        lowStockCount++;
      } else {
        inStockCount++;
      }
    });

    const topLowStockItems = allInventories
      .filter(inv => inv.SoLuong > 0 && inv.SoLuong < 20)
      .sort((a, b) => a.SoLuong - b.SoLuong)
      .slice(0, 5)
      .map(inv => ({
        MaSanPham: inv.MaSanPham,
        TenSanPham: inv.SanPham?.TenSanPham,
        CurrentStock: inv.SoLuong,
        Branch: inv.MaKho,
      }));

    return {
      summary: {
        totalItems: allInventories.length,
        totalBranches: branches.length,
        totalWarehouses: khos.length,
        totalValue,
        totalQuantity,
        inStockCount,
        lowStockCount,
        outOfStockCount,
        lastUpdated: new Date(),
      },
      topLowStockItems,
      inventoryHealth: this.calculateInventoryHealth(inStockCount, lowStockCount, outOfStockCount),
    };
  }

  // Get inventory by warehouse
  async getInventoryByWarehouse(warehouseId: string): Promise<any> {
    const warehouse = await this.khoRepo.findOne({ where: { MaKho: warehouseId } });
    if (!warehouse) {
      throw new NotFoundException(`Warehouse ${warehouseId} not found`);
    }

    const inventories = await this.inventoryRepo.find({
      where: { MaKho: warehouseId },
      relations: ['SanPham'],
      order: { MaSanPham: 'ASC' },
    });

    const data = inventories.map(inv => ({
      MaSanPham: inv.MaSanPham,
      TenSanPham: inv.SanPham?.TenSanPham || 'Unknown',
      SoLuong: inv.SoLuong,
      GiaThanh: inv.SanPham?.GiaTienSanPham || 0,
      TotalValue: inv.SoLuong * (inv.SanPham?.GiaTienSanPham || 0),
      Status: this.getInventoryStatus(inv.SoLuong),
    }));

    const totalValue = data.reduce((sum, item) => sum + item.TotalValue, 0);

    return {
      warehouseId,
      data,
      totalItems: data.length,
      totalValue,
      totalQuantity: data.reduce((sum, item) => sum + item.SoLuong, 0),
    };
  }

  // Search inventory
  async searchInventory(query: string, page: number = 1, limit: number = 10): Promise<any> {
    const skip = (page - 1) * limit;

    const [inventories, total] = await this.inventoryRepo
      .createQueryBuilder('inventory')
      .leftJoinAndSelect('inventory.SanPham', 'sanpham')
      .where('sanpham.TenSanPham LIKE :query', { query: `%${query}%` })
      .orWhere('inventory.MaSanPham LIKE :query', { query: `%${query}%` })
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    const branches = await this.branchRepo.find();
    const branchMap = new Map(branches.map(b => [b.MaChiNhanh, b.TenChiNhanh]));

    const data = inventories.map(inv =>
      this.formatInventoryLevel(inv, branchMap.get(inv.MaKho) || 'Unknown')
    );

    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      query,
    };
  }

  // Update inventory quantity directly (admin only)
  async updateInventoryQuantity(khoId: string, maSanPham: string, newQuantity: number): Promise<any> {
    if (newQuantity < 0) {
      throw new BadRequestException('Quantity cannot be negative');
    }

    const inventory = await this.inventoryRepo.findOne({
      where: { MaKho: khoId, MaSanPham: maSanPham },
      relations: ['SanPham'],
    });

    if (!inventory) {
      throw new NotFoundException('Inventory record not found');
    }

    const oldQuantity = inventory.SoLuong;
    inventory.SoLuong = newQuantity;
    await this.inventoryRepo.save(inventory);

    return {
      success: true,
      message: 'Inventory updated successfully',
      data: {
        MaKho: khoId,
        MaSanPham: maSanPham,
        TenSanPham: inventory.SanPham?.TenSanPham,
        OldQuantity: oldQuantity,
        NewQuantity: newQuantity,
        UpdatedAt: new Date(),
      },
    };
  }

  // Helper: Format inventory level
  private formatInventoryLevel(inventory: ChiTietTonKho, branchName: string): any {
    return {
      MaSanPham: inventory.MaSanPham,
      TenSanPham: inventory.SanPham?.TenSanPham || 'Unknown',
      LoaiSanPham: inventory.SanPham?.LoaiSanPham || 'Hàng Hóa',
      HinhAnh: inventory.SanPham?.HinhAnh || 'https://via.placeholder.com/300x300?text=No+Image',
      MaChiNhanh: inventory.MaKho,
      TenChiNhanh: branchName,
      SoLuong: inventory.SoLuong,
      GiaThanh: inventory.SanPham?.GiaTienSanPham || 0,
      TotalValue: inventory.SoLuong * (inventory.SanPham?.GiaTienSanPham || 0),
      LastUpdated: new Date(),
      Status: this.getInventoryStatus(inventory.SoLuong),
    };
  }

  // Helper: Get inventory status
  private getInventoryStatus(quantity: number): string {
    if (quantity === 0) return 'Out of Stock';
    if (quantity < 10) return 'Low Stock';
    return 'In Stock';
  }

  // Helper: Get urgency level
  private getUrgencyLevel(quantity: number): string {
    if (quantity === 0) return 'Critical';
    if (quantity < 5) return 'High';
    return 'Medium';
  }

  // Helper: Calculate inventory health
  private calculateInventoryHealth(inStock: number, lowStock: number, outOfStock: number): string {
    const total = inStock + lowStock + outOfStock;
    if (total === 0) return 'Excellent';

    const healthPercentage = (inStock / total) * 100;
    if (healthPercentage >= 80) return 'Excellent';
    if (healthPercentage >= 60) return 'Good';
    if (healthPercentage >= 40) return 'Fair';
    return 'Poor';
  }
}
