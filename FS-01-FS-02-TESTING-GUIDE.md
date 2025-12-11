# FS-01 & FS-02 Integration & Testing Guide

## Quick Start

### Step 1: Backend Setup

1. **Verify Module Registration**
   ```bash
   # Check app.module.ts imports SalesModule
   grep "SalesModule" src/app.module.ts
   ```

2. **Start Backend Server**
   ```bash
   cd backend
   npm run start:dev
   ```
   Expected output: Server running on http://localhost:3000

3. **Database Synchronization**
   - TypeORM will auto-synchronize entities on start
   - Verify no migration errors in console

### Step 2: Frontend Setup

1. **Update Environment**
   ```typescript
   // frontend/src/environments/environment.ts
   export const environment = {
     apiUrl: 'http://localhost:3000/api'
   };
   ```

2. **Start Frontend Server**
   ```bash
   cd frontend
   npm start
   ```
   Expected output: Server running on http://localhost:4200

### Step 3: Test API Endpoints

#### Customer Management (FS-01)

**Create Customer**:
```bash
curl -X POST http://localhost:3000/api/customers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{
    "HoTen": "Test Customer",
    "SoDienThoai": "0987654321",
    "Email": "test@example.com"
  }'
```

**Get Customers**:
```bash
curl -X GET "http://localhost:3000/api/customers?page=1&limit=10" \
  -H "Authorization: Bearer <TOKEN>"
```

**Search Customers**:
```bash
curl -X GET "http://localhost:3000/api/customers/search/query?q=test" \
  -H "Authorization: Bearer <TOKEN>"
```

**Update Customer**:
```bash
curl -X PUT http://localhost:3000/api/customers/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{
    "HoTen": "Updated Name",
    "Email": "updated@example.com"
  }'
```

**Delete Customer**:
```bash
curl -X DELETE http://localhost:3000/api/customers/1 \
  -H "Authorization: Bearer <TOKEN>"
```

#### Customer Statistics (FS-02)

**Get Statistics**:
```bash
curl -X GET http://localhost:3000/api/customers/statistics/overview \
  -H "Authorization: Bearer <TOKEN>"
```

**Get Inactive Customers**:
```bash
curl -X GET "http://localhost:3000/api/customers/statistics/inactive?days=90" \
  -H "Authorization: Bearer <TOKEN>"
```

**Get Spending Trends**:
```bash
curl -X GET "http://localhost:3000/api/customers/statistics/trends?months=12" \
  -H "Authorization: Bearer <TOKEN>"
```

#### Pet Management

**Create Pet**:
```bash
curl -X POST "http://localhost:3000/api/pets?customerId=1" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{
    "TenThuCung": "Fluffy",
    "MaChungLoai": "CAT"
  }'
```

**Get Customer Pets**:
```bash
curl -X GET http://localhost:3000/api/pets/customer/1 \
  -H "Authorization: Bearer <TOKEN>"
```

**Get Pet Medical History**:
```bash
curl -X GET http://localhost:3000/api/pets/1/medical-history \
  -H "Authorization: Bearer <TOKEN>"
```

### Step 4: Test Frontend Components

#### Customer List Page
1. Navigate to `/customers`
2. Verify pagination controls work
3. Test search functionality
4. Test tier filtering
5. Test Create/Edit/Delete actions

#### Customer Statistics Dashboard
1. Navigate to `/customers/statistics`
2. Verify metrics display
3. Check tier distribution chart
4. Verify top spenders list
5. Check inactive customers table
6. Verify spending trends chart

## Troubleshooting

### Issue: 401 Unauthorized

**Solution**: Ensure JWT token is valid
```bash
# Get token from login endpoint
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "password"
  }'
```

### Issue: 404 Not Found

**Solution**: Check endpoint path and module registration
```typescript
// Verify SalesModule is imported in app.module.ts
imports: [
  // ...
  SalesModule,  // Should be present
  // ...
]
```

### Issue: TypeORM Sync Errors

**Solution**: Clear and resync database
```bash
# In TypeORM config, set:
synchronize: true  // Auto-sync on dev
dropSchema: false  // Don't drop on restart
```

### Issue: CORS Errors

**Solution**: Configure CORS in backend
```typescript
// main.ts
app.enableCors({
  origin: 'http://localhost:4200',
  credentials: true,
});
```

## Performance Testing

### Load Test Sample Sizes

**Small Database** (for testing):
- 100 customers
- 1000 invoices
- 200 pets

**Medium Database**:
- 10,000 customers
- 100,000 invoices
- 20,000 pets

**Large Database**:
- 100,000+ customers
- 1,000,000+ invoices
- 200,000+ pets

### Expected Response Times

