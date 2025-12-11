import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThan } from 'typeorm';
import { KhachHang } from '../../entities/khach-hang.entity';
import { KhachHangThanhVien } from '../../entities/khach-hang-thanh-vien.entity';
import { HoaDon } from '../../entities/hoa-don.entity';
import { CreateCustomerDto, UpdateCustomerDto, CustomerResponseDto, CustomerStatisticsDto, InactiveCustomerDto } from './dto/customer.dto';

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

  /**
   * Create a new customer
   */
  async createCustomer(createCustomerDto: CreateCustomerDto): Promise<CustomerResponseDto> {
    try {
      const customer = this.customerRepository.create({
        HoTen: createCustomerDto.HoTen,
        SoDienThoai: createCustomerDto.SoDienThoai,
        Email: createCustomerDto.Email || null,
        CCCD: createCustomerDto.CCCD || null,
        DiaChi: createCustomerDto.DiaChi || null,
        NgaySinh: createCustomerDto.NgaySinh || null,
        GioiTinh: createCustomerDto.GioiTinh || 'Khác',
        TongChiTieu: 0,
        TenHang: 'Bronze', // Default tier
      });

      const savedCustomer = await this.customerRepository.save(customer);

      // Create initial membership record
      await this.membershipRepository.create({
        MaKhachHang: savedCustomer.MaKhachHang,
        TenHang: 'Bronze',
        TongChiTieu: 0,
        TongDiem: 0,
      });

      return this.mapCustomerToDto(savedCustomer);
    } catch (error) {
      throw new Error(`Failed to create customer: ${error.message}`);
    }
  }

  /**
   * Get customer by ID with full details
   */
  async getCustomerById(customerId: number): Promise<CustomerResponseDto> {
    try {
      const customer = await this.customerRepository.findOne({
        where: { MaKhachHang: customerId },
        relations: ['HoaDons', 'KhachHangThanhVien'],
      });

      if (!customer) {
        throw new Error(`Customer with ID ${customerId} not found`);
      }

      return this.mapCustomerToDto(customer);
    } catch (error) {
      throw new Error(`Failed to get customer: ${error.message}`);
    }
  }

  /**
   * Get all customers with pagination and filtering
   */
  async getAllCustomers(
    page: number = 1,
    limit: number = 10,
    search?: string,
    tier?: string,
  ): Promise<{ data: CustomerResponseDto[]; total: number; page: number; totalPages: number }> {
    try {
      let query = this.customerRepository.createQueryBuilder('c')
        .leftJoinAndSelect('c.HoaDons', 'invoices')
        .orderBy('c.MaKhachHang', 'DESC');

      // Search filter
      if (search) {
        query = query.where('c.HoTen LIKE :search OR c.SoDienThoai LIKE :search', {
          search: `%${search}%`,
        });
      }

      // Tier filter
      if (tier) {
        query = query.andWhere('c.TenHang = :tier', { tier });
      }

      const [customers, total] = await query
        .skip((page - 1) * limit)
        .take(limit)
        .getManyAndCount();

      const totalPages = Math.ceil(total / limit);

      return {
        data: customers.map(c => this.mapCustomerToDto(c)),
        total,
        page,
        totalPages,
      };
    } catch (error) {
      throw new Error(`Failed to get customers: ${error.message}`);
    }
  }

  /**
   * Update customer information
   */
  async updateCustomer(customerId: number, updateCustomerDto: UpdateCustomerDto): Promise<CustomerResponseDto> {
    try {
      const customer = await this.customerRepository.findOne({
        where: { MaKhachHang: customerId },
      });

      if (!customer) {
        throw new Error(`Customer with ID ${customerId} not found`);
      }

      // Update only provided fields
      if (updateCustomerDto.HoTen) customer.HoTen = updateCustomerDto.HoTen;
      if (updateCustomerDto.Email) customer.Email = updateCustomerDto.Email;
      if (updateCustomerDto.DiaChi) customer.DiaChi = updateCustomerDto.DiaChi;
      if (updateCustomerDto.NgaySinh) customer.NgaySinh = updateCustomerDto.NgaySinh;
      if (updateCustomerDto.GioiTinh) customer.GioiTinh = updateCustomerDto.GioiTinh;

      const updated = await this.customerRepository.save(customer);
      return this.mapCustomerToDto(updated);
    } catch (error) {
      throw new Error(`Failed to update customer: ${error.message}`);
    }
  }

  /**
   * Delete customer (soft delete by marking inactive)
   */
  async deleteCustomer(customerId: number): Promise<{ success: boolean; message: string }> {
    try {
      const customer = await this.customerRepository.findOne({
        where: { MaKhachHang: customerId },
      });

      if (!customer) {
        throw new Error(`Customer with ID ${customerId} not found`);
      }

      // Soft delete: mark as inactive
      customer.IsActive = false;
      await this.customerRepository.save(customer);

      return { success: true, message: `Customer ${customerId} deactivated successfully` };
    } catch (error) {
      throw new Error(`Failed to delete customer: ${error.message}`);
    }
  }

  /**
   * Get customer statistics (FS-02)
   */
  async getCustomerStatistics(): Promise<CustomerStatisticsDto> {
    try {
      // Get all customers
      const allCustomers = await this.customerRepository.find({
        relations: ['HoaDons', 'KhachHangThanhVien'],
      });

      // Calculate basic statistics
      const activeCustomers = allCustomers.filter(c => c.IsActive !== false).length;
      const inactiveCustomers = allCustomers.filter(c => c.IsActive === false).length;
      const totalSpending = allCustomers.reduce((sum, c) => sum + (c.TongChiTieu || 0), 0);
      const averageSpending = activeCustomers > 0 ? totalSpending / activeCustomers : 0;

      // Tier distribution
      const tierDistribution = {
        bronze: 0,
        silver: 0,
        gold: 0,
        platinum: 0,
      };

      allCustomers.forEach(customer => {
        const tier = (customer.TenHang || 'Bronze').toLowerCase();
        if (tier === 'bronze') tierDistribution.bronze++;
        else if (tier === 'silver') tierDistribution.silver++;
        else if (tier === 'gold') tierDistribution.gold++;
        else if (tier === 'platinum') tierDistribution.platinum++;
      });

      // Top 10 spenders
      const topSpenders = allCustomers
        .sort((a, b) => (b.TongChiTieu || 0) - (a.TongChiTieu || 0))
        .slice(0, 10)
        .map(c => ({
          MaKhachHang: c.MaKhachHang,
          HoTen: c.HoTen,
          SoDienThoai: c.SoDienThoai,
          TongChiTieu: c.TongChiTieu || 0,
          TenHang: c.TenHang,
        }));

      return {
        totalCustomers: allCustomers.length,
        activeCustomers,
        inactiveCustomers,
        totalSpending,
        averageSpending: Math.round(averageSpending * 100) / 100,
        tierDistribution,
        topSpenders,
      };
    } catch (error) {
      throw new Error(`Failed to get customer statistics: ${error.message}`);
    }
  }

  /**
   * Get inactive customers (FS-02 - Inactive customer tracking)
   */
  async getInactiveCustomers(daysSinceLastPurchase: number = 90): Promise<InactiveCustomerDto[]> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysSinceLastPurchase);

      // Get all customers
      const allCustomers = await this.customerRepository.find({
        relations: ['HoaDons'],
      });

      const inactiveCustomers: InactiveCustomerDto[] = [];

      for (const customer of allCustomers) {
        // Skip if customer is already marked as inactive
        if (customer.IsActive === false) {
          inactiveCustomers.push({
            MaKhachHang: customer.MaKhachHang,
            HoTen: customer.HoTen,
            SoDienThoai: customer.SoDienThoai,
            Email: customer.Email,
            TongChiTieu: customer.TongChiTieu || 0,
            TenHang: customer.TenHang,
            daysSinceLastPurchase,
          });
          continue;
        }

        // Find last purchase date
        let lastPurchaseDate: Date | null = null;
        if (customer.HoaDons && customer.HoaDons.length > 0) {
          const sortedInvoices = customer.HoaDons.sort((a, b) => 
            (b.NgayLap?.getTime() || 0) - (a.NgayLap?.getTime() || 0)
          );
          lastPurchaseDate = sortedInvoices[0]?.NgayLap || null;
        }

        // Check if inactive
        if (!lastPurchaseDate || lastPurchaseDate < cutoffDate) {
          const days = lastPurchaseDate
            ? Math.floor((new Date().getTime() - lastPurchaseDate.getTime()) / (1000 * 60 * 60 * 24))
            : daysSinceLastPurchase;

          inactiveCustomers.push({
            MaKhachHang: customer.MaKhachHang,
            HoTen: customer.HoTen,
            SoDienThoai: customer.SoDienThoai,
            Email: customer.Email,
            TongChiTieu: customer.TongChiTieu || 0,
            TenHang: customer.TenHang,
            lastPurchaseDate,
            daysSinceLastPurchase: days,
          });
        }
      }

      return inactiveCustomers.sort((a, b) => b.daysSinceLastPurchase - a.daysSinceLastPurchase);
    } catch (error) {
      throw new Error(`Failed to get inactive customers: ${error.message}`);
    }
  }

  /**
   * Get spending trends by month
   */
  async getSpendingTrends(months: number = 12): Promise<{
    month: string;
    totalSpending: number;
    transactionCount: number;
  }[]> {
    try {
      const trends = [];
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

  /**
   * Search customers
   */
  async searchCustomers(query: string): Promise<CustomerResponseDto[]> {
    try {
      const customers = await this.customerRepository
        .createQueryBuilder('c')
        .where('c.HoTen LIKE :query', { query: `%${query}%` })
        .orWhere('c.SoDienThoai LIKE :query', { query: `%${query}%` })
        .orWhere('c.Email LIKE :query', { query: `%${query}%` })
        .orWhere('c.CCCD LIKE :query', { query: `%${query}%` })
        .orderBy('c.HoTen', 'ASC')
        .getMany();

      return customers.map(c => this.mapCustomerToDto(c));
    } catch (error) {
      throw new Error(`Failed to search customers: ${error.message}`);
    }
  }

  /**
   * Update customer tier and points
   */
  async updateCustomerTier(customerId: number, tier: string, totalSpending: number): Promise<CustomerResponseDto> {
    try {
      const customer = await this.customerRepository.findOne({
        where: { MaKhachHang: customerId },
      });

      if (!customer) {
        throw new Error(`Customer with ID ${customerId} not found`);
      }

      customer.TenHang = tier;
      customer.TongChiTieu = totalSpending;

      const updated = await this.customerRepository.save(customer);
      return this.mapCustomerToDto(updated);
    } catch (error) {
      throw new Error(`Failed to update customer tier: ${error.message}`);
    }
  }

  /**
   * Get customers by tier
   */
  async getCustomersByTier(tier: string): Promise<CustomerResponseDto[]> {
    try {
      const customers = await this.customerRepository.find({
        where: { TenHang: tier },
        relations: ['HoaDons'],
      });

      return customers.map(c => this.mapCustomerToDto(c));
    } catch (error) {
      throw new Error(`Failed to get customers by tier: ${error.message}`);
    }
  }

  /**
   * Export customers to CSV (basic format)
   */
  async exportCustomersToCsv(): Promise<string> {
    try {
      const customers = await this.customerRepository.find();
      let csv = 'MaKhachHang,HoTen,SoDienThoai,Email,DiaChi,TongChiTieu,TenHang,IsActive\n';

      customers.forEach(c => {
        csv += `${c.MaKhachHang},"${c.HoTen}","${c.SoDienThoai}","${c.Email || ''}","${c.DiaChi || ''}",${c.TongChiTieu || 0},"${c.TenHang}",${c.IsActive ? 'Yes' : 'No'}\n`;
      });

      return csv;
    } catch (error) {
      throw new Error(`Failed to export customers: ${error.message}`);
    }
  }

  /**
   * Helper method to map customer entity to DTO
   */
  private mapCustomerToDto(customer: KhachHang): CustomerResponseDto {
    return {
      MaKhachHang: customer.MaKhachHang,
      HoTen: customer.HoTen,
      SoDienThoai: customer.SoDienThoai,
      Email: customer.Email || undefined,
      CCCD: customer.CCCD || undefined,
      DiaChi: customer.DiaChi || undefined,
      NgaySinh: customer.NgaySinh || undefined,
      GioiTinh: customer.GioiTinh || undefined,
      TongChiTieu: customer.TongChiTieu || 0,
      TenHang: customer.TenHang,
      CreatedAt: customer.CreatedAt,
      IsActive: customer.IsActive !== false,
    };
  }
}
