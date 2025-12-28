import { Routes } from '@angular/router';
import { CustomerListComponent } from './components/customer-list/customer-list.component';
import { CustomerFormComponent } from './components/customer-form/customer-form.component';
import { CustomerStatisticsComponent } from './components/customer-statistics/customer-statistics.component';
import { PetListComponent } from './components/pet-list/pet-list.component';
import { PetFormComponent } from './components/pet-form/pet-form.component';
import { LoginComponent } from './components/auth/login.component';
import { RegisterComponent } from './components/auth/register.component';
import { ProfileComponent } from './components/auth/profile.component';
import { ForgotComponent } from './components/auth/forgot.component';
import { EmployeeListComponent } from './components/employee-list/employee-list.component';
import { EmployeeFormComponent } from './components/employee-form/employee-form.component';
import { EmployeeSalaryComponent } from './components/employee-salary/employee-salary.component';
import { AnalyticsDashboardComponent } from './components/analytics-dashboard/analytics-dashboard.component';
import { ServiceOfferingComponent } from './components/service-offering/service-offering.component';
import { RevenueReportComponent } from './components/revenue-report/revenue-report.component';
import { InventoryManagementComponent } from './components/inventory-management/inventory-management.component';
import { PetExaminationSearchComponent } from './components/doctor/pet-examination-search/pet-examination-search.component';
import { ExaminationHistoryComponent } from './components/doctor/examination-history/examination-history.component';
import { CreateExaminationComponent } from './components/doctor/create-examination/create-examination.component';
import { MedicineSearchComponent } from './components/doctor/medicine-search/medicine-search.component';
import { CreatePrescriptionComponent } from './components/doctor/create-prescription/create-prescription.component';
import { AppointmentsComponent } from './components/appointments/appointments.component';
// Customer Portal Imports
import { CustomerLayoutComponent } from './components/customer-portal/customer-layout/customer-layout.component';
import { CustomerProductsComponent } from './components/customer-portal/customer-products/customer-products.component';
import { CustomerCartComponent } from './components/customer-portal/customer-cart/customer-cart.component';
import { CustomerAppointmentsComponent } from './components/customer-portal/customer-appointments/customer-appointments.component';
import { CustomerDoctorsComponent } from './components/customer-portal/customer-doctors/customer-doctors.component';
import { CustomerHistoryComponent } from './components/customer-portal/customer-history/customer-history.component';
import { CustomerPetsComponent } from './components/customer-portal/customer-pets/customer-pets.component';
import { CustomerPetFormComponent } from './components/customer-portal/customer-pet-form/customer-pet-form.component';
import { AuthGuard } from './services/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/customers', pathMatch: 'full' },
  { path: 'customers', component: CustomerListComponent, canActivate: [AuthGuard] },
  { path: 'customers/new', component: CustomerFormComponent, canActivate: [AuthGuard] },
  { path: 'customers/statistics', component: CustomerStatisticsComponent, canActivate: [AuthGuard] },
  { path: 'customers/:id', component: CustomerFormComponent, canActivate: [AuthGuard] },
  { path: 'customers/:id/edit', component: CustomerFormComponent, canActivate: [AuthGuard] },
  { path: 'pets', component: PetListComponent, canActivate: [AuthGuard] }, // General pet list (all pets)
  { path: 'customers/:id/pets', component: PetListComponent, canActivate: [AuthGuard] },
  { path: 'customers/:id/pets/new', component: PetFormComponent, canActivate: [AuthGuard] },
  { path: 'customers/:id/pets/:petId/edit', component: PetFormComponent, canActivate: [AuthGuard] },
  // Consolidated employee management - single unified endpoint
  { path: 'admin/staff', component: EmployeeListComponent, canActivate: [AuthGuard] }, // Legacy support
  { path: 'admin/staff/new', component: EmployeeFormComponent, canActivate: [AuthGuard] }, // Legacy support
  { path: 'admin/staff/salary', component: EmployeeSalaryComponent, canActivate: [AuthGuard] }, // Legacy support
  { path: 'admin/staff/:id/edit', component: EmployeeFormComponent, canActivate: [AuthGuard] }, // Legacy support
  // New unified routes (recommended)
  { path: 'employees', component: EmployeeListComponent, canActivate: [AuthGuard] },
  { path: 'employees/new', component: EmployeeFormComponent, canActivate: [AuthGuard] },
  { path: 'employees/salary', component: EmployeeSalaryComponent, canActivate: [AuthGuard] },
  { path: 'employees/:id/edit', component: EmployeeFormComponent, canActivate: [AuthGuard] },
  // Branch Management Routes
  { path: 'branch/service-offerings', component: ServiceOfferingComponent, canActivate: [AuthGuard] },
  { path: 'branch/revenue-reports', component: RevenueReportComponent, canActivate: [AuthGuard] },
  { path: 'branch/inventory', component: InventoryManagementComponent, canActivate: [AuthGuard] },
  // Doctor Routes
  { path: 'doctor/examinations/search', component: PetExaminationSearchComponent, canActivate: [AuthGuard] },
  { path: 'doctor/examination-history/:maThuCung', component: ExaminationHistoryComponent, canActivate: [AuthGuard] },
  { path: 'doctor/examinations/new', component: CreateExaminationComponent, canActivate: [AuthGuard] },
  { path: 'doctor/examinations/new/:maThuCung', component: CreateExaminationComponent, canActivate: [AuthGuard] },
  { path: 'doctor/medicines/search', component: MedicineSearchComponent, canActivate: [AuthGuard] },
  { path: 'doctor/prescriptions/new', component: CreatePrescriptionComponent, canActivate: [AuthGuard] },
  { path: 'doctor/prescriptions/new/:maThuCung', component: CreatePrescriptionComponent, canActivate: [AuthGuard] },
  // Appointments
  { path: 'appointments', component: AppointmentsComponent, canActivate: [AuthGuard] },
  { path: 'admin/analytics', component: AnalyticsDashboardComponent, canActivate: [AuthGuard] },

  // ========== CUSTOMER PORTAL ==========
  {
    path: 'customer',
    component: CustomerLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'products', pathMatch: 'full' },
      { path: 'products', component: CustomerProductsComponent },
      { path: 'cart', component: CustomerCartComponent },
      { path: 'appointments', component: CustomerAppointmentsComponent },
      { path: 'doctors', component: CustomerDoctorsComponent },
      { path: 'history', component: CustomerHistoryComponent },
      { path: 'pets', component: CustomerPetsComponent },
      { path: 'pets/new', component: CustomerPetFormComponent },
    ],
  },

  // Auth Routes
  { path: 'auth/login', component: LoginComponent },
  { path: 'auth/register', component: RegisterComponent },
  { path: 'auth/forgot', component: ForgotComponent },
  { path: 'auth/profile', component: ProfileComponent, canActivate: [AuthGuard] },
  { path: 'auth', redirectTo: '/auth/login', pathMatch: 'full' }
];
