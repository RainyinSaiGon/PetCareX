import { SetMetadata } from '@nestjs/common';
import { Role } from './roles.enum';

export const ROLES_KEY = 'roles';

// Decorator to set required roles for a route
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);

// Shorthand decorators for common role requirements
export const AdminOnly = () => Roles(Role.ADMIN);
export const ManagerOnly = () => Roles(Role.ADMIN, Role.QUAN_LY);
export const DoctorOnly = () => Roles(Role.ADMIN, Role.QUAN_LY, Role.BAC_SI);
export const StaffOnly = () => Roles(Role.ADMIN, Role.QUAN_LY, Role.NHAN_VIEN);
export const CustomerOnly = () => Roles(Role.KHACH_HANG);
export const AuthenticatedOnly = () => Roles(Role.ADMIN, Role.QUAN_LY, Role.BAC_SI, Role.NHAN_VIEN, Role.KHACH_HANG);
