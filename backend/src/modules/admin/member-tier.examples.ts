/**
 * Member Tier Management System (FQ-06) - Usage Examples
 * 
 * This file demonstrates how to use the MemberTierService
 * in various scenarios within the application.
 */

// ============================================
// 1. INTEGRATION IN SALES MODULE (FS-03)
// ============================================

/**
 * When processing a sales transaction, apply tier-based discount
 */
import { MemberTierService } from '../admin/member-tier.service';

export class SalesService {
  constructor(private memberTierService: MemberTierService) {}

  async processSaleWithTierDiscount(customerId: string, totalAmount: number) {
    // Get customer's tier
    const tierInfo = await this.memberTierService.getMemberTierHistory(customerId);
    
    // Apply tier-based discount
    const discount = (totalAmount * tierInfo.tierInfo.discountPercentage) / 100;
    const finalAmount = totalAmount - discount;
    
    // Calculate bonus points for this purchase
    const purchasePoints = Math.floor(finalAmount / 50_000);
    
    console.log(`
      Customer: ${customerId}
      Tier: ${tierInfo.currentTier}
      Original: ${totalAmount} VND
      Discount: ${discount} VND (${tierInfo.tierInfo.discountPercentage}%)
      Final: ${finalAmount} VND
      Points Earned: ${purchasePoints}
    `);
    
    return {
      finalAmount,
      discount,
      pointsEarned: purchasePoints,
      tier: tierInfo.currentTier,
    };
  }
}

// ============================================
// 2. SCHEDULED JOB USAGE
// ============================================

/**
 * The service includes a scheduled job that runs automatically:
 * 
 * @Cron('0 2 * * *')
 * async updateAllMemberTiers(): Promise<void>
 * 
 * This runs every day at 2:00 AM and:
 * 1. Fetches all active members
 * 2. Calculates their annual spending
 * 3. Updates tiers if changed
 * 4. Logs all changes
 * 
 * No manual invocation needed - it's fully automatic!
 */

// ============================================
// 3. ADMIN MANUAL TRIGGER
// ============================================

/**
 * Admin can manually trigger tier update via API endpoint:
 * POST /admin/member-tiers/update-now
 */

import { Injectable } from '@nestjs/common';

@Injectable()
export class AdminDashboardService {
  constructor(private memberTierService: MemberTierService) {}

  async refreshMemberTiers() {
    const result = await this.memberTierService.manuallyTriggerTierUpdate();
    
    console.log(`
      Total Members Processed: ${result.totalProcessed}
      Members with Tier Changes: ${result.updatedCount}
      
      Tier Changes:
      ${result.updates.map(u => 
        `  ${u.memberId}: ${u.oldTier} → ${u.newTier} (${u.annualSpending} VND)`
      ).join('\n')}
    `);
    
    return result;
  }
}

// ============================================
// 4. CUSTOMER PORTAL USAGE (FC-03)
// ============================================

/**
 * Display member tier information on customer portal
 */

@Injectable()
export class CustomerPortalService {
  constructor(private memberTierService: MemberTierService) {}

  async displayMembershipStatus(customerId: string) {
    const tierHistory = await this.memberTierService.getMemberTierHistory(customerId);
    const tierInfo = tierHistory.tierInfo;
    
    // Calculate amount needed to reach next tier
    let amountToNextTier = 0;
    if (tierHistory.nextTierInfo) {
      amountToNextTier = tierHistory.nextTierInfo.minSpending - tierHistory.currentSpending;
    }
    
    const displayData = {
      title: 'Thông Tin Thành Viên',
      currentTier: tierInfo.name,
      currentSpending: tierHistory.currentSpending,
      currentPoints: tierHistory.currentPoints,
      currentDiscount: `${tierInfo.discountPercentage}%`,
      benefits: tierInfo.benefits,
      progressToNextTier: tierHistory.progressToNextTier,
      nextTier: tierHistory.nextTierInfo?.name,
      amountToNextTier: amountToNextTier,
      displayMessage: amountToNextTier > 0 
        ? `Bạn còn cần chi tiêu ${amountToNextTier} VND để nâng lên ${tierHistory.nextTierInfo?.name}`
        : 'Bạn đang ở tier cao nhất!',
    };
    
    return displayData;
  }
}

