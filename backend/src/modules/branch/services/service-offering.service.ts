import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CungCapDichVu } from '../../../entities/cung-cap-dich-vu.entity';
import { DichVuYTe } from '../../../entities/dich-vu-y-te.entity';
import { ChiNhanh } from '../../../entities/chi-nhanh.entity';
import { CreateServiceOfferingDto, UpdateServiceOfferingDto, ServiceOfferingDto, BranchServiceMenuDto } from '../dto/service-offering.dto';

@Injectable()
export class ServiceOfferingService {
  constructor(
    @InjectRepository(CungCapDichVu) private serviceOfferingRepo: Repository<CungCapDichVu>,
    @InjectRepository(DichVuYTe) private serviceRepo: Repository<DichVuYTe>,
    @InjectRepository(ChiNhanh) private branchRepo: Repository<ChiNhanh>,
  ) {}

  // FB-07: Create new service offering
  async createServiceOffering(createDto: CreateServiceOfferingDto): Promise<ServiceOfferingDto> {
    const { MaChiNhanh, MaDichVu } = createDto;

    // Check if offering already exists
    const existing = await this.serviceOfferingRepo.findOne({
      where: { MaChiNhanh, MaDichVu },
    });

    if (existing) {
      throw new Error('Service offering already exists for this branch');
    }

    const offering = this.serviceOfferingRepo.create({
      MaChiNhanh,
      MaDichVu,
    });

    const saved = await this.serviceOfferingRepo.save(offering);
    return this.mapToDto(saved);
  }

  // FB-07: Get all service offerings with pagination
  async getAllServiceOfferings(page: number = 1, limit: number = 10): Promise<any> {
    const skip = (page - 1) * limit;
    const [offerings, total] = await this.serviceOfferingRepo.findAndCount({
      relations: ['ChiNhanh', 'DichVu'],
      skip,
      take: limit,
      order: { MaChiNhanh: 'ASC' },
    });

    return {
      data: offerings.map(o => this.mapToDto(o)),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  // FB-07: Get service offerings by branch
  async getServiceOfferingsByBranch(branchId: string, page: number = 1, limit: number = 10): Promise<any> {
    const skip = (page - 1) * limit;
    const [offerings, total] = await this.serviceOfferingRepo.findAndCount({
      where: { MaChiNhanh: branchId },
      relations: ['ChiNhanh', 'DichVu'],
      skip,
      take: limit,
      order: { DichVu: { TenDichVu: 'ASC' } },
    });

    return {
      data: offerings.map(o => this.mapToDto(o)),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  // FB-07: Get branch service menu
  async getBranchServiceMenu(branchId: string): Promise<BranchServiceMenuDto> {
    const branch = await this.branchRepo.findOne({
      where: { MaChiNhanh: branchId },
    });

    if (!branch) {
      throw new Error('Branch not found');
    }

    const offerings = await this.serviceOfferingRepo.find({
      where: { MaChiNhanh: branchId },
      relations: ['DichVu'],
      order: { DichVu: { TenDichVu: 'ASC' } },
    });

    return {
      MaChiNhanh: branch.MaChiNhanh,
      TenChiNhanh: branch.TenChiNhanh,
      Services: offerings.map(o => this.mapToDto(o)),
      TotalServices: offerings.length,
    };
  }

  // FB-07: Update service offering
  async updateServiceOffering(
    maChiNhanh: string,
    maDichVu: string,
    updateDto: UpdateServiceOfferingDto,
  ): Promise<ServiceOfferingDto> {
    // Since the entity only has MaChiNhanh and MaDichVu (no other updateable fields),
    // we just need to ensure the record exists and return it
    const existing = await this.serviceOfferingRepo.findOne({
      where: { MaChiNhanh: maChiNhanh, MaDichVu: maDichVu },
      relations: ['ChiNhanh', 'DichVu'],
    });

    if (!existing) throw new Error('Service offering not found');
    return this.mapToDto(existing);
  }

  // FB-07: Delete service offering
  async deleteServiceOffering(maChiNhanh: string, maDichVu: string): Promise<void> {
    const result = await this.serviceOfferingRepo.delete({
      MaChiNhanh: maChiNhanh,
      MaDichVu: maDichVu,
    });
    if (result.affected === 0) throw new Error('Service offering not found');
  }

  // FB-07: Get service popularity
  async getServicePopularity(limit: number = 10): Promise<any> {
    const offerings = await this.serviceOfferingRepo.find({
      relations: ['DichVu', 'ChiNhanh'],
    });

    // Group by service and count offerings
    const serviceMap = new Map();

    offerings.forEach(offering => {
      const serviceId = offering.MaDichVu;
      if (!serviceMap.has(serviceId)) {
        serviceMap.set(serviceId, {
          MaDichVu: offering.MaDichVu,
          TenDichVu: offering.DichVu?.TenDichVu || 'Unknown',
          BranchCount: 0,
          TotalBranches: 0,
        });
      }
      const service = serviceMap.get(serviceId);
      service.BranchCount++;
    });

    const totalBranches = await this.branchRepo.count();

    const popularServices = Array.from(serviceMap.values())
      .map(s => ({
        ...s,
        TotalBranches: totalBranches,
        IsOfferedByAll: s.BranchCount === totalBranches,
        UsageCount: 0,
        TotalRevenue: 0,
        AverageRating: 0,
        OfferedByBranchCount: s.BranchCount,
      }))
      .sort((a, b) => b.BranchCount - a.BranchCount)
      .slice(0, limit);

    return {
      data: popularServices,
      total: popularServices.length,
    };
  }

  // Helper method
  private mapToDto(offering: CungCapDichVu): ServiceOfferingDto {
    return {
      MaChiNhanh: offering.MaChiNhanh,
      TenChiNhanh: offering.ChiNhanh?.TenChiNhanh || 'Unknown',
      MaDichVu: offering.MaDichVu,
      TenDichVu: offering.DichVu?.TenDichVu || 'Unknown',
      GiaThanhLe: 0,
      GhiChu: '',
      NgayTao: new Date(),
      IsActive: true,
    };
  }
}
