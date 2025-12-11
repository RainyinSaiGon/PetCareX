export class TierInfoDto {
  id: string;
  name: string;
  minSpending: number;
  maxSpending: number;
  minPoints: number;
  maxPoints: number;
  discountPercentage: number;
  benefits: string[];
}

export class MemberTierUpdateDto {
  memberId: string;
  oldTier: string;
  newTier: string;
  updatedAt: Date;
  annualSpending: number;
  points: number;
}

export class MemberTierStatisticsDto {
  totalMembers: number;
  tierDistribution: {
    tierId: string;
    tierName: string;
    count: number;
    percentage: number;
    avgSpending: number;
    avgPoints: number;
  }[];
}

export class MemberTierHistoryDto {
  currentTier: string;
  currentSpending: number;
  currentPoints: number;
  tierInfo: TierInfoDto;
  nextTierInfo?: TierInfoDto;
  progressToNextTier: number;
}

export class ManualTierUpdateResponseDto {
  totalProcessed: number;
  updatedCount: number;
  updates: MemberTierUpdateDto[];
}
