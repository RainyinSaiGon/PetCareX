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
import { AuthGuard } from './services/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/customers', pathMatch: 'full' },
  { path: 'customers', component: CustomerListComponent, canActivate: [AuthGuard] },
  { path: 'customers/new', component: CustomerFormComponent, canActivate: [AuthGuard] },
  { path: 'customers/statistics', component: CustomerStatisticsComponent, canActivate: [AuthGuard] },
  { path: 'customers/:id', component: CustomerFormComponent, canActivate: [AuthGuard] },
  { path: 'customers/:id/edit', component: CustomerFormComponent, canActivate: [AuthGuard] },
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
  { path: 'admin/analytics', component: AnalyticsDashboardComponent, canActivate: [AuthGuard] },
  { path: 'auth/login', component: LoginComponent },
  { path: 'auth/register', component: RegisterComponent },
  { path: 'auth/forgot', component: ForgotComponent },
  { path: 'auth/profile', component: ProfileComponent, canActivate: [AuthGuard] },
  { path: 'auth', redirectTo: '/auth/login', pathMatch: 'full' }
];
