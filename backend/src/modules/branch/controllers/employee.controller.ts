import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { EmployeeService } from '../services/employee.service';
import { CreateEmployeeDto, UpdateEmployeeDto } from '../dto/employee.dto';

@Controller('branch/employees')
export class EmployeeController {
  constructor(private employeeService: EmployeeService) {}

  // FB-01: Create employee
  @Post()
  async createEmployee(@Body() createDto: CreateEmployeeDto) {
    return this.employeeService.createEmployee(createDto);
  }

  // FB-01: Get all employees
  @Get()
  async getAllEmployees(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.employeeService.getAllEmployees(page, limit);
  }

  // FB-01: Get employees by branch
  @Get('branch/:branchId')
  async getEmployeesByBranch(
    @Param('branchId') branchId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.employeeService.getEmployeesByBranch(branchId, page, limit);
  }

  // FB-01: Get employee by ID
  @Get(':id')
  async getEmployeeById(@Param('id') id: string) {
    return this.employeeService.getEmployeeById(id);
  }

  // FB-01: Update employee
  @Put(':id')
  async updateEmployee(
    @Param('id') id: string,
    @Body() updateDto: UpdateEmployeeDto,
  ) {
    return this.employeeService.updateEmployee(id, updateDto);
  }

  // FB-01: Delete employee
  @Delete(':id')
  async deleteEmployee(@Param('id') id: string) {
    await this.employeeService.deleteEmployee(id);
    return { success: true, message: 'Employee deleted successfully' };
  }

  // FB-05: Get employee performance
  @Get('performance/:employeeId')
  async getEmployeePerformance(@Param('employeeId') employeeId: string) {
    return this.employeeService.getEmployeePerformance(employeeId);
  }

  // FB-05: Get all employees performance metrics
  @Get('performance-metrics/all')
  async getAllEmployeesPerformance(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.employeeService.getAllEmployeesPerformance(page, limit);
  }
}
