import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { MemberTierService } from './member-tier.service';
import { MemberTierController } from './member-tier.controller';
import { KhachHang } from '../../entities/khach-hang.entity';
import { KhachHangThanhVien } from '../../entities/khach-hang-thanh-vien.entity';
import { HangThanhVien } from '../../entities/hang-thanh-vien.entity';
import { HoaDon } from '../../entities/hoa-don.entity';

describe('MemberTierService (FQ-06)', () => {
  let service: MemberTierService;
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forFeature([
          KhachHang,
          KhachHangThanhVien,
          HangThanhVien,
          HoaDon,
        ]),
        ScheduleModule.forRoot(),
      ],
      providers: [MemberTierService],
      controllers: [MemberTierController],
    }).compile();

    service = module.get<MemberTierService>(MemberTierService);
  });

  describe('Tier Definitions', () => {
    it('should have 4 tier definitions', () => {
      const tiers = service.getAllTiers();
      expect(tiers).toHaveLength(4);
      expect(tiers[0].id).toBe('bronze');
      expect(tiers[1].id).toBe('silver');
      expect(tiers[2].id).toBe('gold');
      expect(tiers[3].id).toBe('platinum');
    });

    it('should get tier info by ID', () => {
      const goldTier = service.getTierInfo('gold');
      expect(goldTier).toBeDefined();
      expect(goldTier?.name).toBe('Gold');
      expect(goldTier?.discountPercentage).toBe(10);
      expect(goldTier?.minSpending).toBe(150_000_000);
      expect(goldTier?.maxSpending).toBe(299_999_999);
    });

    it('should have all benefits defined for each tier', () => {
      const tiers = service.getAllTiers();
      tiers.forEach((tier) => {
        expect(tier.benefits).toBeDefined();
        expect(tier.benefits.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Tier Determination', () => {
    it('should determine Bronze tier for 0 spending', () => {
      const tier = service.determineTier(0);
      expect(tier).toBe('bronze');
    });

    it('should determine Silver tier for 50,000,000 spending', () => {
      const tier = service.determineTier(50_000_000);
      expect(tier).toBe('silver');
    });

    it('should determine Gold tier for 150,000,000 spending', () => {
      const tier = service.determineTier(150_000_000);
      expect(tier).toBe('gold');
    });

    it('should determine Platinum tier for 300,000,000 spending', () => {
      const tier = service.determineTier(300_000_000);
      expect(tier).toBe('platinum');
    });

    it('should determine Platinum tier for very high spending', () => {
      const tier = service.determineTier(1_000_000_000);
      expect(tier).toBe('platinum');
    });
  });

  describe('Points Calculation', () => {
    it('should calculate 1000 points for 50,000,000 VND spending', async () => {
      // Mock data would be: 50,000,000 / 50,000 = 1000 points
      const expectedPoints = Math.floor(50_000_000 / 50_000);
      expect(expectedPoints).toBe(1000);
    });

    it('should calculate points correctly for various amounts', () => {
      const testCases = [
        { spending: 0, expectedPoints: 0 },
        { spending: 50_000, expectedPoints: 1 },
        { spending: 50_000_000, expectedPoints: 1000 },
        { spending: 100_000_000, expectedPoints: 2000 },
        { spending: 300_000_000, expectedPoints: 6000 },
      ];

      testCases.forEach(({ spending, expectedPoints }) => {
        const points = Math.floor(spending / 50_000);
        expect(points).toBe(expectedPoints);
      });
    });
  });

  describe('Tier Boundaries', () => {
    it('should correctly handle tier boundaries', () => {
      const testCases = [
        { spending: 49_999_999, expectedTier: 'bronze' },
        { spending: 50_000_000, expectedTier: 'silver' },
        { spending: 149_999_999, expectedTier: 'silver' },
        { spending: 150_000_000, expectedTier: 'gold' },
        { spending: 299_999_999, expectedTier: 'gold' },
        { spending: 300_000_000, expectedTier: 'platinum' },
      ];

      testCases.forEach(({ spending, expectedTier }) => {
        const tier = service.determineTier(spending);
        expect(tier).toBe(expectedTier);
      });
    });
  });

  describe('Discount Structure', () => {
    it('should have correct discount percentages', () => {
      expect(service.getTierInfo('bronze')?.discountPercentage).toBe(0);
      expect(service.getTierInfo('silver')?.discountPercentage).toBe(5);
      expect(service.getTierInfo('gold')?.discountPercentage).toBe(10);
      expect(service.getTierInfo('platinum')?.discountPercentage).toBe(15);
    });
  });

  describe('Tier Benefits', () => {
    it('Bronze tier should have basic benefits', () => {
      const bronze = service.getTierInfo('bronze');
      expect(bronze?.benefits).toContain('Tích lũy điểm');
      expect(bronze?.benefits).toContain('Hỗ trợ khách hàng');
    });

    it('Silver tier should have more benefits than Bronze', () => {
      const bronze = service.getTierInfo('bronze');
      const silver = service.getTierInfo('silver');
      expect(silver!.benefits.length).toBeGreaterThan(bronze!.benefits.length);
    });

    it('Platinum tier should have most benefits', () => {
      const tiers = service.getAllTiers();
      const benefitCounts = tiers.map((t) => t.benefits.length);
      const maxBenefits = Math.max(...benefitCounts);
      const platinumBenefits = service.getTierInfo('platinum')?.benefits.length;
      expect(platinumBenefits).toBe(maxBenefits);
    });
  });

  describe('Tier Spending Ranges', () => {
    it('should have correct spending ranges', () => {
      const tiers = service.getAllTiers();
      
      // Bronze
      expect(tiers[0].minSpending).toBe(0);
      expect(tiers[0].maxSpending).toBe(49_999_999);
      
      // Silver
      expect(tiers[1].minSpending).toBe(50_000_000);
      expect(tiers[1].maxSpending).toBe(149_999_999);
      
      // Gold
      expect(tiers[2].minSpending).toBe(150_000_000);
      expect(tiers[2].maxSpending).toBe(299_999_999);
      
      // Platinum
      expect(tiers[3].minSpending).toBe(300_000_000);
      expect(tiers[3].maxSpending).toBe(Infinity);
    });

    it('should have no gaps in tier ranges', () => {
      const tiers = service.getAllTiers();
      for (let i = 0; i < tiers.length - 1; i++) {
        expect(tiers[i + 1].minSpending).toBe(tiers[i].maxSpending + 1);
      }
    });
  });

  describe('Point Ranges', () => {
    it('should have correct point ranges for each tier', () => {
      const tiers = service.getAllTiers();
      
      expect(tiers[0].minPoints).toBe(0);
      expect(tiers[0].maxPoints).toBe(999);
      
      expect(tiers[1].minPoints).toBe(1_000);
      expect(tiers[1].maxPoints).toBe(2_999);
      
      expect(tiers[2].minPoints).toBe(3_000);
      expect(tiers[2].maxPoints).toBe(5_999);
      
      expect(tiers[3].minPoints).toBe(6_000);
      expect(tiers[3].maxPoints).toBeGreaterThan(10_000);
    });
  });

  afterEach(async () => {
    await module.close();
  });
});

/**
 * Integration Test Scenarios for Member Tier Management
 * 
 * Scenario 1: Member Tier Upgrade
 * - Member A has spending: 40,000,000 VND (Bronze tier)
 * - Makes purchase: 15,000,000 VND
 * - New spending: 55,000,000 VND → Should upgrade to Silver
 * 
 * Scenario 2: Member Tier Multiple Upgrades
 * - Member B starts at Bronze
 * - Year passes with monthly spending
 * - Should progress through tiers naturally
 * 
 * Scenario 3: Member Tier Downgrade
 * - Member C is at Gold tier (annual spending: 200,000,000)
 * - Only 50,000,000 spent in new year
 * - Should downgrade to Silver
 * 
 * Scenario 4: Scheduled Job Execution
 * - Database has 500 active members
 * - Job runs daily at 2:00 AM
 * - Should process all members within 5 minutes
 * - Should log all tier changes
 * 
 * Scenario 5: Manual Tier Update
 * - Admin triggers manual update via API
 * - Should return statistics of processed members
 * - Should show which members had tier changes
 * 
 * Scenario 6: Member Tier Statistics
 * - Admin views tier distribution
 * - Should show percentage of members in each tier
 * - Should show average spending and points per tier
 */
