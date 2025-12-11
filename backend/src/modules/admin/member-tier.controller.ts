import { Controller, Get, Post, Param, UseGuards, HttpCode } from '@nestjs/common';
import { MemberTierService } from './member-tier.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { UserRole } from '../../common/enums/user-role.enum';

@Controller('admin/member-tiers')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class MemberTierController {
  constructor(private readonly memberTierService: MemberTierService) {}

  /**
   * Get all tier definitions with details
   * GET /admin/member-tiers
   */
  @Get()
  async getAllTiers() {
    return {
      success: true,
      data: this.memberTierService.getAllTiers(),
    };
  }

  /**
   * Get member tier statistics (for admin dashboard)
   * GET /admin/member-tiers/statistics
   */
  @Get('statistics')
  async getTierStatistics() {
    const stats = await this.memberTierService.getMemberTierStatistics();
    return {
      success: true,
      data: stats,
    };
  }

  /**
   * Get specific tier information
   * GET /admin/member-tiers/:tierId
   */
  @Get(':tierId')
  async getTierInfo(@Param('tierId') tierId: string) {
    const tierInfo = this.memberTierService.getTierInfo(tierId);
    if (!tierInfo) {
      return {
        success: false,
        message: `Tier "${tierId}" not found`,
      };
    }
    return {
      success: true,
      data: tierInfo,
    };
  }

  /**
   * Get member tier history and progress
   * GET /admin/member-tiers/history/:customerId
   */
  @Get('history/:customerId')
  async getMemberTierHistory(@Param('customerId') customerId: string) {
    const history = await this.memberTierService.getMemberTierHistory(
      customerId,
    );
    return {
      success: true,
      data: history,
    };
  }

  /**
   * Manually trigger tier update for all members
   * POST /admin/member-tiers/update-now
   * (Normally runs automatically at 2:00 AM daily)
   */
  @Post('update-now')
  @HttpCode(200)
  async manuallyUpdateTiers() {
    const result = await this.memberTierService.manuallyTriggerTierUpdate();
    return {
      success: true,
      message: `Tier update completed`,
      data: {
        totalProcessed: result.totalProcessed,
        updatedCount: result.updatedCount,
        updates: result.updates,
      },
    };
  }

  /**
   * Update tier for a specific member
   * POST /admin/member-tiers/update/:customerId
   */
  @Post('update/:customerId')
  @HttpCode(200)
  async updateMemberTier(@Param('customerId') customerId: string) {
    const update =
      await this.memberTierService.updateMemberTierForCustomer(customerId);
    return {
      success: true,
      data: update,
      message: update
        ? `Member tier updated: ${update.oldTier} → ${update.newTier}`
        : 'No tier change',
    };
  }
}
