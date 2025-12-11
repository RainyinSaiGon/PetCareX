# Member Tier Management (FQ-06) - Quick Reference Card

## 🎯 Four Tiers at a Glance

| Tier | Min Spending | Max Spending | Points | Discount | Highlights |
|------|-------------|-------------|--------|----------|-----------|
| 🥉 Bronze | 0 | 49.9M | 0-999 | 0% | Entry level |
| 🥈 Silver | 50M | 149.9M | 1K-2.9K | 5% | Priority support |
| 🥇 Gold | 150M | 299.9M | 3K-5.9K | 10% | VIP perks |
| 💎 Platinum | 300M+ | ∞ | 6K+ | 15% | Premium benefits |

> All currency in Vietnamese Dong (VND)  
> Points: 1 point = 50,000 VND

---

## 🔄 Automatic Features

```
Daily at 2:00 AM
    ↓
Process all active members
    ↓
Calculate annual spending (last 365 days)
    ↓
Update tier if changed
    ↓
Log all changes
```

---

## 📍 Service Location

```
backend/
└── src/modules/admin/
    ├── member-tier.service.ts       ← Core logic
    ├── member-tier.controller.ts    ← API endpoints
    ├── member-tier.module.ts        ← Module setup
    ├── dto/member-tier.dto.ts       ← Data types
    ├── MEMBER_TIER_IMPLEMENTATION_GUIDE.md
    └── member-tier.examples.ts      ← Usage examples
```

---

## 🔌 API Endpoints

### Admin Endpoints (All require admin role)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/admin/member-tiers` | List all tier definitions |
| GET | `/admin/member-tiers/statistics` | Tier distribution stats |
| GET | `/admin/member-tiers/{tierId}` | Get specific tier info |
| GET | `/admin/member-tiers/history/{customerId}` | Member tier progress |
| POST | `/admin/member-tiers/update-now` | Manual update all members |
| POST | `/admin/member-tiers/update/{customerId}` | Update specific member |

---

## 📊 Service Methods

```typescript
// Get tier info
getTierInfo(tierId: string): TierInfo
getAllTiers(): TierInfo[]

// Calculate spending
calculateAnnualSpending(customerId): { totalSpending, points, invoiceCount }

// Determine tier
determineTier(spending: number): string
getCurrentTier(customerId): string

// Update tiers
updateMemberTierForCustomer(customerId): MemberTierUpdate | null
manuallyTriggerTierUpdate(): { totalProcessed, updatedCount, updates }

// Get data
getMemberTierStatistics(): { totalMembers, tierDistribution }
getMemberTierHistory(customerId): { currentTier, currentSpending, progress... }
```

---

## 💾 Database Tables Used

| Table | Purpose | Key Fields |
|-------|---------|-----------|
| `khach_hang_thanh_vien` | Member tier data | `hangThanhVienId`, `tongChiTieu`, `tongDiemTichLuy` |
| `hoa_don` | Revenue records | `tongTien`, `ngayTao` |
| `khach_hang` | Customer master | `maKhachHang` |

---

## 🚀 Quick Start Examples

### Get Member's Tier
```typescript
const tier = await service.getCurrentTier('customer-123');
// Returns: 'gold'
```

### Calculate Spending & Points
```typescript
const data = await service.calculateAnnualSpending('customer-123');
// Returns: { totalSpending: 200000000, points: 4000, invoiceCount: 50 }
```

### Get Tier Benefits
```typescript
const tier = service.getTierInfo('platinum');
// Returns: { name, discountPercentage, benefits, minSpending, maxSpending... }
```

### Update All Members
```typescript
const result = await service.manuallyTriggerTierUpdate();
// Returns: { totalProcessed: 500, updatedCount: 15, updates: [...] }
```

---

## ⚙️ Configuration

### Change Scheduled Job Time

File: `member-tier.service.ts`
```typescript
@Cron('0 2 * * *')  // Change this cron expression
async updateAllMemberTiers()
```

Common expressions:
- `'0 0 * * *'` = Midnight
- `'0 6 * * *'` = 6:00 AM
- `'0 */6 * * *'` = Every 6 hours

### Adjust Tier Thresholds

File: `member-tier.service.ts`
```typescript
private readonly TIER_DEFINITIONS: TierInfo[] = [
  {
    id: 'bronze',
    minSpending: 0,
    maxSpending: 49_999_999,  // Modify here
    discountPercentage: 0,
    // ...
  }
]
```

### Change Points Calculation

File: `member-tier.service.ts`, `calculateAnnualSpending()` method
```typescript
const points = Math.floor(totalSpending / 50_000);  // Divisor = 50,000 VND per point
```

---

## 🧪 Testing

### Manual Test: Trigger Update
```bash
curl -X POST http://localhost:3000/admin/member-tiers/update-now \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

### Test: Get Member Progress
```bash
curl http://localhost:3000/admin/member-tiers/history/cust-123 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test: View Stats
```bash
curl http://localhost:3000/admin/member-tiers/statistics \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📝 Integration Points

### With Sales Module
```typescript
// When selling to member
const tier = await memberTierService.getTierInfo(customerId);
const discount = amount * (tier.discountPercentage / 100);
```

### With Customer Portal
```typescript
// Show on member dashboard
const tierHistory = await memberTierService.getMemberTierHistory(customerId);
// Display: current tier, spending, progress to next tier
```

### With Analytics
```typescript
// Admin dashboard stats
const stats = await memberTierService.getMemberTierStatistics();
// Show: member distribution, average spending by tier
```

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Tier not updating | Check timezone, verify ScheduleModule imported, check logs |
| Wrong points | Verify invoice amounts, check calculation: spending ÷ 50,000 |
| Member wrong tier | Run manual update, check membership status |
| Scheduled job not running | Verify timezone config, check application logs |

---

## 📚 Full Documentation

- **Complete Guide**: `MEMBER_TIER_IMPLEMENTATION_GUIDE.md`
- **Usage Examples**: `member-tier.examples.ts`
- **Unit Tests**: `member-tier.service.spec.ts`
- **Implementation Summary**: `MEMBER_TIER_IMPLEMENTATION_SUMMARY.md`

---

## ✅ Checklist for Implementation

- [ ] Files created in correct location
- [ ] admin.module.ts updated with imports
- [ ] @nestjs/schedule package installed
- [ ] Database has required tables
- [ ] JWT auth configured
- [ ] Manual test successful
- [ ] Monitor first automatic run at 2:00 AM
- [ ] Database updates verified
- [ ] Application logs checked

---

## 📞 Key Contacts

**For Questions About**:
- **Code**: See `member-tier.service.ts` and `member-tier.controller.ts`
- **Configuration**: See `MEMBER_TIER_IMPLEMENTATION_GUIDE.md`
- **Integration**: See `member-tier.examples.ts`
- **Testing**: See `member-tier.service.spec.ts`

---

## 🎓 Key Concepts

**Tier System**: 4-level membership based on annual spending
**Automatic Updates**: Daily scheduled job at 2:00 AM
**Points**: 1 point per 50,000 VND spent
**Discounts**: Tier-based discount percentages (0-15%)
**Benefits**: Tier-specific benefits and perks
**Spending Window**: Last 365 days for tier calculation

---

**Last Updated**: December 10, 2025  
**Status**: ✅ Production Ready
