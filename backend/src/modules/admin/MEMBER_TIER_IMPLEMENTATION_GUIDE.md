# Member Tier Management System (FQ-06) - Implementation Guide

## Overview
Automated system for managing customer membership tiers based on annual spending. Tiers are automatically updated daily at 2:00 AM or manually triggered by admins.

## Features

### 1. Four-Tier System
- **Bronze**: 0 - 49,999,999 VND (Default tier, no discount)
- **Silver**: 50,000,000 - 149,999,999 VND (5% discount)
- **Gold**: 150,000,000 - 299,999,999 VND (10% discount)
- **Platinum**: 300,000,000+ VND (15% discount)

### 2. Automated Tier Calculation
- Based on annual spending (last 365 days)
- Points calculation: 1 point = 50,000 VND
- Daily scheduled job at 2:00 AM (configurable)

### 3. Admin Features
- View all tier definitions
- Get tier statistics dashboard
- Manual tier update trigger
- View member tier history and progress
- Update individual member tier

## File Structure

```
backend/src/modules/admin/
├── member-tier.service.ts      # Core service with tier logic
├── member-tier.controller.ts   # REST endpoints
├── member-tier.module.ts       # Module definition
├── dto/
│   └── member-tier.dto.ts      # TypeScript DTOs
├── admin.module.ts             # Updated to include MemberTierModule
└── admin.controller.ts         # Updated with new endpoints
```

## Service Methods

### MemberTierService

#### 1. `getTierInfo(tierId: string): TierInfo`
Get detailed information about a specific tier.

```typescript
const tierInfo = memberTierService.getTierInfo('gold');
// Returns: { id, name, minSpending, maxSpending, discountPercentage, benefits[] }
```

#### 2. `getAllTiers(): TierInfo[]`
Get all tier definitions.

```typescript
const allTiers = memberTierService.getAllTiers();
// Returns array of all 4 tier definitions
```

#### 3. `calculateAnnualSpending(customerId): Promise<{ totalSpending, points, invoiceCount }>`
Calculate customer's spending for the last 365 days.

```typescript
const spending = await memberTierService.calculateAnnualSpending('customer-123');
// Returns: { totalSpending: 150000000, points: 3000, invoiceCount: 25 }
```

#### 4. `determineTier(spending: number): string`
Determine tier based on spending amount.

```typescript
const tier = memberTierService.determineTier(150000000);
// Returns: 'gold'
```

#### 5. `getCurrentTier(customerId): Promise<string>`
Get customer's current tier.

```typescript
const tier = await memberTierService.getCurrentTier('customer-123');
// Returns: 'gold'
```

#### 6. `updateMemberTierForCustomer(customerId): Promise<MemberTierUpdate | null>`
Update a single customer's tier (only if changed).

```typescript
const update = await memberTierService.updateMemberTierForCustomer('customer-123');
// Returns: { memberId, oldTier, newTier, updatedAt, annualSpending, points }
// Or null if no tier change
```

#### 7. `updateAllMemberTiers(): Promise<void>` ⏰ **SCHEDULED**
Runs automatically every day at 2:00 AM. Updates all active members' tiers.

```typescript
// Automatically triggered by @Cron('0 2 * * *')
// No manual call needed
```

#### 8. `manuallyTriggerTierUpdate(): Promise<{ totalProcessed, updatedCount, updates }>`
Manually trigger tier update for all members (admin action).

```typescript
const result = await memberTierService.manuallyTriggerTierUpdate();
// Returns: {
//   totalProcessed: 500,
//   updatedCount: 15,
//   updates: [{ memberId, oldTier, newTier, ... }]
// }
```

#### 9. `getMemberTierStatistics(): Promise<{ totalMembers, tierDistribution }>`
Get tier distribution and statistics for dashboard.

```typescript
const stats = await memberTierService.getMemberTierStatistics();
// Returns: {
//   totalMembers: 500,
//   tierDistribution: [
//     { tierId: 'bronze', count: 350, percentage: 70, avgSpending: 25000000 },
//     { tierId: 'silver', count: 100, percentage: 20, avgSpending: 80000000 },
//     ...
//   ]
// }
```

#### 10. `getMemberTierHistory(customerId): Promise<{ currentTier, currentSpending, currentPoints, tierInfo, nextTierInfo, progressToNextTier }>`
Get detailed tier information and progress for a member.

