# Frontend Implementation - FS-01: Customer & Pet Management

## Overview
Complete Angular 19 frontend implementation for Customer and Pet Management with CRUD operations, pagination, search, and validation.

## Project Structure
```
frontend/src/app/
├── models/
│   ├── customer.model.ts          # Customer data models and DTOs
│   └── pet.model.ts               # Pet data models and DTOs
├── services/
│   └── customer.service.ts        # HTTP service for API calls
├── components/
│   ├── customer-list/             # Customer listing with pagination
│   ├── customer-form/             # Customer create/edit form
│   ├── pet-list/                  # Pet listing (per customer)
│   └── pet-form/                  # Pet create/edit form
├── environments/
│   ├── environment.ts             # Development config
│   └── environment.prod.ts        # Production config
├── app.component.*                # Main app with navigation
├── app.routes.ts                  # Route configuration
└── app.config.ts                  # App configuration
```

## Features Implemented

### 1. Customer Management
- ✅ List all customers with pagination (10 per page)
- ✅ Search customers by name or phone
- ✅ Create new customer with validation
- ✅ Edit existing customer
- ✅ Delete customer (with confirmation)
- ✅ View customer details

### 2. Pet Management
- ✅ List pets for a specific customer
- ✅ Create new pet with species selection
- ✅ Edit pet information
- ✅ Delete pet (with confirmation)
- ✅ Pet weight, birth date, gender tracking
- ✅ Pet characteristics and color

### 3. UI/UX Features
- ✅ Responsive design
- ✅ Loading states with spinners
- ✅ Error messages in Vietnamese
- ✅ Success notifications
- ✅ Form validation with error messages
- ✅ Breadcrumb navigation
- ✅ Pagination controls
- ✅ Empty states

## Routes

```typescript
/                              → Redirect to /customers
/customers                     → Customer list
/customers/new                 → Create customer
/customers/:id/edit            → Edit customer
/customers/:id/pets            → Pet list for customer
/customers/:id/pets/new        → Create pet
/customers/:id/pets/:petId/edit → Edit pet
```

## API Integration

### Base URL
- **Development**: `http://localhost:3000`
- **Production**: Configure in `environment.prod.ts`

### Customer Endpoints
```
GET    /customer/khach-hang                  # List customers
GET    /customer/khach-hang/:id              # Get customer by ID
POST   /customer/khach-hang                  # Create customer
PUT    /customer/khach-hang/:id              # Update customer
DELETE /customer/khach-hang/:id              # Delete customer
GET    /customer/khach-hang/search?keyword=  # Search customers
```

### Pet Endpoints
```
GET    /customer/khach-hang/:id/thu-cung         # List pets
GET    /customer/khach-hang/:id/thu-cung/:petId  # Get pet by ID
POST   /customer/khach-hang/:id/thu-cung         # Create pet
PUT    /customer/khach-hang/:id/thu-cung/:petId  # Update pet
DELETE /customer/khach-hang/:id/thu-cung/:petId  # Delete pet
GET    /customer/thu-cung/search?keyword=        # Search pets
GET    /customer/chung-loai                      # Get species list
```

## Validation Rules

### Customer Form
- **HoTen** (required): 2-100 characters
- **SoDienThoai** (required): Vietnamese phone format (0xxxxxxxxx, 10 digits)
- **Email** (optional): Valid email format
- **DiaChi** (optional): Max 200 characters

### Pet Form
- **TenThuCung** (required): 2-100 characters
- **MaChungLoai** (required): Must select a species
- **NgaySinh** (optional): Date format
- **GioiTinh** (optional): Đực/Cái
- **CanNang** (optional): 0-200 kg
- **MauSac** (optional): Max 50 characters
- **DacDiem** (optional): Max 500 characters

## Running the Frontend

### Development Server
```bash
cd frontend
npm install
npm start
```
Access at: `http://localhost:4200`

### Build for Production
```bash
npm run build
```

## Component Details

### CustomerListComponent
**Features:**
- Displays paginated customer list
- Search functionality
- Action buttons (view, edit, delete)
- Responsive table layout

**Key Methods:**
- `loadCustomers()`: Fetch customer data
- `onSearch()`: Filter by keyword
- `onPageChange(page)`: Navigate pages
- `deleteCustomer(customer)`: Remove customer

### CustomerFormComponent
**Features:**
- Reactive form with validation
- Edit/Create modes
- Real-time error messages
- Auto-navigation after save

**Key Methods:**
- `onSubmit()`: Save customer data
- `loadCustomer()`: Load for editing
- `getErrorMessage(field)`: Get validation errors
- `isFieldInvalid(field)`: Check field validity

### PetListComponent
**Features:**
- Lists pets for specific customer
- Breadcrumb navigation
- Customer name in header
- Pet details in table

**Key Methods:**
- `loadPets()`: Fetch pet data
- `loadCustomerInfo()`: Get customer name
- `deletePet(pet)`: Remove pet
- `backToCustomers()`: Navigate back

### PetFormComponent
**Features:**
- Species dropdown from API
- Date picker for birth date
- Weight and gender inputs
- Customer context maintained

**Key Methods:**
- `loadSpecies()`: Get available species
- `loadPet()`: Load for editing
- `onSubmit()`: Save pet data
- `formatDate(date)`: Date formatting

## Authentication Note

Currently, authentication is not implemented in the frontend. All API calls require a valid JWT token in the `Authorization` header:

```typescript
Authorization: Bearer <your-jwt-token>
```

To add authentication:
1. Create `auth.service.ts` for login/logout
2. Create `auth.interceptor.ts` to add token to requests
3. Create login component
4. Add route guards for protected routes

## Next Steps

To complete the frontend:
1. **Add Authentication**: Login/logout functionality
2. **Add JWT Interceptor**: Automatically attach token to requests
3. **Error Handling**: Global error interceptor
4. **Customer Detail View**: Show customer info with all pets
5. **Pet Detail View**: Show pet medical history
6. **Implement FS-03**: Invoice & Payment UI
7. **Implement FS-05**: Vaccine search UI
8. **Add Loading Interceptor**: Global loading indicator
9. **Add Toast Notifications**: Better user feedback
10. **Unit Tests**: Component and service tests

## Design Decisions

### Why Standalone Components?
Angular 19 promotes standalone components for:
- Simpler dependency management
- Better tree-shaking
- Easier lazy loading

### Why Reactive Forms?
- Better validation control
- Type safety
- Easier testing
- Better UX with real-time validation

### Why Service Layer?
- Centralized API calls
- Reusable across components
- Easier to mock for testing
- Single source of truth for HTTP operations

## Troubleshooting

### Backend Connection Issues
- Verify backend is running on port 3000
- Check CORS settings in backend
- Verify API URL in `environment.ts`

### Build Errors
- Ensure Node.js LTS version (even-numbered)
- Clear node_modules and reinstall
- Check Angular CLI version compatibility

### Routing Issues
- Verify all routes are registered
- Check component imports in routes
- Ensure RouterOutlet is in app.component.html

## Browser Support
- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions

## Performance Tips
- Use pagination to limit data loading
- Implement virtual scrolling for large lists
- Add caching for species data
- Use lazy loading for feature modules
- Optimize images and assets
