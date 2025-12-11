# Debug Guide: Analytics Dashboard Error

## Error Message
"Không thể tải dữ liệu dashboard" (Cannot load dashboard data)

## Common Causes & Solutions

### 1. **Not Logged In** (Most Common)
**Symptoms:**
- Error appears immediately on page load
- Browser console shows: `401 Unauthorized` or `403 Forbidden`

**Solution:**
1. Make sure you're logged in to the application
2. Navigate to login page: `http://localhost:4200/auth/login`
3. Login with your credentials (default: `admin` / `Admin@123`)
4. Then try accessing analytics again

**Check if logged in:**
- Open browser DevTools (F12)
- Go to Console tab
- Type: `localStorage.getItem('petcarex_access_token')`
- If it returns `null`, you need to login

### 2. **Backend Not Running**
**Symptoms:**
- Browser console shows: `ERR_CONNECTION_REFUSED` or `status: 0`
- Error message: "Không thể kết nối tới máy chủ"

**Solution:**
```bash
cd backend
npm run start:dev
```

Wait for: `Application is running on: http://localhost:3000`

### 3. **Database Not Connected**
**Symptoms:**
- Backend shows database errors in terminal
- 500 Internal Server Error in browser

**Solution:**
1. Make sure PostgreSQL is running
2. Check backend `.env` file has correct database credentials
3. Run migrations if needed: `npm run typeorm migration:run`

### 4. **CORS Issues**
**Symptoms:**
- Browser console shows: `CORS policy` error
- Network tab shows preflight OPTIONS request fails

**Solution:**
- Backend `main.ts` should have:
```typescript
app.enableCors({
  origin: 'http://localhost:4200',
  credentials: true,
});
```

### 5. **No Data in Database**
**Symptoms:**
- Dashboard loads but shows zeros/empty
- No actual error message

**Solution:**
- This is expected if database is empty
- Dashboard will show zeros until you add:
  - Customers (KhachHang)
  - Invoices (HoaDon)
  - Services (ThanhToanDichVuYTe)
  - Members (KhachHangThanhVien)

## Debugging Steps

### Step 1: Check Browser Console
1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for error messages
4. Check what the actual HTTP error code is

### Step 2: Check Network Tab
1. Open DevTools → Network tab
2. Reload the page
3. Look for the request to `/admin/analytics/dashboard`
4. Click on it to see:
   - Status code (200, 401, 403, 500, etc.)
   - Response body
   - Request headers (is Authorization header present?)

### Step 3: Check Backend Logs
Look at your backend terminal for errors like:
- Database connection errors
- TypeORM errors
- NestJS errors

### Step 4: Test API Directly
Open a new tab and try:
```
http://localhost:3000/admin/analytics/dashboard
```

You should see JSON data or an authentication error.

## Quick Fixes

### Fix 1: Re-login
```
1. Go to: http://localhost:4200/auth/login
2. Login with: admin / Admin@123
3. Navigate to: http://localhost:4200/admin/analytics
```

### Fix 2: Clear LocalStorage and Re-login
```javascript
// In browser console
localStorage.clear();
// Then login again
```

### Fix 3: Restart Backend
```bash
# Stop backend (Ctrl+C)
cd backend
npm run start:dev
```

### Fix 4: Check Token in Request
Open DevTools → Network → Click the failed request → Headers tab
Look for:
```
Authorization: Bearer <token>
```

If missing, the interceptor isn't working.

## Expected Behavior

When working correctly:
1. User must be logged in
2. Request to `/admin/analytics/dashboard` includes `Authorization: Bearer <token>` header
3. Backend validates token and user role (ADMIN or BRANCH_MANAGER)
4. Backend queries database and returns analytics data
5. Dashboard displays KPIs, charts, and tables

## Current Implementation Status

✅ **Backend**: Fully implemented
- 4 analytics endpoints working
- Proper authentication guards
- Database queries functional

✅ **Frontend**: Fully implemented
- Dashboard component complete
- Charts and visualizations ready
- Error handling improved

✅ **Authentication**: JWT-based
- Tokens stored in localStorage
- HTTP interceptor adds Authorization header
- Auto-refresh on 401 errors

## Next Steps if Still Not Working

1. **Check error message in browser console** - it will now show specific error:
   - "Phiên đăng nhập đã hết hạn" → Need to re-login
   - "Bạn không có quyền truy cập" → Need admin/manager role
   - "Không thể kết nối tới máy chủ" → Backend not running
   
2. **Share the exact error** from browser console

3. **Check backend terminal** for any error messages

4. **Verify your user role** - analytics requires ADMIN or BRANCH_MANAGER role
