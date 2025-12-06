import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { LayoutComponent } from './components/layout/layout.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { KhachHangListComponent } from './components/khach-hang/khach-hang-list.component';
import { ThuCungListComponent } from './components/thu-cung/thu-cung-list.component';
import { LichHenListComponent } from './components/lich-hen/lich-hen-list.component';
import { HoaDonListComponent } from './components/hoa-don/hoa-don-list.component';
import { NhanVienListComponent } from './components/nhan-vien/nhan-vien-list.component';
import { ChiNhanhListComponent } from './components/chi-nhanh/chi-nhanh-list.component';
import { YTeListComponent } from './components/y-te/y-te-list.component';
import { SanPhamListComponent } from './components/san-pham/san-pham-list.component';
import { BaoCaoComponent } from './components/bao-cao/bao-cao.component';
import { UnauthorizedComponent } from './components/unauthorized/unauthorized.component';
import { authGuard, managerGuard, doctorGuard, staffGuard, roleGuard } from './guards/auth.guard';
import { Role } from './models/auth.model';

export const routes: Routes = [
  // Public routes
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'unauthorized', component: UnauthorizedComponent },
  
  // Protected routes with layout
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      // Dashboard - all authenticated users
      { path: 'dashboard', component: DashboardComponent },
      
      // Manager routes
      { path: 'nhan-vien', component: NhanVienListComponent, canActivate: [managerGuard] },
      { path: 'chi-nhanh', component: ChiNhanhListComponent, canActivate: [managerGuard] },
      { path: 'bao-cao', component: BaoCaoComponent, canActivate: [managerGuard] },
      
      // Staff routes (managers + staff)
      { path: 'khach-hang', component: KhachHangListComponent, canActivate: [staffGuard] },
      { path: 'san-pham', component: SanPhamListComponent, canActivate: [staffGuard] },
      { path: 'hoa-don', component: HoaDonListComponent, canActivate: [staffGuard] },
      
      // Doctor routes
      { path: 'y-te', component: YTeListComponent, canActivate: [doctorGuard] },
      
      // All authenticated users
      { path: 'thu-cung', component: ThuCungListComponent },
      { path: 'lich-hen', component: LichHenListComponent },
      
      // Default redirect
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },
  
  // Fallback
  { path: '**', redirectTo: '/login' },
];