// ============================================
// 5. ANALYTICS DASHBOARD USAGE (FQ-02)
// ============================================

/**
 * Display member tier statistics on admin dashboard
 */

@Injectable()
export class AdminAnalyticsService {
  constructor(private memberTierService: MemberTierService) {}

  async getMemberTierDashboard() {
    const stats = await this.memberTierService.getMemberTierStatistics();
    
    // Format for dashboard display
    const chartData = {
      labels: stats.tierDistribution.map(t => t.tierName),
      data: stats.tierDistribution.map(t => t.count),
      percentages: stats.tierDistribution.map(t => t.percentage),
    };
    
    const table = stats.tierDistribution.map(tier => ({
      'Tier': tier.tierName,
      'Members': tier.count,
      'Percentage': `${tier.percentage}%`,
      'Avg Spending': `${tier.avgSpending.toLocaleString()} VND`,
      'Avg Points': tier.avgPoints,
    }));
    
    return {
      totalMembers: stats.totalMembers,
      chart: chartData,
      table: table,
      summary: {
        bronzeMembers: stats.tierDistribution.find(t => t.tierId === 'bronze')?.count,
        silverMembers: stats.tierDistribution.find(t => t.tierId === 'silver')?.count,
        goldMembers: stats.tierDistribution.find(t => t.tierId === 'gold')?.count,
        platinumMembers: stats.tierDistribution.find(t => t.tierId === 'platinum')?.count,
      }
    };
  }
}

// ============================================
// 6. INDIVIDUAL MEMBER UPDATE
// ============================================

/**
 * Update tier for a specific member immediately
 * (e.g., when admin needs to manually adjust)
 */

@Injectable()
export class MemberManagementService {
  constructor(private memberTierService: MemberTierService) {}

  async updateSpecificMember(customerId: string) {
    const update = await this.memberTierService.updateMemberTierForCustomer(customerId);
    
    if (update) {
      console.log(`
        Member Tier Updated:
        Customer ID: ${update.memberId}
        Old Tier: ${update.oldTier}
        New Tier: ${update.newTier}
        Annual Spending: ${update.annualSpending} VND
        Points: ${update.points}
        Updated At: ${update.updatedAt}
      `);
      
      // Could trigger notification here
      // await notificationService.notifyMemberTierUpgrade(customerId, update.newTier);
    }
    
    return update;
  }
}

// ============================================
// 7. TIER INFORMATION LOOKUP
// ============================================

/**
 * Get information about all tiers or specific tier
 */

export class TierInfoService {
  constructor(private memberTierService: MemberTierService) {}

  getAllTiersInfo() {
    return this.memberTierService.getAllTiers().map(tier => ({
      id: tier.id,
      name: tier.name,
      minSpending: `${tier.minSpending.toLocaleString()} VND`,
      maxSpending: tier.maxSpending === Infinity ? 'Không giới hạn' : `${tier.maxSpending.toLocaleString()} VND`,
      discountPercentage: `${tier.discountPercentage}%`,
      benefits: tier.benefits,
      minPoints: tier.minPoints,
      maxPoints: tier.maxPoints === Infinity ? '∞' : tier.maxPoints,
    }));
  }

  getSpecificTierInfo(tierId: string) {
    return this.memberTierService.getTierInfo(tierId);
  }
}

// ============================================
// 8. TRANSACTION HISTORY WITH TIER
// ============================================

/**
 * Show transaction history with tier status at time of purchase
 */

export class TransactionHistoryService {
  constructor(private memberTierService: MemberTierService) {}

  async getTransactionHistoryWithTier(customerId: string) {
    const currentTierHistory = await this.memberTierService.getMemberTierHistory(customerId);
    
    // This would be combined with actual transaction data
    const transactions = [
      {
        date: '2025-12-10',
        amount: 1_500_000,
        points: 30,
        tier: 'gold', // Tier at time of purchase
      },
      // ... more transactions
    ];
    
    return {
      currentStatus: currentTierHistory,
      transactionHistory: transactions,
    };
  }
}