```typescript
const history = await memberTierService.getMemberTierHistory('customer-123');
// Returns: {
//   currentTier: 'gold',
//   currentSpending: 250000000,
//   currentPoints: 5000,
//   tierInfo: { ... },
//   nextTierInfo: { id: 'platinum', ... },
//   progressToNextTier: 50  // 50% toward platinum
// }
```

## API Endpoints

### 1. Get All Tier Definitions
```
GET /admin/member-tiers
Authorization: Bearer <token>
Roles: admin

Response: {
  success: true,
  data: [
    {
      id: 'bronze',
      name: 'Bronze',
      minSpending: 0,
      maxSpending: 49999999,
      minPoints: 0,
      maxPoints: 999,
      discountPercentage: 0,
      benefits: ['Tích lũy điểm', 'Hỗ trợ khách hàng']
    },
    ...
  ]
}
```

### 2. Get Tier Statistics Dashboard
```
GET /admin/member-tiers/statistics
Authorization: Bearer <token>
Roles: admin

Response: {
  success: true,
  data: {
    totalMembers: 500,
    tierDistribution: [
      {
        tierId: 'bronze',
        tierName: 'Bronze',
        count: 350,
        percentage: 70,
        avgSpending: 25000000,
        avgPoints: 500
      },
      ...
    ]
  }
}
```

### 3. Get Specific Tier Info
```
GET /admin/member-tiers/{tierId}
Authorization: Bearer <token>
Roles: admin

Response: {
  success: true,
  data: {
    id: 'gold',
    name: 'Gold',
    minSpending: 150000000,
    maxSpending: 299999999,
    minPoints: 3000,
    maxPoints: 5999,
    discountPercentage: 10,
    benefits: [...]
  }
}
```

### 4. Get Member Tier History
```
GET /admin/member-tiers/history/{customerId}
Authorization: Bearer <token>
Roles: admin

Response: {
  success: true,
  data: {
    currentTier: 'gold',
    currentSpending: 250000000,
    currentPoints: 5000,
    tierInfo: { ... },
    nextTierInfo: { ... },
    progressToNextTier: 50
  }
}
```

### 5. Manually Update All Member Tiers
```
POST /admin/member-tiers/update-now
Authorization: Bearer <token>
Roles: admin

Response: {
  success: true,
  message: 'Tier update completed',
  data: {
    totalProcessed: 500,
    updatedCount: 15,
    updates: [
      {
        memberId: 'cust-123',
        oldTier: 'silver',
        newTier: 'gold',
        updatedAt: '2025-12-10T10:30:00Z',
        annualSpending: 200000000,
        points: 4000
      },
      ...
    ]
  }
}
```

### 6. Update Individual Member Tier
```
POST /admin/member-tiers/update/{customerId}
Authorization: Bearer <token>
Roles: admin

Response: {
  success: true,
  data: {
    memberId: 'cust-123',
    oldTier: 'silver',
    newTier: 'gold',
    updatedAt: '2025-12-10T10:30:00Z',
    annualSpending: 200000000,
    points: 4000
  },
  message: 'Member tier updated: silver → gold'
}
```

## Database Entities Used

1. **KhachHang**: Customer master data
2. **KhachHangThanhVien**: Member tier information
   - `hangThanhVienId`: Current tier (bronze, silver, gold, platinum)
   - `tongChiTieu`: Total spending (VND)
   - `tongDiemTichLuy`: Total points accumulated
   - `ngayCapNhatTrangThai`: Last update date
3. **HangThanhVien**: Tier master data (optional reference)
4. **HoaDon**: Invoice records for spending calculation

## Configuration

### Scheduled Job Timing
The tier update job runs at 2:00 AM daily:
```typescript
@Cron('0 2 * * *')  // 02:00:00 every day
```

To change timing, modify the cron expression:
- `'0 0 * * *'` - 12:00 AM (midnight)
- `'0 6 * * *'` - 6:00 AM
- `'0 0 * * 0'` - 12:00 AM every Sunday

### Spending Thresholds
Edit `TIER_DEFINITIONS` array in `member-tier.service.ts`:

```typescript
private readonly TIER_DEFINITIONS: TierInfo[] = [
  {
    id: 'bronze',
    name: 'Bronze',
    minSpending: 0,
    maxSpending: 49_999_999,
    // ... modify values as needed
  },
  // ...
];
```

### Points Calculation
Current: 1 point = 50,000 VND
```typescript
const points = Math.floor(totalSpending / 50_000);
```

