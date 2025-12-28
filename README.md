# PetCareX - Pet Care Management System

A comprehensive full-stack veterinary clinic management system built with **NestJS**, **Angular 19**, and **SQL Server**.

## 🚀 Features

### Admin Portal
- **Dashboard & Analytics**: Revenue reports, statistics, branch performance
- **Employee Management**: Add, edit, delete employees with salary tracking
- **Pet Management**: Track pets, breeds, and categories
- **Customer Management**: Customer profiles and membership tiers
- **Inventory Management**: Track products and stock across warehouses
- **Appointment Management**: View and manage all appointments
- **Branch Management**: Manage multiple clinic branches
- **Service Management**: Configure medical services per branch

### Customer Portal
- **Product Catalog**: Browse and purchase pet products
- **Appointment Booking**: Schedule appointments with doctor selection
- **Pet Management**: Add and manage personal pets
- **Doctor Directory**: View doctors and their schedules
- **Order History**: Track purchases and medical history
- **Shopping Cart**: Add products and checkout

### Doctor Portal
- **Appointment View**: See assigned appointments
- **Medical Examinations**: Record diagnoses and symptoms
- **Prescriptions**: Create and manage prescriptions
- **Vaccination Records**: Track pet vaccinations

## 📋 Prerequisites

- **Node.js** (v18+ recommended)
- **npm** or **yarn**
- **SQL Server** (Local or Azure SQL)

## 🏗️ Project Structure

```
PetCareX/
├── backend/              # NestJS API server
│   ├── src/
│   │   ├── auth/         # JWT Authentication
│   │   ├── entities/     # TypeORM entities (42 tables)
│   │   ├── modules/      # Feature modules
│   │   │   ├── admin/        # Admin analytics & reports
│   │   │   ├── appointment/  # Appointment management
│   │   │   ├── branch/       # Branch & employee management
│   │   │   ├── customer/     # Customer management
│   │   │   ├── customer-portal/  # Customer-facing APIs
│   │   │   ├── doctor/       # Doctor module
│   │   │   └── sales/        # Products & inventory
│   │   ├── app.module.ts
│   │   └── main.ts
│   └── .env              # Environment configuration
├── frontend/             # Angular 19 application
│   ├── src/app/
│   │   ├── components/   # UI components (22 modules)
│   │   │   ├── customer-portal/  # Customer-facing UI
│   │   │   ├── doctor/           # Doctor dashboard
│   │   │   └── ...               # Admin components
│   │   └── services/     # API services
│   └── angular.json
├── database/             # SQL scripts
│   └── petcarex_data.sql # Sample data
├── start.bat             # Quick start script
└── README.md
```

## 🔧 Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/RainyinSaiGon/PetCareX.git
cd PetCareX
```

### 2. Configure Database

Create a SQL Server database and update `backend/.env`:

```env
DATABASE_HOST=localhost
DATABASE_PORT=1433
DATABASE_USERNAME=sa
DATABASE_PASSWORD=your-password
DATABASE_NAME=PetCareX

JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
PORT=3000
CORS_ORIGIN=http://localhost:4200
```

### 3. Seed Database (Optional)

Run the SQL script in `database/petcarex_data.sql` to populate sample data.

### 4. Start the Application

**Quick Start (Recommended)**

```bash
start.bat
```

This will automatically:
- Check and install missing dependencies
- Start backend server (port 3000)
- Start frontend server (port 4200)

**Manual Start**

```bash
# Terminal 1 - Backend
cd backend
npm install
npm run start:dev

# Terminal 2 - Frontend
cd frontend
npm install
npm start
```

### 5. Access the Application

| Portal | URL | Description |
|--------|-----|-------------|
| Admin | http://localhost:4200 | Main admin dashboard |
| Customer | http://localhost:4200/customer | Customer portal |

## 👥 Default Accounts

| Role | Username | Password |
|------|----------|----------|
| Admin | admin | admin123 |

## 📦 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get current user

### Customer Portal
- `GET /api/customer/products` - Product catalog
- `GET /api/customer/doctors` - Doctor list
- `POST /api/customer/appointments` - Book appointment
- `GET /api/customer/pets` - Customer's pets

### Admin APIs
- `GET /api/admin/analytics/*` - Dashboard analytics
- `GET /api/branch/employees` - Employee management
- `GET /api/sales/products` - Product management
- `GET /api/appointment/appointments` - Appointments

## 🔒 Security Features

- Password hashing with bcrypt
- JWT token authentication
- Role-based access control (Admin, Employee, Customer)
- CORS protection
- Input validation

## 📊 Database Schema

The system uses **42 entities** including:

| Category | Tables |
|----------|--------|
| Users | User, KhachHang, NhanVien |
| Pets | ThuCung, ChungLoaiThuCung, LoaiThuCung |
| Medical | GiayKhamBenhTongQuat, ToaThuoc, Vaccine |
| Products | SanPham, ChiTietTonKho, HoaDon |
| Branches | ChiNhanh, DichVuYTe, CungCapDichVu |
| Appointments | LichHen, LichLamViecBacSi |

## 📚 Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | NestJS, TypeORM, JWT, bcrypt |
| Frontend | Angular 19, TypeScript, RxJS |
| Database | SQL Server |
| Styling | Custom CSS with dark/light themes |

## 🐛 Troubleshooting

### Backend won't start
- Verify SQL Server is running
- Check `.env` database credentials
- Ensure port 3000 is available

### Frontend won't connect
- Verify backend is running on port 3000
- Check browser console for CORS errors

### Database connection fails
- Verify SQL Server credentials
- Check firewall settings for port 1433

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 📞 Contact

- GitHub: [@RainyinSaiGon](https://github.com/RainyinSaiGon)
- Project: [PetCareX](https://github.com/RainyinSaiGon/PetCareX)
