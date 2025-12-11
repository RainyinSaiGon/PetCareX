import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, MoreThan } from 'typeorm';
import { Cron } from '@nestjs/schedule';
import { KhachHang } from '../../entities/khach-hang.entity';
import { KhachHangThanhVien } from '../../entities/khach-hang-thanh-vien.entity';
import { HangThanhVien } from '../../entities/hang-thanh-vien.entity';
import { HoaDon } from '../../entities/hoa-don.entity';

export interface TierInfo {
  id: string;
  name: string;
  minSpending: number;
  maxSpending: number;
  minPoints: number;
  maxPoints: number;
  discountPercentage: number;
  benefits: string[];
}

export interface MemberTierUpdate {
  memberId: string;
  oldTier: string;
  newTier: string;
  updatedAt: Date;
  annualSpending: number;
  points: number;
}

@Injectable()
export class MemberTierService {
  private readonly logger = new Logger(MemberTierService.name);

  // Tier definitions based on annual spending (VND)
  private readonly TIER_DEFINITIONS: TierInfo[] = [
    {
      id: 'bronze',
      name: 'Bronze',
      minSpending: 0,
      maxSpending: 49_999_999,
      minPoints: 0,
      maxPoints: 999,
      discountPercentage: 0,
      benefits: ['Tích lũy điểm', 'Hỗ trợ khách hàng'],
    },
    {
      id: 'silver',
      name: 'Silver',
      minSpending: 50_000_000,
      maxSpending: 149_999_999,
      minPoints: 1_000,
      maxPoints: 2_999,
      discountPercentage: 5,
      benefits: [
        'Tích lũy điểm 5%',
        'Ưu đãi thành viên',
        'Hỗ trợ ưu tiên',
        'Miễn phí gói tiêm phòng',
      ],
    },
    {
      id: 'gold',
      name: 'Gold',
      minSpending: 150_000_000,
      maxSpending: 299_999_999,
      minPoints: 3_000,
      maxPoints: 5_999,
      discountPercentage: 10,
      benefits: [
        'Tích lũy điểm 10%',
        'Ưu đãi VIP',
        'Ưu tiên lịch hẹn',
        'Tư vấn y tế miễn phí',
        'Quà tặng sinh nhật',
      ],
    },
    {
      id: 'platinum',
      name: 'Platinum',
      minSpending: 300_000_000,
      maxSpending: Infinity,
      minPoints: 6_000,
      maxPoints: Infinity,
      discountPercentage: 15,
      benefits: [
        'Tích lũy điểm 15%',
        'Ưu đãi Platinum',
        'Ưu tiên tuyệt đối',
        'Account manager riêng',
        'Gói dịch vụ miễn phí',
        'Quà tặng mùa',
        'Sự kiện VIP độc quyền',
      ],
    },
  ];

  constructor(
    @InjectRepository(KhachHang)
    private khachHangRepository: Repository<KhachHang>,
    @InjectRepository(KhachHangThanhVien)
    private khachHangThanhVienRepository: Repository<KhachHangThanhVien>,
    @InjectRepository(HangThanhVien)
    private hangThanhVienRepository: Repository<HangThanhVien>,
    @InjectRepository(HoaDon)
    private hoaDonRepository: Repository<HoaDon>,
  ) {}

  /**
   * Get tier information by tier ID
   */
  getTierInfo(tierId: string): TierInfo | undefined {
    return this.TIER_DEFINITIONS.find((t) => t.id === tierId);
  }

  /**
   * Get all tier definitions
   */
  getAllTiers(): TierInfo[] {
    return this.TIER_DEFINITIONS;
  }

  /**
   * Calculate annual spending for a customer (last 365 days)
   * Points calculation: 1 point = 50,000 VND
   */
  async calculateAnnualSpending(customerId: string): Promise<{
    totalSpending: number;
    points: number;
    invoiceCount: number;
  }> {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const invoices = await this.hoaDonRepository.find({
      where: {
        KhachHang: { MaKhachHang: Number(customerId) },
        NgayLap: MoreThan(oneYearAgo),
      },
    });

    const totalSpending = invoices.reduce(
      (sum, invoice) => sum + (invoice.TongTien || 0),
      0,
    );

    // 1 point per 50,000 VND spent
    const points = Math.floor(totalSpending / 50_000);

    return {
      totalSpending,
      points,
      invoiceCount: invoices.length,
    };
  }

