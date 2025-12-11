/**
 * Member Tier System - Database Setup & Migration Script
 * 
 * This script helps with:
 * 1. Creating tier definitions in database (if using HangThanhVien table)
 * 2. Initializing member tier data
 * 3. Migrating existing members to new tier system
 * 4. Verifying data integrity
 */

import { Repository, DataSource } from 'typeorm';
import { KhachHang } from '../../entities/khach-hang.entity';
import { KhachHangThanhVien } from '../../entities/khach-hang-thanh-vien.entity';
import { HangThanhVien } from '../../entities/hang-thanh-vien.entity';
import { HoaDon } from '../../entities/hoa-don.entity';

export class MemberTierDatabaseSetup {
  constructor(private dataSource: DataSource) {}

  /**
   * SQL to create tier definitions (if using HangThanhVien table)
   * Run this once in your database
   */
  static readonly TIER_DEFINITIONS_SQL = `
    -- Insert tier definitions
    INSERT INTO hang_thanh_vien (id, ten_hang, muc_chi_tieu_toi_thieu, thi_le_giam_gia, mo_ta)
    VALUES 
      ('bronze', 'Bronze', 0, 0, 'Hạng thành viên cơ bản - Tích lũy điểm'),
      ('silver', 'Silver', 50000000, 5, 'Hạng thành viên bạc - Giảm 5% - 1 triệu VND+'),
      ('gold', 'Gold', 150000000, 10, 'Hạng thành viên vàng - Giảm 10% - 150 triệu VND+'),
      ('platinum', 'Platinum', 300000000, 15, 'Hạng thành viên kim cương - Giảm 15% - 300 triệu VND+')
    ON CONFLICT (id) DO NOTHING;
  `;

  /**
   * Initialize tier data for all customers
   * Assigns default Bronze tier to all active members
   */
  async initializeMemberTiers(): Promise<{
    totalCustomers: number;
    initialized: number;
    skipped: number;
  }> {
    const khachHangRepo = this.dataSource.getRepository(KhachHang);
    const khachHangThanhVienRepo = this.dataSource.getRepository(KhachHangThanhVien);

    // Get all customers
    const customers = await khachHangRepo.find();

    let initialized = 0;
    let skipped = 0;

    for (const customer of customers) {
      const existing = await khachHangThanhVienRepo.findOne({
        where: { KhachHang: { MaKhachHang: customer.MaKhachHang } },
      });

      if (!existing) {
        const membership = new KhachHangThanhVien();
        membership.MaKhachHang = customer.MaKhachHang;
        membership.TenHang = 'bronze';
        membership.NgayNangHang = new Date();
        membership.TongChiTieu = 0;

        await khachHangThanhVienRepo.save(membership);
        initialized++;
      } else {
        skipped++;
      }
    }

    return {
      totalCustomers: customers.length,
      initialized,
      skipped,
    };
  }

  /**
   * Migrate existing members to new tier system
   * Calculates their tier based on existing spending
   */
  async migrateExistingMembers(): Promise<{
    totalMembers: number;
    upgraded: number;
    downgraded: number;
    noChange: number;
    errors: number;
    details: any[];
  }> {
    const khachHangThanhVienRepo = this.dataSource.getRepository(
      KhachHangThanhVien,
    );
    const hoaDonRepo = this.dataSource.getRepository(HoaDon);

    const members = await khachHangThanhVienRepo.find();

    const results = {
      totalMembers: members.length,
      upgraded: 0,
      downgraded: 0,
      noChange: 0,
      errors: 0,
      details: [] as any[],
    };

    const tierMapping = {
      0: 'bronze',
      1: 'silver',
      2: 'gold',
      3: 'platinum',
    };

    for (const member of members) {
      try {
        // Calculate spending
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

        const invoices = await hoaDonRepo.find({
          where: {
            KhachHang: { MaKhachHang: member.MaKhachHang },
          },
        });

        const totalSpending = invoices.reduce(
          (sum, invoice) => sum + (invoice.TongTien || 0),
          0,
        );

        // Determine new tier
        let newTier = 'bronze';
        if (totalSpending >= 300_000_000) {
          newTier = 'platinum';
        } else if (totalSpending >= 150_000_000) {
          newTier = 'gold';
        } else if (totalSpending >= 50_000_000) {
          newTier = 'silver';
        }

        const oldTier = member.TenHang;

        if (oldTier !== newTier) {
          member.TenHang = newTier;
          member.TongChiTieu = totalSpending;

          await khachHangThanhVienRepo.save(member);

          if (
            tierMapping[Object.values(tierMapping).indexOf(newTier)] >
            tierMapping[Object.values(tierMapping).indexOf(oldTier)]
          ) {
            results.upgraded++;
          } else {
            results.downgraded++;
          }

          results.details.push({
            memberId: member.MaKhachHang,
            oldTier,
            newTier,
            spending: totalSpending,
            invoiceCount: invoices.length,
          });
        } else {
          results.noChange++;
        }
      } catch (error) {
        results.errors++;
        results.details.push({
          memberId: member.MaKhachHang,
          error: error.message,
        });
      }
    }

    return results;
  }

