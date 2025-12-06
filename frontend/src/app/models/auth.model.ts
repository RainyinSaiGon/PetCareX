// Role definitions matching backend
export enum Role {
  ADMIN = 'admin',
  QUAN_LY = 'quan_ly',
  BAC_SI = 'bac_si',
  NHAN_VIEN = 'nhan_vien',
  KHACH_HANG = 'khach_hang',
}

// Role display names in Vietnamese
export const RoleDisplayNames: Record<Role, string> = {
  [Role.ADMIN]: 'Quản trị viên',
  [Role.QUAN_LY]: 'Quản lý',
  [Role.BAC_SI]: 'Bác sĩ',
  [Role.NHAN_VIEN]: 'Nhân viên',
  [Role.KHACH_HANG]: 'Khách hàng',
};

// Role permissions for UI
export const RolePermissions: Record<Role, string[]> = {
  [Role.ADMIN]: ['all'],
  [Role.QUAN_LY]: ['dashboard', 'nhan-vien', 'chi-nhanh', 'san-pham', 'bao-cao', 'khach-hang', 'y-te', 'hoa-don'],
  [Role.BAC_SI]: ['dashboard', 'y-te', 'khach-hang', 'lich-hen'],
  [Role.NHAN_VIEN]: ['dashboard', 'san-pham', 'khach-hang', 'hoa-don', 'lich-hen'],
  [Role.KHACH_HANG]: ['profile', 'thu-cung', 'lich-hen', 'hoa-don'],
};

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  user: User;
}

export interface User {
  id: number;
  username: string;
  email: string;
  fullName?: string;
  phoneNumber?: string;
  role: Role;
  roleDisplayName?: string;
  maNhanVien?: string;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  fullName?: string;
  phoneNumber?: string;
}

export interface CreateStaffRequest {
  username: string;
  email: string;
  password: string;
  fullName?: string;
  phoneNumber?: string;
  role: Role;
  maNhanVien?: string;
}

export interface UpdateRoleRequest {
  role: Role;
  maNhanVien?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// Helper function to check if user has required role
export function hasRole(userRole: Role, requiredRoles: Role[]): boolean {
  const hierarchy: Record<Role, Role[]> = {
    [Role.ADMIN]: [Role.ADMIN, Role.QUAN_LY, Role.BAC_SI, Role.NHAN_VIEN, Role.KHACH_HANG],
    [Role.QUAN_LY]: [Role.QUAN_LY, Role.BAC_SI, Role.NHAN_VIEN, Role.KHACH_HANG],
    [Role.BAC_SI]: [Role.BAC_SI, Role.KHACH_HANG],
    [Role.NHAN_VIEN]: [Role.NHAN_VIEN, Role.KHACH_HANG],
    [Role.KHACH_HANG]: [Role.KHACH_HANG],
  };
  return requiredRoles.some(required => hierarchy[userRole]?.includes(required));
}

// Check if user can access a specific route
export function canAccessRoute(userRole: Role, route: string): boolean {
  if (userRole === Role.ADMIN) return true;
  const permissions = RolePermissions[userRole] || [];
  return permissions.includes(route) || permissions.includes('all');
}
