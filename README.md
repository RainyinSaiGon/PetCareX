# PetCareX - Pet Care Management System

A modern full-stack application for managing pet care services, built with NestJS, Angular, and PostgreSQL (Supabase).

## 🚀 Features

- **Authentication System**: Secure login/register with JWT
- **Role-Based Access Control**: Admin, Manager, Staff, and Customer roles
- **Pet Management**: Track pets and their medical history
- **Appointment Booking**: Schedule and manage appointments
- **Dashboard**: Analytics and insights
- **Supabase PostgreSQL**: Cloud-hosted database

## 📋 Prerequisites

Before you begin, ensure you have:

- Node.js (v18+ recommended)
- npm or yarn
- A Supabase account (free tier available)

## 🏗️ Project Structure

```
PetCareX/
├── backend/          # NestJS API server
│   ├── src/
│   │   ├── auth/     # Authentication module
│   │   ├── entities/ # Database entities
│   │   ├── app.module.ts
│   │   └── main.ts
│   └── .env          # Environment variables
├── frontend/         # Angular application
│   ├── src/
│   │   ├── app/      # Components and services
│   │   └── environments/
│   └── angular.json
└── README.md
```

## 🔧 Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/RainyinSaiGon/PetCareX.git
cd PetCareX
```

### 2. Install Dependencies

**Option A: Automatic Installation (Recommended)**

Dependencies will be automatically installed when you run `start.bat`.

**Option B: Manual Installation**

Run the installation script:
```bash
install.bat
```

Or install manually:
```bash
# Backend
cd backend
npm install

# Frontend
cd frontend
npm install
```

### 3. Setup Supabase Database

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click "New Project"
3. Fill in:
   - **Project Name**: PetCareX
   - **Database Password**: (save this securely!)
   - **Region**: Choose closest to you
4. Wait for project creation (~2 minutes)
5. Go to **Settings** → **Database**
6. Copy the connection info:
   - **Host**: `db.xxxxxxxxxxxxx.supabase.co`
   - **Port**: `5432`
   - **Database**: `postgres`
   - **User**: `postgres`
   - **Password**: (your database password)

### 4. Configure Backend

```bash
cd backend
cp .env.example .env
```

Edit `.env` with your Supabase credentials:

```env
DATABASE_HOST=db.xxxxxxxxxxxxx.supabase.co
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=your-database-password-here
DATABASE_NAME=postgres
DATABASE_SSL=true

JWT_SECRET=generate-a-random-secret-here
```

### 5. Start the Application

**Easy Start (Recommended)**

Just double-click `start.bat` or run:
```bash
start.bat
```

This will automatically:
- Check for missing dependencies
- Install them if needed
- Start both backend and frontend servers

**Manual Start**

If you prefer to start services separately:

**Manual Start**

If you prefer to start services separately:

```bash
# Terminal 1 - Backend
cd backend
npm run start:dev

# Terminal 2 - Frontend
cd frontend
npm start
```

### 6. Access the Application

## 🧪 Testing the Application

### Register a New User

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "username": "testuser",
    "password": "password123",
    "full_name": "Test User"
  }'
```

### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "password123"
  }'
```

### Get Profile (requires token)

```bash
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 📦 API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get current user profile (protected)

## 🔒 Security Features

- Password hashing with bcrypt
- JWT token authentication
- CORS enabled for frontend
- Input validation with class-validator
- Role-based access control
- SSL encrypted database connection

## 🌐 Environment Variables

### Backend (.env)

| Variable | Description | Example |
|----------|-------------|---------|
| DATABASE_HOST | Supabase database host | db.xxxxx.supabase.co |
| DATABASE_PORT | PostgreSQL port | 5432 |
| DATABASE_USERNAME | Database user | postgres |
| DATABASE_PASSWORD | Database password | your-password |
| DATABASE_NAME | Database name | postgres |
| DATABASE_SSL | Enable SSL | true |
| JWT_SECRET | JWT signing secret | random-string |
| JWT_EXPIRES_IN | Token expiration | 7d |
| PORT | Backend port | 3000 |
| NODE_ENV | Environment | development |
| CORS_ORIGIN | Frontend URL | http://localhost:4200 |

## 🚀 Deployment

### Backend Deployment (Heroku)

```bash
cd backend
heroku create petcarex-api
heroku config:set DATABASE_HOST=db.xxxxx.supabase.co
heroku config:set DATABASE_PASSWORD=your-password
# Set other env variables
git push heroku main
```

### Frontend Deployment (Vercel)

```bash
cd frontend
vercel
# Follow prompts
```

## 📱 Multi-Device Access

Since the database is hosted on Supabase (cloud), you can access the application from any device:

1. **Same Network**: Use `http://localhost:4200`
2. **Different Network**: Deploy backend and frontend, then use deployed URLs
3. **Mobile**: Access via deployed URL or use local IP address

## 🐛 Troubleshooting

### Backend won't start

- Check if `.env` file exists and has correct values
- Verify Supabase credentials
- Ensure port 3000 is not in use
- Check database connection: `npm run start:dev` should show connection logs

### Frontend won't connect

- Verify backend is running on port 3000
- Check CORS settings in `main.ts`
- Update `environment.ts` with correct API URL

### Database connection fails

- Verify Supabase project is active (not paused)
- Check firewall/network settings
- Ensure SSL is enabled: `DATABASE_SSL=true`
- Test connection using psql or pgAdmin

### Can't login from another device

- Deploy backend to a cloud service (Heroku, Railway, etc.)
- Update frontend environment with deployed backend URL
- Ensure CORS allows requests from frontend domain

## 📚 Tech Stack

- **Backend**: NestJS, TypeORM, PostgreSQL, JWT, bcrypt
- **Frontend**: Angular 19, TypeScript, RxJS
- **Database**: PostgreSQL (Supabase)
- **Authentication**: JWT tokens
- **Validation**: class-validator

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues or questions:
- Open an issue on GitHub
- Check Supabase documentation
- Review NestJS documentation

## 📞 Contact

- GitHub: [@RainyinSaiGon](https://github.com/RainyinSaiGon)
- Project: [PetCareX](https://github.com/RainyinSaiGon/PetCareX)
