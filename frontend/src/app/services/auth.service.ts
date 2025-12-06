import { Injectable, signal, PLATFORM_ID, inject, computed } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable, tap } from 'rxjs';
import { ApiService } from './api.service';
import { 
  LoginRequest, LoginResponse, RegisterRequest, User, 
  Role, CreateStaffRequest, UpdateRoleRequest, ChangePasswordRequest,
  hasRole, canAccessRoute, RoleDisplayNames
} from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSignal = signal<User | null>(null);
  private tokenKey = 'auth_token';
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  // Expose as readonly signal
  currentUser = this.currentUserSignal.asReadonly();

  // Computed signals for role checks
  isAdmin = computed(() => this.currentUser()?.role === Role.ADMIN);
  isManager = computed(() => [Role.ADMIN, Role.QUAN_LY].includes(this.currentUser()?.role as Role));
  isDoctor = computed(() => [Role.ADMIN, Role.QUAN_LY, Role.BAC_SI].includes(this.currentUser()?.role as Role));
  isStaff = computed(() => [Role.ADMIN, Role.QUAN_LY, Role.NHAN_VIEN].includes(this.currentUser()?.role as Role));
  isCustomer = computed(() => this.currentUser()?.role === Role.KHACH_HANG);
  userRole = computed(() => this.currentUser()?.role || null);
  userRoleDisplay = computed(() => {
    const role = this.currentUser()?.role;
    return role ? RoleDisplayNames[role] : '';
  });

  constructor(private apiService: ApiService) {
    this.loadUserFromStorage();
  }

  // Login user
  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.apiService.post<LoginResponse>('auth/login', credentials).pipe(
      tap(response => {
        this.setSession(response);
      })
    );
  }

  // Register new user (always as customer)
  register(data: RegisterRequest): Observable<LoginResponse> {
    return this.apiService.post<LoginResponse>('auth/register', data).pipe(
      tap(response => {
        this.setSession(response);
      })
    );
  }

  // Get current user profile
  getProfile(): Observable<User> {
    return this.apiService.get<User>('auth/profile');
  }

  // Change password
  changePassword(data: ChangePasswordRequest): Observable<{ message: string }> {
    return this.apiService.put<{ message: string }>('auth/change-password', data);
  }

  // Admin/Manager: Create staff account
  createStaffAccount(data: CreateStaffRequest): Observable<{ message: string; user: User }> {
    return this.apiService.post<{ message: string; user: User }>('auth/staff', data);
  }

  // Admin: Update user role
  updateUserRole(userId: number, data: UpdateRoleRequest): Observable<{ message: string; user: User }> {
    return this.apiService.put<{ message: string; user: User }>(`auth/users/${userId}/role`, data);
  }

  // Admin: Activate user
  activateUser(userId: number): Observable<{ message: string; user: User }> {
    return this.apiService.put<{ message: string; user: User }>(`auth/users/${userId}/activate`, {});
  }

  // Admin: Deactivate user
  deactivateUser(userId: number): Observable<{ message: string; user: User }> {
    return this.apiService.put<{ message: string; user: User }>(`auth/users/${userId}/deactivate`, {});
  }

  // Admin/Manager: Get all users
  getAllUsers(role?: Role): Observable<User[]> {
    const params = role ? { role } : {};
    return this.apiService.get<User[]>('auth/users', params);
  }

  // Logout user
  logout(): void {
    if (this.isBrowser) {
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem('current_user');
    }
    this.currentUserSignal.set(null);
  }

  // Check if user is logged in
  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  // Get stored token
  getToken(): string | null {
    if (!this.isBrowser) return null;
    return localStorage.getItem(this.tokenKey);
  }

  // Get current user
  getCurrentUser(): User | null {
    return this.currentUserSignal();
  }

  // Check if current user has required role(s)
  hasRole(requiredRoles: Role[]): boolean {
    const userRole = this.currentUser()?.role;
    if (!userRole) return false;
    return hasRole(userRole, requiredRoles);
  }

  // Check if current user can access route
  canAccess(route: string): boolean {
    const userRole = this.currentUser()?.role;
    if (!userRole) return false;
    return canAccessRoute(userRole, route);
  }

  // Private: Set session data
  private setSession(authResult: LoginResponse): void {
    if (this.isBrowser) {
      localStorage.setItem(this.tokenKey, authResult.access_token);
      localStorage.setItem('current_user', JSON.stringify(authResult.user));
    }
    this.currentUserSignal.set(authResult.user);
  }

  // Private: Load user from storage on init
  private loadUserFromStorage(): void {
    if (!this.isBrowser) return;
    
    const token = this.getToken();
    const userJson = localStorage.getItem('current_user');
    
    if (token && userJson) {
      try {
        const user = JSON.parse(userJson);
        this.currentUserSignal.set(user);
      } catch (e) {
        this.logout();
      }
    }
  }
}