// ============================================
// 9. TIER-BASED OFFERS
// ============================================

/**
 * Get offers available based on member's tier
 */

export class OfferService {
  constructor(private memberTierService: MemberTierService) {}

  async getPersonalizedOffers(customerId: string) {
    const tierHistory = await this.memberTierService.getMemberTierHistory(customerId);
    const tierInfo = tierHistory.tierInfo;
    
    const offersByTier = {
      bronze: [
        'Tích lũy 1 điểm/50.000 VND',
        'Hỗ trợ khách hàng 24/7',
      ],
      silver: [
        'Giảm 5% cho tất cả dịch vụ',
        'Tặng gói tiêm phòng định kỳ',
        'Hỗ trợ ưu tiên',
      ],
      gold: [
        'Giảm 10% cho tất cả dịch vụ',
        'Tư vấn y tế miễn phí',
        'Quà tặng sinh nhật',
        'Ưu tiên lịch hẹn',
      ],
      platinum: [
        'Giảm 15% cho tất cả dịch vụ',
        'Account manager riêng',
        'Gói dịch vụ miễn phí hàng tháng',
        'Sự kiện VIP độc quyền',
      ],
    };
    
    return {
      tier: tierInfo.name,
      currentOffers: offersByTier[tierHistory.currentTier],
      nextTierOffers: tierHistory.nextTierInfo ? offersByTier[tierHistory.nextTierInfo.id] : null,
    };
  }
}

// ============================================
// 10. API TESTING EXAMPLES
// ============================================

/**
 * Example API calls for testing
 */

export const apiExamples = {
  // Get all tiers
  getAllTiers: `
    GET /admin/member-tiers
    Authorization: Bearer {token}
    Accept: application/json
  `,

  // Get tier statistics
  getTierStats: `
    GET /admin/member-tiers/statistics
    Authorization: Bearer {token}
    Accept: application/json
  `,

  // Get specific tier info
  getTierInfo: `
    GET /admin/member-tiers/gold
    Authorization: Bearer {token}
    Accept: application/json
  `,

  // Get member tier history
  getMemberHistory: `
    GET /admin/member-tiers/history/customer-123
    Authorization: Bearer {token}
    Accept: application/json
  `,

  // Manual tier update
  manualUpdate: `
    POST /admin/member-tiers/update-now
    Authorization: Bearer {token}
    Content-Type: application/json
  `,

  // Update specific member
  updateMember: `
    POST /admin/member-tiers/update/customer-123
    Authorization: Bearer {token}
    Content-Type: application/json
  `,
};

// ============================================
// 11. ERROR HANDLING EXAMPLES
// ============================================

/**
 * Example error handling
 */

export class ErrorHandlingExamples {
  async handleTierUpdateError(customerId: string, memberTierService: any) {
    try {
      const result = await memberTierService.updateMemberTierForCustomer(customerId);
      return result;
    } catch (error) {
      if (error.message.includes('not found')) {
        // Handle customer not found
        console.error(`Customer ${customerId} not found`);
      } else if (error.message.includes('tier')) {
        // Handle tier-related error
        console.error(`Invalid tier information`);
      } else {
        // Handle unknown error
        console.error(`Unexpected error:`, error);
      }
    }
  }
}

// ============================================
// 12. DATA MIGRATION FROM OLD SYSTEM
// ============================================

/**
 * Example: Migrating member tiers from old system
 */

export class DataMigrationExample {
  async migrateExistingMembers(memberTierService: MemberTierService) {
    // 1. Get all customers from old system
    // 2. Calculate their annual spending
    // 3. Update their tier in new system
    // 4. Log migration results
    
    const migrationStats = {
      total: 0,
      upgraded: 0,
      downgraded: 0,
      noChange: 0,
      errors: 0,
    };
    
    // After processing all customers:
    console.log(`
      Migration Complete:
      Total Processed: ${migrationStats.total}
      Tier Increased: ${migrationStats.upgraded}
      Tier Decreased: ${migrationStats.downgraded}
      No Change: ${migrationStats.noChange}
      Errors: ${migrationStats.errors}
    `);
    
    return migrationStats;
  }
}
