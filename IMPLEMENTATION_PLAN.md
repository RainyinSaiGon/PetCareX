# PetCareX Implementation Plan

## Project Overview
Full-featured Pet Care Management System with role-based access control, medical records, inventory management, and customer portal.

## Architecture

### Technology Stack
- **Backend**: NestJS + TypeORM + PostgreSQL
- **Frontend**: Angular 19
- **Database**: PostgreSQL (Supabase)
- **Authentication**: JWT

### User Roles
1. **Admin** - System-wide management and analytics
2. **Branch Manager** (Quản lý chi nhánh) - Branch operations
3. **Receptionist/Sales** (Tiếp tân/Bán hàng) - Customer service and sales
4. **Veterinarian** (Bác sĩ) - Medical services
5. **Warehouse Staff** (Nhân viên kho) - Inventory management
6. **Customer** (Khách hàng) - Self-service portal

## Implementation Phases

### Phase 1: Foundation (Week 1-2) ✅ COMPLETED
- [x] Database schema conversion (SQL Server → PostgreSQL)
- [x] Project setup and configuration
- [x] Basic authentication structure
- [x] Automated startup scripts

### Phase 1.5: FS-01 Feature Implementation (Week 2-3) ✅ COMPLETED
- [x] Backend: 14 REST endpoints for Customer & Pet Management
- [x] Frontend: Complete Angular UI with CRUD operations
- [x] Validation, pagination, search functionality
- [x] Full documentation and quick start guides

### Phase 2: Core Entities & Database Layer (Week 3-4) ✅ COMPLETED
#### 2.1 Create TypeORM Entities (40+ entities) ✅ ALL DONE
**Organization & Staff** (5 entities) - ✅ COMPLETED
- [x] ChiNhanh, Khoa, NhanVien, LoaiNhanVienLuong, LichLamViecBacSi

**Customers & Pets** (7 entities) - ✅ COMPLETED
- [x] KhachHang, KhachHangThanhVien, HangThanhVien
- [x] ThuCung, LoaiThuCung, ChungLoaiThuCung
- [x] LichHen

**Products & Inventory** (10 entities) - ✅ COMPLETED
- [x] SanPham, LichSuGiaSanPham, Thuoc, ThuCan, ThanhPhanThuCan, PhuKien
- [x] Kho, ChiTietTonKho, Vaccine, KhoVaccine

**Medical Services** (7 entities) - ✅ COMPLETED
- [x] DichVuYTe, CungCapDichVu
- [x] GoiTiemPhong, ChiTietGoiTiemPhong
- [x] PhieuDangKyTiemPhong, PhieuDangKyGoi, PhieuDangKyLe

**Medical Records** (9 entities) - ✅ COMPLETED
- [x] GiayKhamBenhTongQuat, GiayKhamBenhChuyenKhoa
- [x] ChiTietKhamBenhTrieuChung, ChiTietKhamBenhChuanDoan
- [x] ToaThuoc, ChiTietToaThuoc
- [x] GiayTiemPhong

**Invoices & Reviews** (5 entities) - ✅ COMPLETED
- [x] HoaDon, HoaDonSanPham, ThanhToanDichVuYTe
- [x] DanhGiaYTe, DanhGiaMuaHang

#### 2.2 Repository Setup ✅ COMPLETED
- All entities registered in app.module.ts
- TypeORM repositories available via TypeOrmModule.forFeature()

### Phase 3: Authentication & Authorization (Week 5) ✅ COMPLETED
#### 3.1 Enhanced Auth System ✅
- [x] Multi-role authentication (Admin, Manager, Doctor, Receptionist, Customer)
- [x] Role-based access control (RBAC) guards
- [x] Permission decorators (@Roles, @Public)
- [x] Refresh token mechanism

#### 3.2 User Management ✅
- [x] Link users to NHANVIEN or KHACHHANG
- [x] Password reset functionality
- [x] Session management
- [x] Change password (authenticated users)
- [x] Logout with token invalidation

### Phase 4: Admin Modules (Week 6-7)
Implement functions FQ-01 to FQ-06:

#### 4.1 Staff Management (FQ-01) ✅ COMPLETED
- [x] CRUD operations for employees
- [x] Salary management
- [x] Branch assignment

#### 4.2 Analytics & Reports (FQ-02 to FQ-04) ✅ COMPLETED
- [x] Revenue reports (total system)
- [x] Top services analysis (3-month)
- [x] Member tier statistics
- [x] Dashboard with charts

#### 4.3 Automated Member Management (FQ-06) ✅ COMPLETED
- [x] Scheduled job for tier updates (daily NestJS scheduler)
- [x] Tier upgrade/downgrade logic based on spending (1 point = 50,000 VND)

**Implementation Details:**
- **Tier Criteria** (based on annual spending):
  - **Bronze**: 0 - 49,999,999 VND (0-999 points) - No discount
  - **Silver**: 50,000,000 - 149,999,999 VND (1,000-2,999 points) - 5% discount
  - **Gold**: 150,000,000 - 299,999,999 VND (3,000-5,999 points) - 10% discount
  - **Platinum**: 300,000,000+ VND (6,000+ points) - 15% discount

