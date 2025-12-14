import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { KhachHang } from '../../../entities/khach-hang.entity';
import { KhachHangThanhVien } from '../../../entities/khach-hang-thanh-vien.entity';
import { HoaDon } from '../../../entities/hoa-don.entity';
import { CreateCustomerDto, UpdateCustomerDto, CustomerResponseDto, CustomerStatisticsDto, InactiveCustomerDto } from '../dto/customer.dto';

@Injectable()
export class CustomerService {
  constructor(
    @InjectRepository(KhachHang)
    private customerRepository: Repository<KhachHang>,
    @InjectRepository(KhachHangThanhVien)
    private membershipRepository: Repository<KhachHangThanhVien>,
    @InjectRepository(HoaDon)
    private invoiceRepository: Repository<HoaDon>,
  ) {}

  async createCustomer(createCustomerDto: CreateCustomerDto): Promise<CustomerResponseDto> {
    try {
      const customer = new KhachHang();
      customer.HoTen = createCustomerDto.HoTen;
      customer.SoDienThoai = createCustomerDto.SoDienThoai;
      const savedCustomer = await this.customerRepository.save(customer);

      const membership = new KhachHangThanhVien();
      membership.MaKhachHang = savedCustomer.MaKhachHang;
      membership.TongChiTieu = 0;
      membership.TenHang = 'Bronze';
      if (createCustomerDto.Email) membership.Email = createCustomerDto.Email;
      if (createCustomerDto.CCCD) membership.CCCD = createCustomerDto.CCCD;
      if (createCustomerDto.DiaChi) membership.DiaChi = createCustomerDto.DiaChi;
      if (createCustomerDto.NgaySinh) membership.NgaySinh = createCustomerDto.NgaySinh;
      if (createCustomerDto.GioiTinh) membership.GioiTinh = createCustomerDto.GioiTinh;

      const savedMembership = await this.membershipRepository.save(membership);

      return this.mapCustomerToDto(savedCustomer, savedMembership);
    } catch (error) {
      throw new Error(`Failed to create customer: ${error.message}`);
    }
  }

  async getCustomerById(customerId: number): Promise<CustomerResponseDto> {
    try {
      const customer = await this.customerRepository.findOne({
        where: { MaKhachHang: customerId },
        relations: ['HoaDons'],
      });

      if (!customer) {
        throw new Error(`Customer with ID ${customerId} not found`);
      }

      const membership = await this.membershipRepository.findOne({
        where: { MaKhachHang: customerId },
      });

      return this.mapCustomerToDto(customer, membership);
    } catch (error) {
      throw new Error(`Failed to get customer: ${error.message}`);
    }
  }

  async getAllCustomers(
    page: number = 1,
    limit: number = 10,
    search?: string,
    tier?: string,
  ): Promise<{ data: CustomerResponseDto[]; total: number; page: number; totalPages: number }> {
    try {
      let memberQuery = this.membershipRepository.createQueryBuilder('m')
        .leftJoinAndSelect('m.KhachHang', 'c')
        .orderBy('m.MaKhachHang', 'DESC');

      if (search) {
        memberQuery = memberQuery.where('c.HoTen LIKE :search OR c.SoDienThoai LIKE :search', {
          search: `%${search}%`,
        });
      }

      if (tier) {
        memberQuery = memberQuery.andWhere('m.TenHang = :tier', { tier });
      }

      const [members, total] = await memberQuery
        .skip((page - 1) * limit)
        .take(limit)
        .getManyAndCount();

      const totalPages = Math.ceil(total / limit);

      return {
        data: members.map(m => this.mapCustomerToDto(m.KhachHang, m)),
        total,
        page,
        totalPages,
      };
    } catch (error) {
      throw new Error(`Failed to get customers: ${error.message}`);
    }
  }