| Operation | Small DB | Medium DB | Large DB |
|-----------|----------|-----------|----------|
| List customers (10) | ~50ms | ~75ms | ~150ms |
| Search customers | ~30ms | ~50ms | ~100ms |
| Get statistics | ~100ms | ~300ms | ~1000ms |
| Get inactive | ~75ms | ~200ms | ~800ms |
| Get trends | ~50ms | ~150ms | ~500ms |
| Create customer | ~50ms | ~50ms | ~50ms |

## Data Validation Tests

### Customer Creation Validation

**Valid Cases**:
```json
{
  "HoTen": "Nguyễn Văn A",
  "SoDienThoai": "0987654321"
}
```

**Invalid Cases** (should reject):
- Phone: "012345" (not 10 digits)
- Phone: "abc" (non-numeric)
- Name: "" (empty)
- Name: 2 chars (too short)
- Name: 51+ chars (too long)

### Tier System Tests

**Bronze** (default, $0+):
```json
{
  "MaKhachHang": 1,
  "TenHang": "Bronze",
  "TongChiTieu": 0
}
```

**Silver** ($1,000,000+):
```json
{
  "MaKhachHang": 2,
  "TenHang": "Silver",
  "TongChiTieu": 1000000
}
```

**Gold** ($5,000,000+):
```json
{
  "MaKhachHang": 3,
  "TenHang": "Gold",
  "TongChiTieu": 5000000
}
```

**Platinum** ($10,000,000+):
```json
{
  "MaKhachHang": 4,
  "TenHang": "Platinum",
  "TongChiTieu": 10000000
}
```

## Integration with Existing Features

### With Member Tier System (FQ-06)

The Customer Service integrates with the existing member tier service:

1. When customer is created, assigned to Bronze tier
2. CustomerService tracks `TongChiTieu` (total spending)
3. `TenHang` (tier name) is updated based on spending
4. Links to existing `KhachHangThanhVien` entity

### With Invoice System

1. Customer spending automatically tracked via `HoaDon` (invoices)
2. Inactive detection uses `NgayLap` (invoice date)
3. Spending trends calculated from invoice amounts
4. Top spenders ranked by total invoice amounts

### With Pet Management

1. Pets linked to customers via `MaKhachHang`
2. Medical history from `LichHen` (appointments)
3. Pet statistics independent of customer stats
4. Pets can be filtered by customer

## Monitoring & Logging

### Enable Request Logging

```typescript
// main.ts
import { Logger } from '@nestjs/common';

const logger = new Logger('AppModule');

logger.log('Customer Service initialized');
logger.warn('High latency detected for statistics');
logger.error('Database connection failed');
```

### Monitor Endpoints

```bash
# Check which endpoints are registered
curl http://localhost:3000/api/customers --head -v

# Should return 401 without token, not 404
```

## Security Considerations

### Authentication
- ✅ All endpoints protected by `@UseGuards(JwtAuthGuard)`
- ✅ Requires valid JWT token from `/api/auth/login`

### Authorization
- ⚠️ Currently allows any authenticated user
- 🔄 Consider adding role-based access:
  - Admin: Full access
  - Manager: Create/Read/Update
  - Customer: Read own data only

### Input Validation
- ✅ Phone format validation (10 digits)
- ✅ Email format validation (optional)
- ✅ Name length validation (3-50 chars)
- ✅ Type validation on all DTOs

### Data Privacy
- ✅ Soft delete preserves customer history
- ✅ IsActive flag prevents accidental exposure
- ⚠️ Consider PII protection for sensitive fields

## Backup & Recovery

### Database Backups

```bash
# PostgreSQL backup
pg_dump -U username -d petcarex > backup.sql

# Restore
psql -U username -d petcarex < backup.sql
```

### Customer Data Recovery

Customer deactivation is reversible:

```typescript
// Reactivate customer
customer.IsActive = true;
await customerRepository.save(customer);
```

## Deployment Checklist

- [ ] Backend compiled without errors
- [ ] Frontend compiled without errors
- [ ] SalesModule imported in app.module.ts
- [ ] All endpoints returning 401 (not 404)
- [ ] CORS configured for frontend origin
- [ ] JWT authentication working
- [ ] Database tables created
- [ ] Sample data loaded
- [ ] Pagination working
- [ ] Search functionality verified
- [ ] Statistics calculated correctly
- [ ] Inactive detection working
- [ ] Pet operations functional
- [ ] Error handling in place
- [ ] Logging enabled
- [ ] Documentation reviewed

## Contact & Support

For issues or questions:
1. Check error messages in browser console
2. Review backend logs in terminal
3. Test endpoints with curl/Postman
4. Verify database connection
5. Check module imports
6. Review TypeScript types

---

**Ready for Production Testing**

All systems are integrated and ready for comprehensive testing and deployment.
