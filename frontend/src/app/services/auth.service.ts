import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { map, tap } from 'rxjs/operators';
import { Observable, BehaviorSubject } from 'rxjs';

interface LoginResp {
  access_token: string;
  refresh_token?: string;
  user?: {
    id: number;
    username: string;
    email: string;
    role: string;
    ma_khach_hang?: number;
    ma_nhan_vien?: number;
  };
}

export enum UserRole {
  ADMIN = 'ADMIN',
  BRANCH_MANAGER = 'BRANCH_MANAGER',
  RECEPTIONIST = 'RECEPTIONIST',
  VETERINARIAN = 'VETERINARIAN',
  WAREHOUSE_STAFF = 'WAREHOUSE_STAFF',
  CUSTOMER = 'CUSTOMER',
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private tokenKey = 'petcarex_access_token';
  private refreshKey = 'petcarex_refresh_token';
  private userKey = 'petcarex_user';

  private currentUserSubject = new BehaviorSubject<any>(this.getStoredUser());
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) { }

  login(username: string, password: string) {
    return this.http.post<LoginResp>('http://localhost:3000/auth/login', { username, password }).pipe(
      tap((res) => {
        if (res && res.access_token) {
          localStorage.setItem(this.tokenKey, res.access_token);
          // Decode JWT to get user info
          const payload = this.decodeToken(res.access_token);
          if (payload) {
            const user = {
              id: payload.sub,
              username: payload.username,
              email: payload.email,
              role: payload.role || UserRole.CUSTOMER,
              ma_khach_hang: payload.ma_khach_hang,
              ma_nhan_vien: payload.ma_nhan_vien,
            };
            localStorage.setItem(this.userKey, JSON.stringify(user));
            this.currentUserSubject.next(user);
          }
        }
        if (res && res.refresh_token) {
          localStorage.setItem(this.refreshKey, res.refresh_token);
        }
      })
    );
  }

  register(payload: any) {
    return this.http.post('http://localhost:3000/auth/register', payload);
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.refreshKey);
    localStorage.removeItem(this.userKey);
    this.currentUserSubject.next(null);
    this.router.navigate(['/auth/login']);
  }

  getToken() {
    return localStorage.getItem(this.tokenKey);
  }

  getRefreshToken() {
    return localStorage.getItem(this.refreshKey);
  }

  setTokens(access: string, refresh?: string) {
    if (access) localStorage.setItem(this.tokenKey, access);
    if (refresh) localStorage.setItem(this.refreshKey, refresh);
  }

  isAuthenticated() {
    return !!this.getToken();
  }

  // Get stored user from localStorage
  getStoredUser(): any {
    const userStr = localStorage.getItem(this.userKey);
    return userStr ? JSON.parse(userStr) : null;
  }

  // Get current user role
  getUserRole(): string {
    const user = this.getStoredUser();
    return user?.role || UserRole.CUSTOMER;
  }

  // Check if user is a customer
  isCustomer(): boolean {
    return this.getUserRole() === UserRole.CUSTOMER;
  }

  // Check if user is admin/staff
  isStaff(): boolean {
    const role = this.getUserRole();
    return [
      UserRole.ADMIN,
      UserRole.BRANCH_MANAGER,
      UserRole.RECEPTIONIST,
      UserRole.VETERINARIAN,
      UserRole.WAREHOUSE_STAFF,
    ].includes(role as UserRole);
  }

  // Get default redirect path based on role
  getDefaultRoute(): string {
    if (this.isCustomer()) {
      return '/customer/products';
    }
    return '/customers'; // Admin portal
  }

  profile() {
    return this.http.get('http://localhost:3000/auth/profile');
  }

  refresh(refreshToken?: string): Observable<LoginResp> {
    const token = refreshToken || this.getRefreshToken();
    return this.http.post<LoginResp>('http://localhost:3000/auth/refresh', { refresh_token: token });
  }

  forgot(email: string) {
    return this.http.post('http://localhost:3000/auth/forgot-password', { email });
  }

  // Decode JWT token to get payload
  private decodeToken(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  }
}
