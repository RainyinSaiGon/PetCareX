import { IsNotEmpty, IsString, IsOptional, IsInt, IsDecimal, IsPositive } from 'class-validator';

// FB-03: Inventory Management DTOs
export class CreateInventoryImportDto {
  @IsNotEmpty({ message: 'Chi nhánh là bắt buộc' })
  @IsString()
  MaChiNhanh: string;

  @IsNotEmpty({ message: 'Sản phẩm là bắt buộc' })
  @IsInt()
  MaSanPham: number;

  @IsNotEmpty({ message: 'Số lượng là bắt buộc' })
  @IsInt()
  @IsPositive()
  SoLuong: number;

  @IsOptional()
  @IsString()
  GhiChu?: string;
}

export class CreateInventoryExportDto {
  @IsNotEmpty({ message: 'Chi nhánh là bắt buộc' })
  @IsString()
  MaChiNhanh: string;

  @IsNotEmpty({ message: 'Sản phẩm là bắt buộc' })
  @IsInt()
  MaSanPham: number;

  @IsNotEmpty({ message: 'Số lượng là bắt buộc' })
  @IsInt()
  @IsPositive()
  SoLuong: number;

  @IsOptional()
  @IsString()
  GhiChu?: string;
}

export class InventoryLevelDto {
  MaSanPham: number;
  TenSanPham: string;
  MaChiNhanh: string;
  TenChiNhanh: string;
  SoLuong: number;
  GiaThanh: number;
  TotalValue: number;
  LastUpdated: Date;
  Status: 'In Stock' | 'Low Stock' | 'Out of Stock';
}

export class InventoryListDto {
  data: InventoryLevelDto[];
  total: number;
  page: number;
  totalPages: number;
}

export class InventoryTransactionDto {
  MaChiTiet: number;
  MaSanPham: number;
  TenSanPham: string;
  MaChiNhanh: string;
  SoLuong: number;
  TransactionType: 'Import' | 'Export';
  NgayTao: Date;
  GhiChu: string;
}

export class InventoryTransactionListDto {
  data: InventoryTransactionDto[];
  total: number;
  page: number;
  totalPages: number;
}

export class LowStockAlertDto {
  MaSanPham: number;
  TenSanPham: string;
  MaChiNhanh: string;
  TenChiNhanh: string;
  CurrentStock: number;
  ThresholdLevel: number;
  DeficitCount: number;
}

export class LowStockAlertListDto {
  data: LowStockAlertDto[];
  total: number;
  alertCount: number;
}

export class InventorySummaryDto {
  totalItems: number;
  totalBranches: number;
  totalValue: number;
  lowStockCount: number;
  outOfStockCount: number;
  lastUpdated: Date;
}
