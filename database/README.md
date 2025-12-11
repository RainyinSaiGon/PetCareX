# Database Setup

This folder contains the database schema for PetCareX.

## Files

- `init.sql` - PostgreSQL schema with all tables and relationships
- `PetCareX.sql` - Original SQL Server schema (archived)

## Quick Setup

### Option 1: Automatic (Recommended)
Run the database initialization script from the backend folder:

```bash
cd backend
npm run db:init
```

### Option 2: Manual Setup via Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of `init.sql`
4. Paste and execute in the SQL Editor

### Option 3: Using psql Command Line

```bash
psql -h your-host -U postgres -d postgres -f database/init.sql
```

## Schema Overview

The database includes the following main groups:

### 1. Organization & Staff (Nhóm 1)
- `CHINHANH` - Branches
- `NHANVIEN` - Employees
- `KHOA` - Departments
- `KHO` - Warehouses
- `LOAINHANVIEN_LUONG` - Employee types and salaries
- `LICHLAMVIECBACSI` - Doctor schedules

### 2. Customers & Pets (Nhóm 2)
- `KHACHHANG` - Customers
- `KHACHHANGTHANHVIEN` - Member customers
- `HANGTHANHVIEN` - Membership tiers
- `THUCUNG` - Pets
- `LOAITHUCUNG` - Pet types
- `CHUNGLOAITHUCUNG` - Pet breeds
- `LICHHEN` - Appointments

### 3. Products & Inventory (Nhóm 3)
- `SANPHAM` - Products (base table)
- `THUOC` - Medicines
- `THUCAN` - Pet food
- `PHUKIEN` - Accessories
- `VACCINE` - Vaccines
- `CHITIETTONKHO` - Inventory details
- `LICHSUGIASANPHAM` - Price history

### 4. Services & Vaccination Packages (Nhóm 4)
- `DICHVUYTE` - Medical services
- `GOITIEMPHONG` - Vaccination packages
- `PHIEUDANGKYTIEMPHONG` - Vaccination registrations
- `CUNGCAPDICHVU` - Service offerings by branch

### 5. Medical Records (Nhóm 5)
- `GIAYKHAMBENHTONGQUAT` - General health checkups
- `GIAYKHAMBENHCHUYENKHOA` - Specialist examinations
- `TOATHUOC` - Prescriptions
- `GIAYTIEMPHONG` - Vaccination records

### 6. Invoices & Reviews (Nhóm 6)
- `HOADON` - Invoices
- `HOADON_SANPHAM` - Invoice products
- `THANHTOANDICHVUYTE` - Service payments
- `DANHGIAYTE` - Medical service reviews
- `DANHGIAMUAHANG` - Purchase reviews

## Conversion Notes (SQL Server → PostgreSQL)

- `IDENTITY(1,1)` → `SERIAL`
- `NVARCHAR` → `VARCHAR`
- `DATETIME` → `TIMESTAMP`
- `TIME(0)` → `TIME`
- Removed `USE` and `GO` statements
- All foreign keys use `ALTER TABLE` after table creation

## Troubleshooting

**Error: relation already exists**
- Tables already exist. Drop them first or use a fresh database.

**Error: connection refused**
- Check your `.env` file has correct `DATABASE_HOST`, `DATABASE_USERNAME`, and `DATABASE_PASSWORD`

**Error: permission denied**
- Ensure your database user has CREATE TABLE permissions