- **Daily Scheduled Task** (`@Cron('0 2 * * *')`):
  - Runs at 2:00 AM daily
  - Fetches all active members
  - Calculates annual spending from HoaDon records (last 365 days)
  - Determines new tier based on spending
  - If tier changed: Update KhachHangThanhVien, log update, notify admin

- **Service: MemberTierService** (`member-tier.service.ts`)
  - `calculateAnnualSpending(customerId)`: Sum all invoice amounts from past 365 days
  - `determineTier(spending)`: Return tier ID based on spending amount
  - `getCurrentTier(customerId)`: Get customer's current tier
  - `updateMemberTierForCustomer(customerId)`: Update single member tier
  - `updateAllMemberTiers()`: Scheduled job (runs daily at 2:00 AM)
  - `manuallyTriggerTierUpdate()`: Admin trigger for immediate update
  - `getMemberTierStatistics()`: Dashboard stats with tier distribution
  - `getMemberTierHistory(customerId)`: Get member's tier info and progress

- **Controller: MemberTierController** (`member-tier.controller.ts`)
  - All endpoints require `@Roles('admin')` and JWT authentication
  
- **Endpoints**:
  - `GET /admin/member-tiers` - List all tier definitions
  - `GET /admin/member-tiers/statistics` - Get tier distribution stats
  - `GET /admin/member-tiers/{tierId}` - Get specific tier info
  - `GET /admin/member-tiers/history/{customerId}` - View member tier history and progress
  - `POST /admin/member-tiers/update-now` - Manually trigger tier update job
  - `POST /admin/member-tiers/update/{customerId}` - Update specific member tier

- **DTOs**: `member-tier.dto.ts`
  - `TierInfoDto`, `MemberTierUpdateDto`, `MemberTierStatisticsDto`, `MemberTierHistoryDto`, `ManualTierUpdateResponseDto`

- **Files Created**:
  - `backend/src/modules/admin/member-tier.service.ts` - Core service (200+ lines)
  - `backend/src/modules/admin/member-tier.controller.ts` - REST API (80+ lines)
  - `backend/src/modules/admin/member-tier.module.ts` - Module definition
  - `backend/src/modules/admin/dto/member-tier.dto.ts` - Data transfer objects
  - `backend/src/modules/admin/MEMBER_TIER_IMPLEMENTATION_GUIDE.md` - Complete documentation

- **Module Updated**: `admin.module.ts` - Added MemberTierService and MemberTierController

- **Key Features**:
  - ✅ Automatic tier updates daily at 2:00 AM
  - ✅ Manual trigger capability for admins
  - ✅ Points calculation (1 point = 50,000 VND)
  - ✅ Tier-specific discounts and benefits
  - ✅ Member progress tracking
  - ✅ Tier statistics for dashboard
  - ✅ Error handling and logging
  - ✅ Audit trail logging

### Phase 5: Branch Management Modules (Week 8-9)
Implement functions FB-01 to FB-07:

#### 5.1 Branch Operations
- [ ] Employee management (FB-01)
- [ ] Branch revenue reports (FB-02)
- [ ] Service offering management (FB-07)

#### 5.2 Inventory Management (FB-03)
- [ ] Stock import/export
- [ ] Real-time inventory tracking
- [ ] Low stock alerts

#### 5.3 Performance Reports (FB-05)
- [ ] Employee performance metrics
- [ ] Customer satisfaction scores

### Phase 6: Receptionist/Sales Modules (Week 10-11)
Implement functions FS-01 to FS-06:

#### 6.1 Customer Management (FS-01, FS-02)
- [ ] Customer & pet CRUD
- [ ] Customer statistics
- [ ] Inactive customer tracking

#### 6.2 Sales Transaction (FS-03) - CRITICAL
**Workflow F-01: Complete sales process**
- [ ] Invoice creation
- [ ] Automatic inventory deduction
- [ ] Member points calculation (1 point = 50,000 VND)
- [ ] Member discount application
- [ ] Total spending update

#### 6.3 Appointment & Lookup (FS-04 to FS-06)
- [ ] Appointment scheduling (FS-06)
- [ ] Inventory lookup (FS-04)
- [ ] Vaccine search (FS-05)

### Phase 7: Veterinarian Modules (Week 12-13)
Implement functions FV-01 to FV-05:

#### 7.1 Medical Record Access (FV-01)
- [ ] Complete medical history view
- [ ] Vaccination records
- [ ] Prescription history

#### 7.2 Examination Workflow (FV-02) - CRITICAL
**Workflow 1: Medical examination process**
- [ ] General checkup (GIAYKHAMBENHTONGQUAT)
  - Temperature validation (biological limits)
- [ ] Specialist examination (GIAYKHAMBENHCHUYENKHOA)
  - Symptoms and diagnosis
  - Follow-up date validation
