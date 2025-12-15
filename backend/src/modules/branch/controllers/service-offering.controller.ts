import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ServiceOfferingService } from '../services/service-offering.service';
import { CreateServiceOfferingDto, UpdateServiceOfferingDto } from '../dto/service-offering.dto';

@Controller('branch/services')
export class ServiceOfferingController {
  constructor(private serviceOfferingService: ServiceOfferingService) {}

  // FB-07: Create service offering
  @Post()
  async createServiceOffering(@Body() createDto: CreateServiceOfferingDto) {
    return this.serviceOfferingService.createServiceOffering(createDto);
  }

  // FB-07: Get all service offerings
  @Get()
  async getAllServiceOfferings(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.serviceOfferingService.getAllServiceOfferings(page, limit);
  }

  // FB-07: Get service offerings by branch
  @Get('branch/:branchId')
  async getServiceOfferingsByBranch(
    @Param('branchId') branchId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.serviceOfferingService.getServiceOfferingsByBranch(branchId, page, limit);
  }

  // FB-07: Get branch service menu
  @Get('menu/:branchId')
  async getBranchServiceMenu(@Param('branchId') branchId: string) {
    return this.serviceOfferingService.getBranchServiceMenu(branchId);
  }

  // FB-07: Update service offering
  @Put(':maChiNhanh/:maDichVu')
  async updateServiceOffering(
    @Param('maChiNhanh') maChiNhanh: string,
    @Param('maDichVu') maDichVu: string,
    @Body() updateDto: UpdateServiceOfferingDto,
  ) {
    return this.serviceOfferingService.updateServiceOffering(maChiNhanh, maDichVu, updateDto);
  }

  // FB-07: Delete service offering
  @Delete(':maChiNhanh/:maDichVu')
  async deleteServiceOffering(
    @Param('maChiNhanh') maChiNhanh: string,
    @Param('maDichVu') maDichVu: string,
  ) {
    await this.serviceOfferingService.deleteServiceOffering(maChiNhanh, maDichVu);
    return { success: true, message: 'Service offering deleted successfully' };
  }

  // FB-07: Get service popularity
  @Get('popularity/analysis')
  async getServicePopularity(@Query('limit') limit: number = 10) {
    return this.serviceOfferingService.getServicePopularity(limit);
  }
}
