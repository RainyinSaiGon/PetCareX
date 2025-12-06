// Role definitions for RBAC
export enum Role {
  ADMIN = 'admin',           // Full system access
  QUAN_LY = 'quan_ly',       // Manager - branch management
  BAC_SI = 'bac_si',         // Doctor - medical services
  NHAN_VIEN = 'nhan_vien',   // Staff - general operations
  KHACH_HANG = 'khach_hang', // Customer - basic access
}

// Role hierarchy - higher roles inherit lower role permissions
export const RoleHierarchy: Record<Role, Role[]> = {
  [Role.ADMIN]: [Role.ADMIN, Role.QUAN_LY, Role.BAC_SI, Role.NHAN_VIEN, Role.KHACH_HANG],
  [Role.QUAN_LY]: [Role.QUAN_LY, Role.BAC_SI, Role.NHAN_VIEN, Role.KHACH_HANG],
  [Role.BAC_SI]: [Role.BAC_SI, Role.KHACH_HANG],
  [Role.NHAN_VIEN]: [Role.NHAN_VIEN, Role.KHACH_HANG],
  [Role.KHACH_HANG]: [Role.KHACH_HANG],
};

// Role display names in Vietnamese
export const RoleDisplayNames: Record<Role, string> = {
  [Role.ADMIN]: 'Quản trị viên',
  [Role.QUAN_LY]: 'Quản lý',
  [Role.BAC_SI]: 'Bác sĩ',
  [Role.NHAN_VIEN]: 'Nhân viên',
  [Role.KHACH_HANG]: 'Khách hàng',
};

// Check if a role has permission for another role
export function hasRolePermission(userRole: Role, requiredRole: Role): boolean {
  return RoleHierarchy[userRole]?.includes(requiredRole) ?? false;
}