  async updateCustomer(customerId: number, updateCustomerDto: UpdateCustomerDto): Promise<CustomerResponseDto> {
    try {
      const customer = await this.customerRepository.findOne({
        where: { MaKhachHang: customerId },
      });

      if (!customer) {
        throw new Error(`Customer with ID ${customerId} not found`);
      }

      if (updateCustomerDto.HoTen) customer.HoTen = updateCustomerDto.HoTen;

      const membership = await this.membershipRepository.findOne({
        where: { MaKhachHang: customerId },
      });

      if (membership) {
        if (updateCustomerDto.Email) membership.Email = updateCustomerDto.Email;
        if (updateCustomerDto.DiaChi) membership.DiaChi = updateCustomerDto.DiaChi;
        if (updateCustomerDto.NgaySinh) membership.NgaySinh = updateCustomerDto.NgaySinh;

        await this.membershipRepository.save(membership);
      }

      const updated = await this.customerRepository.save(customer);
      return this.mapCustomerToDto(updated, membership);
    } catch (error) {
      throw new Error(`Failed to update customer: ${error.message}`);
    }
  }

  async deleteCustomer(customerId: number): Promise<{ success: boolean; message: string }> {
    try {
      const customer = await this.customerRepository.findOne({
        where: { MaKhachHang: customerId },
      });

      if (!customer) {
        throw new Error(`Customer with ID ${customerId} not found`);
      }

      await this.customerRepository.remove(customer);

      return { success: true, message: `Customer ${customerId} deleted successfully` };
    } catch (error) {
      throw new Error(`Failed to delete customer: ${error.message}`);
    }
  }

  async getCustomerStatistics(): Promise<CustomerStatisticsDto> {
    try {
      const allMembers = await this.membershipRepository.find({
        relations: ['KhachHang'],
      });

      const totalSpending = allMembers.reduce((sum, m) => sum + (m.TongChiTieu || 0), 0);
      const averageSpending = allMembers.length > 0 ? totalSpending / allMembers.length : 0;

      const tierDistribution = {
        bronze: 0,
        silver: 0,
        gold: 0,
        platinum: 0,
      };

      allMembers.forEach(member => {
        const tier = (member.TenHang || 'Bronze').toLowerCase();
        if (tier === 'bronze') tierDistribution.bronze++;
        else if (tier === 'silver') tierDistribution.silver++;
        else if (tier === 'gold') tierDistribution.gold++;
        else if (tier === 'platinum') tierDistribution.platinum++;
      });

      const topSpenders = allMembers
        .sort((a, b) => (b.TongChiTieu || 0) - (a.TongChiTieu || 0))
        .slice(0, 10)
        .map(m => ({
          MaKhachHang: m.MaKhachHang,
          HoTen: m.KhachHang?.HoTen || '',
          SoDienThoai: m.KhachHang?.SoDienThoai || '',
          TongChiTieu: m.TongChiTieu || 0,
          TenHang: m.TenHang,
        })) as any[];

      return {
        totalCustomers: allMembers.length,
        activeCustomers: allMembers.length,
        inactiveCustomers: 0,
        totalSpending,
        averageSpending: Math.round(averageSpending * 100) / 100,
        tierDistribution,
        topSpenders,
      };
    } catch (error) {
      throw new Error(`Failed to get customer statistics: ${error.message}`);
    }
  }

