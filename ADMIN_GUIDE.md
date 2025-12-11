# Admin User Management Guide

## ✅ Your Admin Password Has Been Reset!

**Current Admin Credentials:**
- **Username:** `admin`
- **Password:** `Admin@123`
- **Email:** `admin@petcarex.com`

⚠️ **IMPORTANT:** Change this password immediately after first login!

---

## Quick Login Instructions

### Option 1: Using the Frontend (Recommended)

1. **Start the Application:**
   ```bash
   # From the project root
   .\start.bat
   ```
   Or manually:
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run start:dev

   # Terminal 2 - Frontend
   cd frontend
   npm start
   ```

2. **Access the Application:**
   - Open browser: http://localhost:4200
   - Click "Login"
   - Enter username: `admin`
   - Enter password: `Admin@123`

### Option 2: Using the API Directly

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "Admin@123"
  }'
```

This will return a JWT token you can use for authenticated requests.

---

## Password Management Scripts

### 1. Create Admin User

Creates a default admin user if one doesn't exist:

```bash
cd backend
npm run create-admin
```

### 2. Reset Admin Password

Resets the admin password to the default `Admin@123`:

```bash
cd backend
npm run reset-admin
```

### 3. Reset Any User Password (Interactive)

Reset password for any user interactively:

```bash
cd backend
npm run reset-password
```

The script will prompt you for:
1. Username
2. New password

---

## Change Password After Login

### Using the API

After logging in, change your password using your JWT token:

```bash
curl -X POST http://localhost:3000/api/auth/change-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -d '{
    "old_password": "Admin@123",
    "new_password": "YourNewSecurePassword123!",
    "confirm_password": "YourNewSecurePassword123!"
  }'
```

### Using the Frontend

1. Log in with admin credentials
2. Navigate to Profile/Settings
3. Click "Change Password"
4. Enter old and new passwords
5. Save changes

---

## Password Requirements

- ✅ Minimum 6 characters
- ✅ Mix of uppercase and lowercase letters (recommended)
- ✅ Include numbers (recommended)
- ✅ Include special characters (recommended)

**Example strong passwords:**
- `SecureAdmin2024!`
- `PetCare@Admin123`
- `MyStr0ng!P@ssw0rd`

---

## Admin Capabilities

As an admin, you have full system access:

### User & Role Management
- ✅ Manage all users and roles (Admin, Manager, Staff, Customer)
- ✅ Create, edit, and deactivate user accounts
- ✅ Assign roles and permissions

### Organization Management
- ✅ Manage branches and locations
- ✅ Configure departments and specializations
- ✅ Set operating hours

### Employee Management (FQ-01)
- ✅ View all employees with filters and search
- ✅ Create and edit employee records
- ✅ Manage salary structures by employee type
- ✅ Track employee statistics and history
- ✅ Bulk salary updates with percentage increases

### Customer & Pet Management
- ✅ Access all customer records
- ✅ Manage pet profiles and medical history
- ✅ View appointment history

### Appointments & Services
- ✅ View and manage all appointments
- ✅ Configure service offerings
- ✅ Manage veterinary schedules

### Inventory & Warehouse
- ✅ Oversee product inventory
- ✅ Manage stock levels
- ✅ View transaction history

### Analytics & Reports
- ✅ System-wide analytics
- ✅ Financial reports
- ✅ Employee performance metrics
- ✅ Customer insights

---

## Security Best Practices

1. ✅ **Change default password immediately** after first login
2. ✅ **Use a strong, unique password** (12+ characters with mix of types)
3. ✅ **Never share admin credentials** with anyone
4. ✅ **Regularly update passwords** (every 60-90 days)
5. ✅ **Monitor admin account activity** for suspicious logins
6. ✅ **Log out when done** - don't leave sessions active
7. ✅ **Use secure networks** - avoid public WiFi for admin access

---

## Troubleshooting

### "Admin user already exists"
If `create-admin` says the user exists, use `reset-admin` instead:
```bash
npm run reset-admin
```

### "Database connection error"
1. Ensure PostgreSQL is running
2. Check `.env` file for correct database credentials:
   ```
   DATABASE_HOST=your-host
   DATABASE_PORT=5432
   DATABASE_NAME=your-database
   DATABASE_USER=your-username
   DATABASE_PASSWORD=your-password
   ```

### "Invalid credentials" when logging in
1. Verify you're using the correct username: `admin`
2. Reset the password: `npm run reset-admin`
3. Try logging in again with `Admin@123`

### "Scripts not found"
1. Make sure you're in the `backend` directory
2. Run `npm install` to ensure all dependencies are installed
3. Try the command again

### Backend won't start
1. Check if port 3000 is already in use
2. Verify database connection in `.env`
3. Run: `cd backend && npm install && npm run start:dev`

### Frontend won't start
1. Check if port 4200 is already in use
2. Run: `cd frontend && npm install && npm start`

---

## Support

For additional help:
- Check the main [README.md](README.md) for setup instructions
- Review [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md) for feature documentation
- Check terminal logs for error messages

---

**Last Updated:** December 10, 2025  
**Password Last Reset:** Just now via `npm run reset-admin`
