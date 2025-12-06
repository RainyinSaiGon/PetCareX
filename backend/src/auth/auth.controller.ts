import { Controller, Post, Body, ValidationPipe, Get, UseGuards, Request, Param, Put, Query, ParseIntPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, CreateStaffAccountDto, UpdateRoleDto, ChangePasswordDto } from './dto/auth.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RolesGuard, Roles, Role, AdminOnly, ManagerOnly } from './roles';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // Public: Register as customer
  @Post('register')
  async register(@Body(ValidationPipe) registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  // Public: Login
  @Post('login')
  async login(@Body(ValidationPipe) loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  // Protected: Get current user profile
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.QUAN_LY, Role.BAC_SI, Role.NHAN_VIEN, Role.KHACH_HANG)
  @Get('profile')
  async getProfile(@Request() req) {
    return req.user;
  }

  // Protected: Change own password
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.QUAN_LY, Role.BAC_SI, Role.NHAN_VIEN, Role.KHACH_HANG)
  @Put('change-password')
  async changePassword(@Request() req, @Body(ValidationPipe) changeDto: ChangePasswordDto) {
    return this.authService.changePassword(req.user.id, changeDto);
  }

  // Admin/Manager: Create staff account
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ManagerOnly()
  @Post('staff')
  async createStaffAccount(@Request() req, @Body(ValidationPipe) createDto: CreateStaffAccountDto) {
    return this.authService.createStaffAccount(createDto, req.user.role);
  }

  // Admin: Update user role
  @UseGuards(JwtAuthGuard, RolesGuard)
  @AdminOnly()
  @Put('users/:id/role')
  async updateUserRole(
    @Param('id', ParseIntPipe) userId: number,
    @Body(ValidationPipe) updateDto: UpdateRoleDto,
    @Request() req
  ) {
    return this.authService.updateUserRole(userId, updateDto, req.user.role);
  }

  // Admin: Activate user
  @UseGuards(JwtAuthGuard, RolesGuard)
  @AdminOnly()
  @Put('users/:id/activate')
  async activateUser(@Param('id', ParseIntPipe) userId: number) {
    return this.authService.toggleUserStatus(userId, true);
  }

  // Admin: Deactivate user
  @UseGuards(JwtAuthGuard, RolesGuard)
  @AdminOnly()
  @Put('users/:id/deactivate')
  async deactivateUser(@Param('id', ParseIntPipe) userId: number) {
    return this.authService.toggleUserStatus(userId, false);
  }

  // Admin/Manager: Get all users
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ManagerOnly()
  @Get('users')
  async getAllUsers(@Query('role') role?: Role) {
    return this.authService.getAllUsers(role);
  }
}