  /**
   * Verify tier data integrity
   */
  async verifyDataIntegrity(): Promise<{
    valid: boolean;
    issues: string[];
    statistics: {
      totalMembers: number;
      tiersDistribution: Record<string, number>;
      membersWithoutTier: number;
      membersWithNegativeSpending: number;
      membersWithNegativePoints: number;
    };
  }> {
    const khachHangThanhVienRepo = this.dataSource.getRepository(
      KhachHangThanhVien,
    );

    const issues: string[] = [];
    const statistics = {
      totalMembers: 0,
      tiersDistribution: {
        bronze: 0,
        silver: 0,
        gold: 0,
        platinum: 0,
      },
      membersWithoutTier: 0,
      membersWithNegativeSpending: 0,
      membersWithNegativePoints: 0,
    };

    const members = await khachHangThanhVienRepo.find();

    statistics.totalMembers = members.length;

    for (const member of members) {
      // Check if tier is valid
      if (
        !['bronze', 'silver', 'gold', 'platinum'].includes(
          member.TenHang,
        )
      ) {
        issues.push(
          `Member ${member.MaKhachHang}: Invalid tier "${member.TenHang}"`,
        );
        statistics.membersWithoutTier++;
      } else {
        statistics.tiersDistribution[member.TenHang]++;
      }

      // Check for negative spending
      if ((member.TongChiTieu || 0) < 0) {
        issues.push(
          `Member ${member.MaKhachHang}: Negative spending (${member.TongChiTieu})`,
        );
        statistics.membersWithNegativeSpending++;
      }

      // Check for negative points
      if ((member.TongChiTieu || 0) < 0) {
        issues.push(
          `Member ${member.MaKhachHang}: Negative spending (${member.TongChiTieu})`,
        );
        statistics.membersWithNegativePoints++;
      }

      // Check if tier matches spending
      const tier = member.TenHang;
      const spending = member.TongChiTieu || 0;

      const expectedTier =
        spending >= 300_000_000
          ? 'platinum'
          : spending >= 150_000_000
            ? 'gold'
            : spending >= 50_000_000
              ? 'silver'
              : 'bronze';

      if (tier !== expectedTier) {
        issues.push(
          `Member ${member.MaKhachHang}: Tier mismatch. Has "${tier}" but should be "${expectedTier}" for spending ${spending}`,
        );
      }
    }

    return {
      valid: issues.length === 0,
      issues,
      statistics,
    };
  }

  /**
   * Reset all members to Bronze tier (useful for testing)
   */
  async resetAllTiersToBronze(): Promise<{ updated: number }> {
    const khachHangThanhVienRepo = this.dataSource.getRepository(
      KhachHangThanhVien,
    );

    const result = await khachHangThanhVienRepo.update(
      {},
      {
        TenHang: 'bronze',
        TongChiTieu: 0,
        NgayNangHang: new Date(),
      },
    );

    return { updated: result.affected || 0 };
  }

  /**
   * Get tier statistics
   */
  async getTierStatistics(): Promise<{
    totalMembers: number;
    byTier: Record<
      string,
      {
        count: number;
        percentage: number;
        avgSpending: number;
        avgPoints: number;
        totalSpending: number;
      }
    >;
  }> {
    const khachHangThanhVienRepo = this.dataSource.getRepository(
      KhachHangThanhVien,
    );

    const members = await khachHangThanhVienRepo.find();

    const stats = {
      totalMembers: members.length,
      byTier: {
        bronze: { count: 0, percentage: 0, avgSpending: 0, avgPoints: 0, totalSpending: 0 },
        silver: { count: 0, percentage: 0, avgSpending: 0, avgPoints: 0, totalSpending: 0 },
        gold: { count: 0, percentage: 0, avgSpending: 0, avgPoints: 0, totalSpending: 0 },
        platinum: { count: 0, percentage: 0, avgSpending: 0, avgPoints: 0, totalSpending: 0 },
      },
    };

    for (const member of members) {
      const tier = member.TenHang || 'bronze';
      if (stats.byTier[tier]) {
        stats.byTier[tier].count++;
        stats.byTier[tier].totalSpending += member.TongChiTieu || 0;
      }
    }

    for (const tier in stats.byTier) {
      const tierData = stats.byTier[tier];
      tierData.percentage = (tierData.count / members.length) * 100;
      tierData.avgSpending =
        tierData.count > 0 ? tierData.totalSpending / tierData.count : 0;
      tierData.avgPoints =
        tierData.count > 0
          ? Math.floor(tierData.avgSpending / 50_000)
          : 0;
    }

    return stats;
  }
}

/**
 * Usage Example
 */
export const databaseSetupExample = async (dataSource: DataSource) => {
  const setup = new MemberTierDatabaseSetup(dataSource);

  // Step 1: Initialize tier data for all customers
  console.log('Step 1: Initializing tier data...');
  const initResult = await setup.initializeMemberTiers();
  console.log(`Initialized: ${initResult.initialized}, Skipped: ${initResult.skipped}`);

  // Step 2: Migrate existing members
  console.log('\nStep 2: Migrating existing members...');
  const migrateResult = await setup.migrateExistingMembers();
  console.log(`Upgraded: ${migrateResult.upgraded}, Downgraded: ${migrateResult.downgraded}`);

  // Step 3: Verify data integrity
  console.log('\nStep 3: Verifying data integrity...');
  const verifyResult = await setup.verifyDataIntegrity();
  if (verifyResult.valid) {
    console.log('✅ All data is valid');
  } else {
    console.log('❌ Issues found:');
    verifyResult.issues.forEach((issue) => console.log(`  - ${issue}`));
  }

  // Step 4: Get statistics
  console.log('\nStep 4: Tier statistics:');
  const stats = await setup.getTierStatistics();
  console.log(stats);
};
