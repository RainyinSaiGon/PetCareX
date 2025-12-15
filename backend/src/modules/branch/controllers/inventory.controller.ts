import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { InventoryService } from '../services/inventory.service';
import { CreateInventoryImportDto, CreateInventoryExportDto } from '../dto/inventory.dto';

@Controller('branch/inventory')
export class InventoryController {
  constructor(private inventoryService: InventoryService) {}

  // FB-03: Create inventory import
  @Post('import')
  async createInventoryImport(@Body() importDto: CreateInventoryImportDto) {
    return this.inventoryService.createInventoryImport(importDto);
  }

  // FB-03: Create inventory export
  @Post('export')
  async createInventoryExport(@Body() exportDto: CreateInventoryExportDto) {
    return this.inventoryService.createInventoryExport(exportDto);
  }

  // FB-03: Get inventory levels by branch
  @Get('branch/:branchId')
  async getInventoryLevelsByBranch(
    @Param('branchId') branchId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.inventoryService.getInventoryLevelsByBranch(branchId, page, limit);
  }

  // FB-03: Get all inventory levels
  @Get()
  async getAllInventoryLevels(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.inventoryService.getAllInventoryLevels(page, limit);
  }

  // FB-03: Get low stock alerts
  @Get('alerts/low-stock')
  async getLowStockAlerts(@Query('threshold') threshold: number = 10) {
    return this.inventoryService.getLowStockAlerts(threshold);
  }

  // FB-03: Get inventory summary
  @Get('summary/all')
  async getInventorySummary() {
    return this.inventoryService.getInventorySummary();
  }
}
