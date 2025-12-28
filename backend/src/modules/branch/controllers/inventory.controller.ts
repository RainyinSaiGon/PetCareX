import { Controller, Get, Post, Put, Body, Param, Query } from '@nestjs/common';
import { InventoryService } from '../services/inventory.service';
import { CreateInventoryImportDto, CreateInventoryExportDto } from '../dto/inventory.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChiNhanh } from '../../../entities/chi-nhanh.entity';

@Controller('branch/inventory')
export class InventoryController {
  constructor(
    private inventoryService: InventoryService,
    @InjectRepository(ChiNhanh) private branchRepo: Repository<ChiNhanh>,
  ) {}

  // Get all branches
  @Get('branches')
  async getBranches() {
    try {
      const branches = await this.branchRepo.find();
      return {
        success: true,
        data: branches
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  // Create inventory import
  @Post('import')
  async createInventoryImport(@Body() importDto: CreateInventoryImportDto) {
    return this.inventoryService.createInventoryImport(importDto);
  }

  // Create inventory export
  @Post('export')
  async createInventoryExport(@Body() exportDto: CreateInventoryExportDto) {
    return this.inventoryService.createInventoryExport(exportDto);
  }

  // Get inventory levels by branch
  @Get('branch/:branchId')
  async getInventoryLevelsByBranch(
    @Param('branchId') branchId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.inventoryService.getInventoryLevelsByBranch(branchId, page, limit);
  }

  // Get all inventory levels
  @Get()
  async getAllInventoryLevels(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.inventoryService.getAllInventoryLevels(page, limit);
  }

  // Get low stock alerts
  @Get('alerts/low-stock')
  async getLowStockAlerts(@Query('threshold') threshold: number = 10) {
    return this.inventoryService.getLowStockAlerts(threshold);
  }

  // Get inventory summary
  @Get('summary/all')
  async getInventorySummary() {
    return this.inventoryService.getInventorySummary();
  }

  // Get inventory by warehouse
  @Get('warehouse/:warehouseId')
  async getInventoryByWarehouse(@Param('warehouseId') warehouseId: string) {
    return this.inventoryService.getInventoryByWarehouse(warehouseId);
  }

  // Search inventory
  @Get('search/:query')
  async searchInventory(
    @Param('query') query: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.inventoryService.searchInventory(query, page, limit);
  }

  // Update inventory quantity
  @Put('update/:khoId/:maSanPham')
  async updateInventoryQuantity(
    @Param('khoId') khoId: string,
    @Param('maSanPham') maSanPham: string,
    @Body() body: { newQuantity: number },
  ) {
    return this.inventoryService.updateInventoryQuantity(khoId, maSanPham, body.newQuantity);
  }
}