  /**
   * Determine tier based on annual spending
   */
  determineTier(spending: number): string {
    for (const tier of this.TIER_DEFINITIONS) {
      if (
        spending >= tier.minSpending &&
        spending <= tier.maxSpending
      ) {
        return tier.id;
      }
    }
    return 'bronze'; // Default tier
  }

  /**
   * Get customer's current tier
   */
  async getCurrentTier(customerId: string): Promise<string> {
    const membershipRecord = await this.khachHangThanhVienRepository.findOne({
      where: { KhachHang: { MaKhachHang: Number(customerId) } },
    });

    return membershipRecord?.TenHang || 'bronze';
  }

  /**
   * Update member tier and log the change
   */
  async updateMemberTierForCustomer(
    customerId: string,
  ): Promise<MemberTierUpdate | null> {
    try {
      // Calculate current spending
      const { totalSpending, points } =
        await this.calculateAnnualSpending(customerId);

      // Determine new tier
      const newTier = this.determineTier(totalSpending);

      // Get current tier
      const currentTier = await this.getCurrentTier(customerId);

      // If tier hasn't changed, no need to update
      if (currentTier === newTier) {
        return null;
      }

      // Update membership record
      const membershipRecord = await this.khachHangThanhVienRepository.findOne({
        where: { KhachHang: { MaKhachHang: Number(customerId) } },
      });

      if (!membershipRecord) {
        // Create new membership record if doesn't exist
        const newRecord = new KhachHangThanhVien();
        newRecord.MaKhachHang = Number(customerId);
        newRecord.TenHang = newTier;
        newRecord.NgayNangHang = new Date();
        newRecord.TongChiTieu = totalSpending;

        await this.khachHangThanhVienRepository.save(newRecord);
      } else {
        // Update existing record
        const oldTier = membershipRecord.TenHang;
        membershipRecord.TenHang = newTier;
        membershipRecord.NgayNangHang = new Date();
        membershipRecord.TongChiTieu = totalSpending;

        await this.khachHangThanhVienRepository.save(membershipRecord);

        return {
          memberId: customerId,
          oldTier: oldTier,
          newTier: newTier,
          updatedAt: new Date(),
          annualSpending: totalSpending,
          points: points,
        };
      }

      return null;
    } catch (error) {
      this.logger.error(
        `Error updating tier for customer ${customerId}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Scheduled job: Update all members' tiers daily at 2:00 AM
   * Runs every day at 02:00:00
   */
  @Cron('0 2 * * *')
  async updateAllMemberTiers(): Promise<void> {
    this.logger.log('Starting scheduled member tier update job...');
    const startTime = Date.now();

    try {
      // Get all active members
      const members = await this.khachHangThanhVienRepository.find();

      this.logger.log(`Processing ${members.length} members...`);

      let updatedCount = 0;
      const updates: MemberTierUpdate[] = [];

      for (const member of members) {
        const update = await this.updateMemberTierForCustomer(
          member.MaKhachHang.toString(),
        );
        if (update) {
          updatedCount++;
          updates.push(update);
          this.logger.log(
            `Tier updated: ${member.MaKhachHang} ${update.oldTier} → ${update.newTier}`,
          );
        }
      }

      const duration = (Date.now() - startTime) / 1000;
      this.logger.log(
        `Member tier update completed. Updated: ${updatedCount}/${members.length}, Duration: ${duration}s`,
      );

      // Log tier update statistics
      if (updates.length > 0) {
        await this.logTierUpdates(updates);
      }
    } catch (error) {
      this.logger.error('Error in scheduled member tier update:', error);
    }
  }

  /**
   * Manual trigger for tier update (for admin)
   */
  async manuallyTriggerTierUpdate(): Promise<{
    totalProcessed: number;
    updatedCount: number;
    updates: MemberTierUpdate[];
  }> {
    this.logger.log('Manual tier update triggered by admin...');

    const members = await this.khachHangThanhVienRepository.find();

    const updates: MemberTierUpdate[] = [];

    for (const member of members) {
      const update = await this.updateMemberTierForCustomer(
        member.MaKhachHang.toString(),
      );
      if (update) {
        updates.push(update);
      }
    }

    return {
      totalProcessed: members.length,
      updatedCount: updates.length,
      updates,
    };
  }

  /**
   * Get member tier statistics (for admin dashboard)
   */
  async getMemberTierStatistics(): Promise<{
    totalMembers: number;
    tierDistribution: {
      tierId: string;
      tierName: string;
      count: number;
      percentage: number;
      avgSpending: number;
      avgPoints: number;
    }[];
  }> {
    const members = await this.khachHangThanhVienRepository.find();

    const distribution: Map<
      string,
      {
        tierId: string;
        tierName: string;
        count: number;
        totalSpending: number;
        totalPoints: number;
      }
    > = new Map();

    // Initialize all tiers
    for (const tier of this.TIER_DEFINITIONS) {
      distribution.set(tier.id, {
        tierId: tier.id,
        tierName: tier.name,
        count: 0,
        totalSpending: 0,
        totalPoints: 0,
      });
    }

    // Count members per tier
    for (const member of members) {
      const tierId = member.TenHang || 'bronze';
      const tierData = distribution.get(tierId);
      if (tierData) {
        tierData.count++;
        tierData.totalSpending += member.TongChiTieu || 0;
        tierData.totalPoints += 0; // No points field in KhachHangThanhVien
      }
    }

    const result = Array.from(distribution.values())
      .map((tier) => ({
        tierId: tier.tierId,
        tierName: tier.tierName,
        count: tier.count,
        percentage:
          members.length > 0
            ? Math.round((tier.count / members.length) * 100)
            : 0,
        avgSpending: tier.count > 0 ? Math.round(tier.totalSpending / tier.count) : 0,
        avgPoints: tier.count > 0 ? Math.round(tier.totalPoints / tier.count) : 0,
      }))
      .sort((a, b) => b.count - a.count);

    return {
      totalMembers: members.length,
      tierDistribution: result,
    };
  }

  /**
   * Get member tier history for a specific customer
   */
  async getMemberTierHistory(customerId: string): Promise<{
    currentTier: string;
    currentSpending: number;
    currentPoints: number;
    tierInfo: TierInfo;
    nextTierInfo?: TierInfo;
    progressToNextTier: number;
  }> {
    const { totalSpending, points } =
      await this.calculateAnnualSpending(customerId);
    const currentTierId = this.determineTier(totalSpending);
    const tierInfo = this.getTierInfo(currentTierId);

    if (!tierInfo) {
      throw new Error(`Tier ${currentTierId} not found`);
    }

    // Find next tier
    const nextTierIndex = this.TIER_DEFINITIONS.findIndex(
      (t) => t.id === currentTierId,
    );
    const nextTierInfo =
      nextTierIndex >= 0 && nextTierIndex < this.TIER_DEFINITIONS.length - 1
        ? this.TIER_DEFINITIONS[nextTierIndex + 1]
        : undefined;

    // Calculate progress to next tier
    let progressToNextTier = 100;
    if (nextTierInfo) {
      const currentProgress = totalSpending - tierInfo.minSpending;
      const nextTierRange =
        nextTierInfo.minSpending - tierInfo.minSpending;
      progressToNextTier = Math.round((currentProgress / nextTierRange) * 100);
    }

    return {
      currentTier: currentTierId,
      currentSpending: totalSpending,
      currentPoints: points,
      tierInfo,
      nextTierInfo,
      progressToNextTier: Math.min(progressToNextTier, 100),
    };
  }

  /**
   * Log tier updates for audit trail (placeholder for future database logging)
   */
  private async logTierUpdates(updates: MemberTierUpdate[]): Promise<void> {
    this.logger.log(`Recording ${updates.length} tier updates to audit log`);
    // TODO: Store tier update history in a separate table for audit trail
    // This could be: LICHSUCAPNHATTANTHONG or similar entity
  }
}
