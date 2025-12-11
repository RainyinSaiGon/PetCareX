import { inject } from '@angular/core';
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Skip auth endpoints
  if (req.url.includes('/auth/login') || 
      req.url.includes('/auth/register') || 
      req.url.includes('/auth/refresh') || 
      req.url.includes('/auth/forgot')) {
    return next(req);
  }

  // Get token
  const token = authService.getToken();
  
  if (!token) {
    console.warn('No token found in localStorage. User may need to login.');
  } else {
    console.log('Token found, attaching to request:', req.url);
  }

  // Clone request with token
  const authReq = token 
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  // Handle request
  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        console.error('🔴 401 Unauthorized error for:', req.url);
        console.error('Token was:', token ? 'present' : 'missing');
        
        // Clear auth data and redirect to login
        authService.logout();
        router.navigate(['/auth/login']);
      }
      return throwError(() => error);
    })
  );
};