  async getInactiveCustomers(daysSinceLastPurchase: number = 90): Promise<InactiveCustomerDto[]> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysSinceLastPurchase);

      const allMembers = await this.membershipRepository.find({
        relations: ['KhachHang'],
      });

      const inactiveCustomers: InactiveCustomerDto[] = [];

      for (const member of allMembers) {
        const invoices = await this.invoiceRepository.find({
          where: { MaKhachHang: member.MaKhachHang },
          order: { NgayLap: 'DESC' },
          take: 1,
        });

        const lastPurchaseDate = invoices.length > 0 ? invoices[0].NgayLap : null;

        if (!lastPurchaseDate || lastPurchaseDate < cutoffDate) {
          const days = lastPurchaseDate
            ? Math.floor((new Date().getTime() - lastPurchaseDate.getTime()) / (1000 * 60 * 60 * 24))
            : daysSinceLastPurchase;

          inactiveCustomers.push({
            MaKhachHang: member.MaKhachHang,
            HoTen: member.KhachHang?.HoTen || '',
            SoDienThoai: member.KhachHang?.SoDienThoai || '',
            Email: member.Email,
            TongChiTieu: member.TongChiTieu || 0,
            TenHang: member.TenHang,
            lastPurchaseDate: lastPurchaseDate || undefined,
            daysSinceLastPurchase: days,
          });
        }
      }

      return inactiveCustomers.sort((a, b) => b.daysSinceLastPurchase - a.daysSinceLastPurchase);
    } catch (error) {
      throw new Error(`Failed to get inactive customers: ${error.message}`);
    }
  }

  async getSpendingTrends(months: number = 12): Promise<{
    month: string;
    totalSpending: number;
    transactionCount: number;
  }[]> {
    try {
      const trends: { month: string; totalSpending: number; transactionCount: number }[] = [];
      const currentDate = new Date();

      for (let i = months - 1; i >= 0; i--) {
        const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
        const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i + 1, 0);

        const invoices = await this.invoiceRepository.find({
          where: {
            NgayLap: Between(startDate, endDate),
          },
        });

        const totalSpending = invoices.reduce((sum, inv) => sum + (inv.TongTien || 0), 0);

        trends.push({
          month: `${startDate.getMonth() + 1}/${startDate.getFullYear()}`,
          totalSpending,
          transactionCount: invoices.length,
        });
      }

      return trends;
    } catch (error) {
      throw new Error(`Failed to get spending trends: ${error.message}`);
    }
  }

  async searchCustomers(query: string): Promise<CustomerResponseDto[]> {
    try {
      const members = await this.membershipRepository
        .createQueryBuilder('m')
        .leftJoinAndSelect('m.KhachHang', 'c')
        .where('c.HoTen LIKE :query', { query: `%${query}%` })
        .orWhere('c.SoDienThoai LIKE :query', { query: `%${query}%` })
        .orWhere('m.Email LIKE :query', { query: `%${query}%` })
        .orderBy('c.HoTen', 'ASC')
        .getMany();

      return members.map(m => this.mapCustomerToDto(m.KhachHang, m));
    } catch (error) {
      throw new Error(`Failed to search customers: ${error.message}`);
    }
  }

  async updateCustomerTier(customerId: number, tier: string, totalSpending: number): Promise<CustomerResponseDto> {
    try {
      const member = await this.membershipRepository.findOne({
        where: { MaKhachHang: customerId },
        relations: ['KhachHang'],
      });

      if (!member) {
        throw new Error(`Customer with ID ${customerId} not found`);
      }

      member.TenHang = tier;
      member.TongChiTieu = totalSpending;

      const updated = await this.membershipRepository.save(member);
      return this.mapCustomerToDto(member.KhachHang, updated);
    } catch (error) {
      throw new Error(`Failed to update customer tier: ${error.message}`);
    }
  }

  async getCustomersByTier(tier: string): Promise<CustomerResponseDto[]> {
    try {
      const members = await this.membershipRepository.find({
        where: { TenHang: tier },
        relations: ['KhachHang'],
      });

      return members.map(m => this.mapCustomerToDto(m.KhachHang, m));
    } catch (error) {
      throw new Error(`Failed to get customers by tier: ${error.message}`);
    }
  }

  async exportCustomersToCsv(): Promise<string> {
    try {
      const members = await this.membershipRepository.find({
        relations: ['KhachHang'],
      });

      let csv = 'MaKhachHang,HoTen,SoDienThoai,Email,DiaChi,TongChiTieu,TenHang\n';

      members.forEach(m => {
        csv += `${m.MaKhachHang},"${m.KhachHang?.HoTen || ''}","${m.KhachHang?.SoDienThoai || ''}","${m.Email || ''}","${m.DiaChi || ''}",${m.TongChiTieu || 0},"${m.TenHang}"\n`;
      });

      return csv;
    } catch (error) {
      throw new Error(`Failed to export customers: ${error.message}`);
    }
  }

  private mapCustomerToDto(customer: KhachHang, membership: KhachHangThanhVien | null): CustomerResponseDto {
    return {
      MaKhachHang: customer.MaKhachHang,
      HoTen: customer.HoTen,
      SoDienThoai: customer.SoDienThoai,
      Email: membership?.Email || undefined,
      CCCD: membership?.CCCD || undefined,
      DiaChi: membership?.DiaChi || undefined,
      NgaySinh: membership?.NgaySinh || undefined,
      GioiTinh: membership?.GioiTinh || undefined,
      TongChiTieu: membership?.TongChiTieu || 0,
      TenHang: membership?.TenHang || 'Bronze',
      IsActive: true,
    };
  }
}
