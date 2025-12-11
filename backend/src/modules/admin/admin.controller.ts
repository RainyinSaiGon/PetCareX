import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { SalaryStatisticsService } from './salary-statistics.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';
import {
  CreateEmployeeDto,
  UpdateEmployeeDto,
  UpdateSalaryDto,
  EmployeeFilterDto,
  EmployeeStatsDto,
  BulkAssignBranchDto,
  BulkUpdateSalaryDto,
} from './dto/staff-management.dto';

@Controller('admin/staff')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly salaryStatsService: SalaryStatisticsService,
  ) {}

  // ============================================
  // EMPLOYEE CRUD OPERATIONS
  // ============================================

  /**
   * Get all employees with filtering, sorting, and pagination
   * GET /admin/staff/employees?search=John&maChiNhanh=CN001&page=1&limit=20&sortBy=HoTen&sortOrder=ASC
   */
  @Get('employees')
  async getAllEmployees(@Query() filters: EmployeeFilterDto) {
    return this.adminService.getAllEmployees(filters);
  }

  /**
   * Get employee by ID with comprehensive details
   * GET /admin/staff/employees/:id
   */
  @Get('employees/:id')
  async getEmployeeById(@Param('id') id: string) {
    return this.adminService.getEmployeeById(id);
  }

  /**
   * Create new employee
   * POST /admin/staff/employees
   */
  @Post('employees')
  @HttpCode(HttpStatus.CREATED)
  async createEmployee(@Body() createEmployeeDto: CreateEmployeeDto) {
    return this.adminService.createEmployee(createEmployeeDto);
  }

  /**
   * Update employee information
   * PUT /admin/staff/employees/:id
   */
  @Put('employees/:id')
  async updateEmployee(
    @Param('id') id: string,
    @Body() updateEmployeeDto: UpdateEmployeeDto,
  ) {
    return this.adminService.updateEmployee(id, updateEmployeeDto);
  }

  /**
   * Delete employee
   * DELETE /admin/staff/employees/:id
   */
  @Delete('employees/:id')
  async deleteEmployee(@Param('id') id: string) {
    return this.adminService.deleteEmployee(id);
  }

  // ============================================
  // SALARY MANAGEMENT
  // ============================================

  /**
   * Update employee salary (affects all employees of the same type)
   * PUT /admin/staff/employees/:id/salary
   */
  @Put('employees/:id/salary')
  async updateEmployeeSalary(
    @Param('id') id: string,
    @Body() updateSalaryDto: UpdateSalaryDto,
  ) {
    return this.adminService.updateEmployeeSalary(id, updateSalaryDto);
  }

  /**
   * Get all employee types with salary information
   * GET /admin/staff/employee-types
   */
  @Get('employee-types')
  async getAllEmployeeTypes() {
    return this.adminService.getAllEmployeeTypes();
  }

  /**
   * Bulk update salary by percentage for an employee type
   * POST /admin/staff/salary/bulk-update
   */
  @Post('salary/bulk-update')
  async bulkUpdateSalary(@Body() bulkSalaryDto: BulkUpdateSalaryDto) {
    return this.adminService.bulkUpdateSalary(bulkSalaryDto);
  }

  // ============================================
  // BRANCH ASSIGNMENT
  // ============================================

  /**
   * Get employee statistics by branch
   * GET /admin/staff/statistics/by-branch
   */
  @Get('statistics/by-branch')
  async getEmployeeStatsByBranch() {
    return this.adminService.getEmployeeStatsByBranch();
  }

  /**
   * Bulk assign employees to a new branch
   * POST /admin/staff/bulk-assign-branch
   */
  @Post('bulk-assign-branch')
  async bulkAssignBranch(@Body() bulkAssignDto: BulkAssignBranchDto) {
    return this.adminService.bulkAssignBranch(bulkAssignDto);
  }

  // ============================================
  // REFERENCE DATA
  // ============================================

  /**
   * Get all branches
   * GET /admin/staff/branches
   */
  @Get('branches')
  async getAllBranches() {
    return this.adminService.getAllBranches();
  }

  /**
   * Get all departments
   * GET /admin/staff/departments
   */
  @Get('departments')
  async getAllDepartments() {
    return this.adminService.getAllDepartments();
  }

  // ============================================
  // SALARY STATISTICS & ANALYTICS
  // ============================================

  /**
   * Get comprehensive salary statistics
   * GET /admin/staff/salary/statistics
   */
  @Get('salary/statistics')
  async getSalaryStatistics() {
    return this.salaryStatsService.getSalaryStatistics();
  }

  /**
   * Get salary comparison with industry average
   * GET /admin/staff/salary/comparison/:employeeType
   */
  @Get('salary/comparison/:employeeType')
  async getSalaryComparison(@Param('employeeType') employeeType: string) {
    return this.salaryStatsService.getSalaryComparison(employeeType);
  }

  /**
   * Get salary forecast for next N months
   * GET /admin/staff/salary/forecast?months=6
   */
  @Get('salary/forecast')
  async getSalaryForecast(@Query('months') months?: number) {
    const forecastMonths = months ? parseInt(months.toString()) : 6;
    return this.salaryStatsService.getSalaryForecast(forecastMonths);
  }
}

