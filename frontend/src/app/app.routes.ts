import { Routes } from '@angular/router';
import { CustomerListComponent } from './components/customer-list/customer-list.component';
import { CustomerFormComponent } from './components/customer-form/customer-form.component';
import { PetListComponent } from './components/pet-list/pet-list.component';
import { PetFormComponent } from './components/pet-form/pet-form.component';
import { LoginComponent } from './components/auth/login.component';
import { RegisterComponent } from './components/auth/register.component';
import { ProfileComponent } from './components/auth/profile.component';
import { ForgotComponent } from './components/auth/forgot.component';
import { StaffListComponent } from './components/staff-list/staff-list.component';
import { StaffFormComponent } from './components/staff-form/staff-form.component';
import { StaffSalaryComponent } from './components/staff-salary/staff-salary.component';
import { AnalyticsDashboardComponent } from './components/analytics-dashboard/analytics-dashboard.component';
import { AuthGuard } from './services/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/customers', pathMatch: 'full' },
  { path: 'customers', component: CustomerListComponent, canActivate: [AuthGuard] },
  { path: 'customers/new', component: CustomerFormComponent, canActivate: [AuthGuard] },
  { path: 'customers/:id/edit', component: CustomerFormComponent, canActivate: [AuthGuard] },
  { path: 'customers/:id/pets', component: PetListComponent, canActivate: [AuthGuard] },
  { path: 'customers/:id/pets/new', component: PetFormComponent, canActivate: [AuthGuard] },
  { path: 'customers/:id/pets/:petId/edit', component: PetFormComponent, canActivate: [AuthGuard] },
  { path: 'admin/staff', component: StaffListComponent, canActivate: [AuthGuard] },
  { path: 'admin/staff/new', component: StaffFormComponent, canActivate: [AuthGuard] },
  { path: 'admin/staff/salary', component: StaffSalaryComponent, canActivate: [AuthGuard] },
  { path: 'admin/staff/:id/edit', component: StaffFormComponent, canActivate: [AuthGuard] },
  { path: 'admin/analytics', component: AnalyticsDashboardComponent, canActivate: [AuthGuard] },
  { path: 'auth/login', component: LoginComponent },
  { path: 'auth/register', component: RegisterComponent },
  { path: 'auth/forgot', component: ForgotComponent },
  { path: 'auth/profile', component: ProfileComponent, canActivate: [AuthGuard] },
  { path: 'auth', redirectTo: '/auth/login', pathMatch: 'full' }
];
