# Quick Start Guide - FS-01 Frontend

## Prerequisites
- Node.js LTS version (v20 or v22 recommended)
- Backend running on http://localhost:3000

## Installation & Setup

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Start Development Server
```bash
npm start
```

Frontend will be available at: `http://localhost:4200`

## Features Overview

### Customer Management (`/customers`)
1. **View All Customers**: Paginated list with search
2. **Add Customer**: Click "+ Thêm Khách Hàng" button
3. **Edit Customer**: Click edit icon (✏️) in table
4. **Delete Customer**: Click delete icon (🗑️) with confirmation
5. **View Pets**: Click on customer name or use action buttons

### Pet Management (`/customers/:id/pets`)
1. **View Customer's Pets**: Navigate from customer list
2. **Add Pet**: Click "+ Thêm Thú Cưng" button
3. **Edit Pet**: Click edit icon (✏️) in table
4. **Delete Pet**: Click delete icon (🗑️) with confirmation

## Testing the Application

### 1. Test Customer CRUD

**Create Customer:**
```
Navigate to: http://localhost:4200/customers
Click: "+ Thêm Khách Hàng"
Fill form:
  - Họ Tên: Nguyễn Văn A
  - Số Điện Thoại: 0912345678
  - Email: nguyenvana@email.com (optional)
  - Địa Chỉ: 123 Đường ABC, Q1, TP.HCM (optional)
Click: "Thêm Mới"
```

**Search Customer:**
```
Enter keyword in search box
Press Enter or click "Tìm Kiếm"
```

**Edit Customer:**
```
Click edit icon on customer row
Modify information
Click "Cập Nhật"
```

**Delete Customer:**
```
Click delete icon
Confirm deletion in popup
```

### 2. Test Pet CRUD

**Create Pet:**
```
From customer list, click customer name or navigate to pets
Click: "+ Thêm Thú Cưng"
Fill form:
  - Tên Thú Cưng: Milu
  - Chủng Loại: Select from dropdown
  - Ngày Sinh: Select date (optional)
  - Giới Tính: Đực/Cái (optional)
  - Cân Nặng: 5.5 (optional)
  - Màu Sắc: Vàng (optional)
  - Đặc Điểm: Có vết sẹo ở chân trái (optional)
Click: "Thêm Mới"
```

**Edit Pet:**
```
Click edit icon on pet row
Modify information
Click "Cập Nhật"
```

**Delete Pet:**
```
Click delete icon
Confirm deletion in popup
```

## UI Components

### Navigation Bar
- Logo and app name
- "Khách Hàng" menu item (active state shown)
- Sticky at top

### Customer List
- Search bar at top
- Table with columns: Mã KH, Họ Tên, SĐT, Email, Địa Chỉ, Ngày Tạo
- Action buttons: View (👁️), Edit (✏️), Delete (🗑️)
- Pagination controls at bottom

### Customer Form
- Reactive form with validation
- Required fields marked with red asterisk (*)
- Real-time validation errors
- Cancel/Submit buttons

### Pet List
- Breadcrumb navigation
- Customer name in header
- Table with columns: Mã TC, Tên, Chủng Loại, Ngày Sinh, Giới Tính, Cân Nặng, Màu Sắc
- Action buttons
- Pagination controls

### Pet Form
- Two-column layout for better space usage
- Species dropdown populated from API
- Date picker for birth date
- Number input for weight
- Textarea for characteristics

## Validation Rules

### Customer Form
- ✅ Phone number must be 10 digits starting with 0
- ✅ Email must be valid format
- ✅ Name must be 2-100 characters
- ✅ All required fields highlighted

### Pet Form
- ✅ Pet name must be 2-100 characters
- ✅ Species must be selected
- ✅ Weight must be 0-200 kg
- ✅ All limits enforced client-side

## Error Handling

### Display Locations
- Red alert box at top of page
- Inline error messages below form fields
- Console logs for debugging

### Common Errors
- "Không thể tải dữ liệu" - Backend connection issue
- "Số điện thoại đã tồn tại" - Duplicate phone number
- "Không thể xóa khách hàng có thú cưng" - Has dependencies
- "Trường này là bắt buộc" - Missing required field

## Keyboard Shortcuts
- `Enter` in search box → Trigger search
- `Esc` in forms → Cancel (not implemented yet)

## Mobile Responsiveness
- Table scrolls horizontally on small screens
- Forms stack vertically on mobile
- Navigation remains accessible

## Performance
- Pagination limits to 10 items per page
- Lazy loading for images (if added)
- Efficient re-rendering with Angular change detection

## Styling
- Green theme (#4CAF50) for primary actions
- Hover effects on buttons and table rows
- Loading spinner during API calls
- Clean, modern design

## Known Limitations
1. **No Authentication**: JWT token needs to be manually configured
2. **No Offline Mode**: Requires backend connection
3. **Limited Search**: Simple keyword matching only
4. **No Caching**: Every navigation refetches data

## Troubleshooting

### "Cannot GET /" Error
Solution: Ensure Angular dev server is running on port 4200

### "ERR_CONNECTION_REFUSED"
Solution: 
1. Check backend is running on port 3000
2. Verify environment.ts has correct apiUrl
3. Check for CORS issues in backend

### Form Not Submitting
Solution:
1. Check browser console for validation errors
2. Ensure all required fields are filled
3. Verify phone number format

### Species Dropdown Empty
Solution:
1. Ensure backend has ChungLoaiThuCung data
2. Check API endpoint /customer/chung-loai
3. Verify database has species records

### Pagination Not Working
Solution:
1. Check backend returns totalPages in response
2. Verify page/limit query params
3. Check console for API errors

## Next Features to Implement
1. Authentication & Login UI
2. Customer detail view with all pets
3. Pet medical history view
4. Dashboard with statistics
5. Export to PDF/Excel
6. Batch operations
7. Advanced filters
8. Dark mode toggle

## Contact & Support
For issues or questions, check:
- Backend API documentation: `/backend/API_DOCS_FS01.md`
- Implementation plan: `/IMPLEMENTATION_PLAN.md`
- Frontend documentation: `/frontend/FRONTEND_README.md`
