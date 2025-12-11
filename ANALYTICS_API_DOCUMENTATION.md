# Analytics & Reports API Documentation (FQ-02 to FQ-04)

## Overview
Complete analytics and reporting system for PetCareX admin dashboard with revenue reports, top services analysis, member tier statistics, and comprehensive dashboards with charts.

## Authentication
All endpoints require JWT authentication with ADMIN or MANAGER role.

```
Headers:
Authorization: Bearer <JWT_TOKEN>
```

---

## 1. Revenue Report (FQ-02)

### Endpoint
```
GET /admin/analytics/revenue
```

### Description
Get comprehensive revenue report for the entire system with breakdown by products, services, time periods, and branches.

### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| startDate | string | No | Start date (ISO format: YYYY-MM-DD). Defaults to current month start |
| endDate | string | No | End date (ISO format: YYYY-MM-DD). Defaults to today |
| timeFrame | enum | No | Grouping: `daily`, `weekly`, `monthly`, `yearly`. Default: `daily` |
| maChiNhanh | string | No | Filter by specific branch code |

### Example Request
```bash
# Get monthly revenue for 2024
GET /admin/analytics/revenue?startDate=2024-01-01&endDate=2024-12-31&timeFrame=monthly

# Get daily revenue for a specific branch
GET /admin/analytics/revenue?maChiNhanh=CN001&timeFrame=daily
```

### Response
```json
{
  "totalRevenue": 500000000,
  "productRevenue": 300000000,
  "serviceRevenue": 200000000,
  "revenueByPeriod": [
    {
      "period": "2024-01",
      "revenue": 45000000,
      "productRevenue": 27000000,
      "serviceRevenue": 18000000
    },
    {
      "period": "2024-02",
      "revenue": 52000000,
      "productRevenue": 31000000,
      "serviceRevenue": 21000000
    }
  ],
  "revenueByBranch": [
    {
      "maChiNhanh": "CN001",
      "tenChiNhanh": "Chi nhánh Quận 1",
      "revenue": 250000000
    },
    {
      "maChiNhanh": "CN002",
      "tenChiNhanh": "Chi nhánh Quận 2",
      "revenue": 250000000
    }
  ],
  "comparison": {
    "previousPeriod": 450000000,
    "changePercentage": 11.11
  }
}
```

### Response Fields
- `totalRevenue`: Total revenue from both products and services
- `productRevenue`: Revenue from product sales only
- `serviceRevenue`: Revenue from medical services only
- `revenueByPeriod`: Array of revenue grouped by selected time frame
- `revenueByBranch`: Revenue breakdown by branch (only if not filtered by branch)
- `comparison`: Comparison with previous period of same length

---

## 2. Top Services Analysis (FQ-03)

### Endpoint
```
GET /admin/analytics/top-services
```

### Description
Get top performing medical services by usage frequency and revenue over a specified period (default: 3 months).

### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| months | number | No | Number of months to analyze. Default: 3 |
| limit | number | No | Number of top services to return. Default: 10 |

### Example Request
```bash
# Get top 10 services for last 3 months
GET /admin/analytics/top-services

# Get top 20 services for last 6 months
GET /admin/analytics/top-services?months=6&limit=20
```

### Response
```json
[
  {
    "maDichVu": "DV001",
    "tenDichVu": "Khám tổng quát",
    "soLanSuDung": 150,
    "tongDoanhThu": 30000000,
    "trungBinhGia": 200000
  },
  {
    "maDichVu": "DV002",
    "tenDichVu": "Tiêm phòng dại",
    "soLanSuDung": 120,
    "tongDoanhThu": 18000000,
    "trungBinhGia": 150000
  }
]
```

### Response Fields
- `maDichVu`: Service code
- `tenDichVu`: Service name
- `soLanSuDung`: Number of times service was used
- `tongDoanhThu`: Total revenue from this service
- `trungBinhGia`: Average price per service usage

---

## 3. Member Tier Statistics (FQ-04)

### Endpoint
```
GET /admin/analytics/member-tiers
```

### Description
Get comprehensive statistics about membership tiers including distribution, recent upgrades, and revenue by tier.

### Example Request
```bash
GET /admin/analytics/member-tiers
```

### Response
```json
{
  "totalMembers": 500,
  "tierDistribution": [
    {
      "maHang": "BRONZE",
      "tenHang": "Đồng",
      "soLuongThanhVien": 300,
      "tyLe": 60.0,
      "tongChiTieu": 150000000,
      "trungBinhChiTieu": 500000
    },
    {
      "maHang": "SILVER",
      "tenHang": "Bạc",
      "soLuongThanhVien": 150,
      "tyLe": 30.0,
      "tongChiTieu": 225000000,
      "trungBinhChiTieu": 1500000
    },
    {
      "maHang": "GOLD",
      "tenHang": "Vàng",
      "soLuongThanhVien": 50,
      "tyLe": 10.0,
      "tongChiTieu": 250000000,
      "trungBinhChiTieu": 5000000
    }
  ],
  "recentUpgrades": [
    {
      "maKhachHang": "KH001",
      "tenKhachHang": "Nguyễn Văn A",
      "hangCu": "BRONZE",
      "hangMoi": "SILVER",
      "ngayNangHang": "2024-12-01T00:00:00Z"
    }
  ],
  "tierRevenue": [
    {
      "maHang": "BRONZE",
      "tenHang": "Đồng",
      "doanhThu": 150000000
    },
    {
      "maHang": "SILVER",
      "tenHang": "Bạc",
      "doanhThu": 225000000
    },
    {
      "maHang": "GOLD",
      "tenHang": "Vàng",
      "doanhThu": 250000000
    }
  ]
}
```

