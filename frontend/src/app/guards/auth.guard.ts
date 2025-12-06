import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Role } from '../models/auth.model';

// Auth guard - requires login
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return true;
  }

  // Redirect to login page
  return router.createUrlTree(['/login'], {
    queryParams: { returnUrl: state.url }
  });
};

// Role guard factory - requires specific roles
export function roleGuard(...allowedRoles: Role[]): CanActivateFn {
  return (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.isLoggedIn()) {
      return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
    }

    if (!authService.hasRole(allowedRoles)) {
      return router.createUrlTree(['/unauthorized']);
    }

    return true;
  };
}

// Predefined guards for common roles
export const adminGuard: CanActivateFn = roleGuard(Role.ADMIN);
export const managerGuard: CanActivateFn = roleGuard(Role.ADMIN, Role.QUAN_LY);
export const doctorGuard: CanActivateFn = roleGuard(Role.ADMIN, Role.QUAN_LY, Role.BAC_SI);
export const staffGuard: CanActivateFn = roleGuard(Role.ADMIN, Role.QUAN_LY, Role.NHAN_VIEN);
export const customerGuard: CanActivateFn = roleGuard(Role.KHACH_HANG);

// Route access guard - checks route permission based on role
export const routeAccessGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
  }

  // Extract route name from URL
  const routeName = state.url.split('/')[1] || 'dashboard';
  
  if (!authService.canAccess(routeName)) {
    return router.createUrlTree(['/unauthorized']);
  }

  return true;
};