To change: Modify the divisor in `calculateAnnualSpending()` method.

## Logging

The service logs:
1. **Daily job start/completion** with processing duration
2. **Tier changes** for each member (old tier → new tier)
3. **Errors** during processing

Logs visible in:
- Console (development)
- Application logs (production)

Example:
```
[MemberTierService] Starting scheduled member tier update job...
[MemberTierService] Processing 500 active members...
[MemberTierService] Tier updated: cust-123 silver → gold
[MemberTierService] Member tier update completed. Updated: 15/500, Duration: 2.3s
```

## Error Handling

The service handles:
- Non-existent customers
- Database connection errors
- Invalid tier IDs
- Missing membership records (creates new if needed)

All errors are logged and returned in responses with `success: false`.

## Testing the System

### Test Scenario 1: Manual Tier Update
```bash
# Trigger manual tier update
curl -X POST http://localhost:3000/admin/member-tiers/update-now \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json"
```

### Test Scenario 2: Check Member Progress
```bash
# Get member tier history
curl http://localhost:3000/admin/member-tiers/history/cust-123 \
  -H "Authorization: Bearer <token>"
```

### Test Scenario 3: View Statistics
```bash
# Get tier distribution
curl http://localhost:3000/admin/member-tiers/statistics \
  -H "Authorization: Bearer <token>"
```

## Future Enhancements

1. **Tier Change History Table** - Audit trail of all tier changes
2. **Custom Notifications** - Send email/SMS on tier upgrade
3. **Benefits Management** - Dynamic tier benefits configuration
4. **Bonus Points** - Special promotions for specific tiers
5. **Tier Expiration** - Reset tiers annually or quarterly
6. **Grandfathering** - Lock tier level temporarily on downgrade

## Integration with Other Systems

### Sales System (FS-03)
When processing sales:
1. Record invoice in HoaDon
2. Member service can recalculate tier automatically
3. Apply tier-based discount before finalizing

### Customer Portal (FC-03)
Display member:
- Current tier name and benefits
- Annual spending progress
- Points balance
- Progress to next tier with target amount

### Analytics Dashboard
Show:
- Tier distribution pie chart
- Member growth by tier
- Average spending by tier
- Tier change trends

## Troubleshooting

### Issue: Tier not updating
**Solution**: Check if member has active membership status in `KhachHangThanhVien.trangThaiThanhVien = 'active'`

### Issue: Points not calculating correctly
**Solution**: Verify invoices have correct `tongTien` values and `ngayTao` dates within last 365 days

### Issue: Scheduled job not running
**Solution**: 
1. Ensure `ScheduleModule` is imported in module
2. Check application logs for errors
3. Verify scheduler is not disabled

### Issue: Cron job running at wrong time
**Solution**: Verify server timezone and adjust cron expression accordingly

## Database Queries for Manual Verification

### Check member's current spending:
```sql
SELECT 
  k.maKhachHang,
  k.tenKhachHang,
  SUM(h.tongTien) as annual_spending,
  FLOOR(SUM(h.tongTien) / 50000) as points,
  ktv.hangThanhVienId as current_tier
FROM khach_hang k
LEFT JOIN hoa_don h ON k.maKhachHang = h.khachHangId 
  AND h.ngayTao >= NOW() - INTERVAL '365 days'
LEFT JOIN khach_hang_thanh_vien ktv ON k.maKhachHang = ktv.khachHangId
WHERE k.maKhachHang = 'cust-123'
GROUP BY k.maKhachHang, k.tenKhachHang, ktv.hangThanhVienId;
```

### List members near tier upgrade:
```sql
SELECT 
  k.maKhachHang,
  k.tenKhachHang,
  SUM(h.tongTien) as annual_spending,
  ktv.hangThanhVienId as current_tier
FROM khach_hang k
LEFT JOIN hoa_don h ON k.maKhachHang = h.khachHangId 
  AND h.ngayTao >= NOW() - INTERVAL '365 days'
LEFT JOIN khach_hang_thanh_vien ktv ON k.maKhachHang = ktv.khachHangId
WHERE ktv.trangThaiThanhVien = 'active'
GROUP BY k.maKhachHang, k.tenKhachHang, ktv.hangThanhVienId
HAVING SUM(h.tongTien) >= 40000000 AND SUM(h.tongTien) < 50000000
ORDER BY SUM(h.tongTien) DESC;
```