### Response Fields
- `totalMembers`: Total number of members in the system
- `tierDistribution`: Breakdown of members by tier
  - `soLuongThanhVien`: Number of members in this tier
  - `tyLe`: Percentage of total members
  - `tongChiTieu`: Total spending by all members in this tier
  - `trungBinhChiTieu`: Average spending per member
- `recentUpgrades`: List of recent tier upgrades (last 30 days)
- `tierRevenue`: Total revenue generated by each tier

---

## 4. Dashboard Summary

### Endpoint
```
GET /admin/analytics/dashboard
```

### Description
Get comprehensive dashboard data combining all analytics including KPIs, top performers, and chart data.

### Example Request
```bash
GET /admin/analytics/dashboard
```

### Response
```json
{
  "revenue": {
    "today": 5000000,
    "thisWeek": 35000000,
    "thisMonth": 150000000,
    "thisYear": 1800000000
  },
  "customers": {
    "total": 1200,
    "new": 45,
    "active": 980,
    "members": 500
  },
  "appointments": {
    "today": 25,
    "thisWeek": 180,
    "pending": 15,
    "completed": 165
  },
  "employees": {
    "total": 50,
    "active": 48,
    "byType": [
      {
        "loaiNhanVien": "Bác sĩ",
        "soLuong": 15
      },
      {
        "loaiNhanVien": "Tiếp tân",
        "soLuong": 10
      },
      {
        "loaiNhanVien": "Nhân viên kho",
        "soLuong": 8
      }
    ]
  },
  "topProducts": [
    {
      "maSanPham": "SP001",
      "tenSanPham": "Thức ăn cho chó",
      "soLuongBan": 150,
      "doanhThu": 30000000
    }
  ],
  "topServices": [
    {
      "maDichVu": "DV001",
      "tenDichVu": "Khám tổng quát",
      "soLanSuDung": 50,
      "tongDoanhThu": 10000000,
      "trungBinhGia": 200000
    }
  ],
  "revenueChart": {
    "labels": ["2024-12-04", "2024-12-05", "2024-12-06", "2024-12-07", "2024-12-08", "2024-12-09", "2024-12-10"],
    "data": [4500000, 5200000, 4800000, 5500000, 6000000, 5300000, 5000000]
  }
}
```

---

## Frontend Usage Examples

### Angular Service
```typescript
import { AnalyticsService, RevenueTimeFrame } from './analytics.service';

// Get revenue report
this.analyticsService.getRevenueReport({
  startDate: '2024-01-01',
  endDate: '2024-12-31',
  timeFrame: RevenueTimeFrame.MONTHLY
}).subscribe(report => {
  console.log('Total Revenue:', report.totalRevenue);
  console.log('Product Revenue:', report.productRevenue);
  console.log('Service Revenue:', report.serviceRevenue);
});

// Get top services
this.analyticsService.getTopServices(3, 10).subscribe(services => {
  console.log('Top Services:', services);
});

// Get member tier statistics
this.analyticsService.getMemberTierStatistics().subscribe(stats => {
  console.log('Total Members:', stats.totalMembers);
  console.log('Tier Distribution:', stats.tierDistribution);
});

// Get dashboard summary
this.analyticsService.getDashboardSummary().subscribe(dashboard => {
  console.log('Revenue This Month:', dashboard.revenue.thisMonth);
  console.log('Total Customers:', dashboard.customers.total);
});
```

---

## Error Responses

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### 403 Forbidden
```json
{
  "statusCode": 403,
  "message": "Insufficient permissions. ADMIN or MANAGER role required."
}
```

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Invalid date format. Use YYYY-MM-DD",
  "error": "Bad Request"
}
```

---

## Performance Considerations

1. **Caching**: Consider implementing Redis caching for dashboard summary (TTL: 5 minutes)
2. **Indexes**: Ensure database indexes on:
   - `hoadon.ngayLap`
   - `thanhtoandichvuyte.ngayThanhToan`
   - `khachhangthanhvien.maHang`
3. **Pagination**: For large datasets, consider adding pagination to top services/products
4. **Date Range Limits**: Recommend limiting date ranges to prevent performance issues

---

## Business Rules

1. **Revenue Calculation**:
   - Product revenue = Sum of all `hoadonsanpham.thanhTien`
   - Service revenue = Sum of all `thanhtoandichvuyte.soTien`
   - Only completed/paid transactions are included

2. **Top Services**:
   - Ranked by usage frequency (number of times used)
   - Includes both individual and package services
   - Default period: last 3 months

3. **Member Tiers**:
   - Tier distribution shows current snapshot
   - Recent upgrades limited to last 30 days
   - Revenue calculated from total spending (`tongChiTieu`)

4. **Dashboard**:
   - Revenue chart shows last 7 days by default
   - Top products/services limited to last 30 days
   - KPIs calculated in real-time

---

## Testing

### Test with cURL
```bash
# Login first
TOKEN=$(curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"Admin@123"}' | jq -r '.access_token')

# Get revenue report
curl -X GET "http://localhost:3000/admin/analytics/revenue?timeFrame=monthly" \
  -H "Authorization: Bearer $TOKEN"

# Get top services
curl -X GET "http://localhost:3000/admin/analytics/top-services?months=3&limit=10" \
  -H "Authorization: Bearer $TOKEN"

# Get member tiers
curl -X GET "http://localhost:3000/admin/analytics/member-tiers" \
  -H "Authorization: Bearer $TOKEN"

# Get dashboard
curl -X GET "http://localhost:3000/admin/analytics/dashboard" \
  -H "Authorization: Bearer $TOKEN"
```

---

## Next Steps

1. Add export functionality (PDF/Excel reports)
2. Implement scheduled reports via email
3. Add real-time notifications for key metrics
4. Create branch-specific analytics views
5. Add predictive analytics and trends