- [ ] Prescription (TOATHUOC, CHITIETTOATHUOC)
  - Quantity validation (> 0)

#### 7.3 Vaccination Service (FV-03) - CRITICAL
**Workflow 2: Vaccination process**
- [ ] Vaccination registration (PHIEUDANGKYTIEMPHONG)
- [ ] Package vs individual registration
- [ ] Vaccination record (GIAYTIEMPHONG)
  - Expiry date validation
  - Stock checking
  - Automatic stock deduction

#### 7.4 Schedule & Notifications (FV-04, FV-05)
- [ ] Doctor schedule management
- [ ] Follow-up appointment reminders

### Phase 8: Customer Portal (Week 14-15)
Implement functions FC-01 to FC-06:

#### 8.1 Self-Service Features
- [ ] Online appointment booking (FC-01)
- [ ] Pet medical records view (FC-02)
- [ ] Membership status (FC-03)
- [ ] Personal info management (FC-05)

#### 8.2 Feedback & Notifications
- [ ] Service reviews (FC-04)
- [ ] Appointment reminders (FC-06)
- [ ] Follow-up notifications

### Phase 9: Frontend Development (Week 16-20)
#### 9.1 Admin Dashboard
- Analytics charts and reports
- Employee management interface
- System configuration

#### 9.2 Branch Management UI
- Branch-specific dashboards
- Inventory management interface
- Performance reports

#### 9.3 Receptionist/Sales Interface
- POS system for sales
- Customer management
- Appointment scheduling

#### 9.4 Veterinarian Interface
- Medical record forms
- Examination workflow
- Prescription creation

#### 9.5 Customer Portal
- Self-service dashboard
- Appointment booking
- Medical history view

### Phase 10: Testing & Deployment (Week 21-22)
- [ ] Unit tests for all services
- [ ] Integration tests for workflows
- [ ] E2E tests for critical paths
- [ ] Performance optimization
- [ ] Production deployment

## Key Business Rules to Implement

### Validation Rules
1. **Temperature**: Must be within biological limits (35-42°C for most pets)
2. **Quantities**: All quantities must be > 0
3. **Dates**: Follow-up dates must be after examination dates
4. **Stock**: Cannot go negative after transactions
5. **Phone**: Unique constraint for customer phone numbers

### Automated Processes
1. **Member Tier Management**: Daily job to update tiers based on annual spending
2. **Points Calculation**: 1 point per 50,000 VND spent
3. **Inventory Deduction**: Automatic on sales and vaccinations
4. **Notifications**: Appointment reminders, follow-up alerts

### Transaction Frequencies
- **High** (~4/hour): Reports, analytics, reviews
- **Medium** (2-6/month): Sales, examinations, inventory
- **Low** (0.5-2/month): Customer management, appointments
- **Very Low** (<1/day): System administration

## File Structure
```
backend/
├── src/
│   ├── entities/          # TypeORM entities (40+ files)
│   ├── modules/
│   │   ├── admin/         # Admin features (FQ-xx)
│   │   ├── branch/        # Branch management (FB-xx)
│   │   ├── sales/         # Sales & reception (FS-xx)
│   │   ├── veterinary/    # Medical services (FV-xx)
│   │   ├── customer/      # Customer portal (FC-xx)
│   │   ├── inventory/     # Inventory management
│   │   ├── appointment/   # Appointment scheduling
│   │   └── notification/  # Automated notifications
│   ├── common/
│   │   ├── decorators/    # Role guards, permissions
│   │   ├── guards/        # Auth guards
│   │   ├── interceptors/  # Logging, transformation
│   │   └── validators/    # Custom validators
│   └── config/            # Configuration
frontend/
├── src/
│   ├── app/
│   │   ├── admin/         # Admin dashboard
│   │   ├── branch/        # Branch management
│   │   ├── sales/         # POS & reception
│   │   ├── veterinary/    # Medical interface
│   │   ├── customer/      # Customer portal
│   │   ├── shared/        # Shared components
│   │   └── core/          # Services, guards, interceptors
```

## Next Steps

To continue implementation:

1. **Complete all entity definitions** (remaining 35+ entities)
2. **Create DTOs** for all operations (validation, transformation)
3. **Implement services** for each module
4. **Create controllers** with proper role guards
5. **Build frontend components** for each user role
6. **Write tests** for critical workflows
7. **Deploy** to production

## Estimated Timeline
- **Backend**: 12-15 weeks
- **Frontend**: 5-6 weeks  
- **Testing & Deployment**: 2 weeks
- **Total**: ~20-22 weeks for complete system

## Priority Implementation Order
1. ✅ Authentication & user management
2. 🔄 Core entities (organization, customers, products)
3. ⏳ Workflow 3: Sales transaction (FS-03) - Most frequent
4. ⏳ Workflow 1: Medical examination (FV-02)
5. ⏳ Workflow 2: Vaccination (FV-03)
6. ⏳ Admin analytics and reports
7. ⏳ Customer portal
8. ⏳ Notifications and automation
