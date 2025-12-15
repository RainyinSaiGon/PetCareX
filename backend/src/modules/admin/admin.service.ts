import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In } from 'typeorm';
import { NhanVien } from '../../entities/nhanvien.entity';
import { LoaiNhanVienLuong } from '../../entities/loai-nhan-vien-luong.entity';
import { ChiNhanh } from '../../entities/chi-nhanh.entity';
import { Khoa } from '../../entities/khoa.entity';
import { LichHen } from '../../entities/lich-hen.entity';
import {
  CreateEmployeeDto,
  UpdateEmployeeDto,
  UpdateSalaryDto,
  EmployeeFilterDto,
  EmployeeStatsDto,
  BulkAssignBranchDto,
  BulkUpdateSalaryDto,
} from './dto/staff-management.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(NhanVien)
    private readonly nhanVienRepo: Repository<NhanVien>,
    @InjectRepository(LoaiNhanVienLuong)
    private readonly loaiNVLuongRepo: Repository<LoaiNhanVienLuong>,
    @InjectRepository(ChiNhanh)
    private readonly chiNhanhRepo: Repository<ChiNhanh>,
    @InjectRepository(Khoa)
    private readonly khoaRepo: Repository<Khoa>,
    @InjectRepository(LichHen)
    private readonly lichHenRepo: Repository<LichHen>,
  ) {}

  // ===========================
  // EMPLOYEE MANAGEMENT
  // ===========================

  /**
   * Get all employees with filtering, pagination, and sorting
   */
  async getAllEmployees(filterDto: EmployeeFilterDto) {
    const { 
      search, 
      maChiNhanh, 
      loaiNhanVien, 
      page = 1, 
      limit = 10, 
      sortBy = 'hoTen', 
      sortOrder = 'ASC' 
    } = filterDto;

    const query = this.nhanVienRepo.createQueryBuilder('nv')
      .leftJoinAndSelect('nv.ChiNhanh', 'cn')
      .leftJoinAndSelect('nv.LoaiNV', 'lnv')
      .leftJoinAndSelect('nv.Khoa', 'k');

    // Search filter
    if (search) {
      query.andWhere('(nv.HoTen LIKE :search OR nv.SDT LIKE :search OR nv.MaNhanVien LIKE :search)', 
        { search: `%${search}%` });
    }

    // Branch filter
    if (maChiNhanh) {
      query.andWhere('nv.MaChiNhanh = :maChiNhanh', { maChiNhanh });
    }

    // Employee type filter
    if (loaiNhanVien) {
      query.andWhere('nv.LoaiNhanVien = :loaiNhanVien', { loaiNhanVien });
    }

    // Sorting
    const allowedSortFields = ['hoTen', 'ngayVaoLam', 'loaiNhanVien'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'hoTen';
    const sortDirection = sortOrder === 'DESC' ? 'DESC' : 'ASC';
    
    query.orderBy(`nv.${sortField.charAt(0).toUpperCase() + sortField.slice(1)}`, sortDirection);

    // Pagination
    const skip = (page - 1) * limit;
    query.skip(skip).take(limit);

    const [employees, total] = await query.getManyAndCount();

    // Enrich with salary information
    const enrichedEmployees = await Promise.all(
      employees.map(async (emp) => {
        const salaryInfo = await this.loaiNVLuongRepo.findOne({
          where: { LoaiNhanVien: emp.LoaiNhanVien },
        });

        return {
          ...emp,
          luongHienTai: salaryInfo?.Luong || 0,
          tenLoaiNhanVien: emp.LoaiNhanVien,
          tenChiNhanh: emp.ChiNhanh?.TenChiNhanh || '',
          tenKhoa: emp.Khoa?.TenKhoa || '',
        };
      })
    );

    return {
      data: enrichedEmployees,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get employee by ID with detailed information
   */
  async getEmployeeById(maNhanVien: string) {
    const employee = await this.nhanVienRepo.findOne({
      where: { MaNhanVien: maNhanVien },
      relations: ['ChiNhanhNV', 'LoaiNV', 'KhoaNV'],
    });

    if (!employee) {
      throw new NotFoundException(`Không tìm thấy nhân viên với mã ${maNhanVien}`);
    }

    // Get salary information
    const salaryInfo = await this.loaiNVLuongRepo.findOne({
      where: { LoaiNhanVien: employee.LoaiNhanVien },
    });

    // Get appointment statistics
    const appointmentStats = await this.lichHenRepo
      .createQueryBuilder('lh')
      .select('COUNT(*)', 'total')
      .addSelect('SUM(CASE WHEN lh.TrangThai = :completed THEN 1 ELSE 0 END)', 'completed')
      .addSelect('SUM(CASE WHEN lh.TrangThai = :pending THEN 1 ELSE 0 END)', 'pending')
      .where('lh.MaBacSi = :maNhanVien', { maNhanVien })
      .setParameters({ completed: 'Đã hoàn thành', pending: 'Chờ xác nhận' })
      .getRawOne();

    // Calculate years of service
    const yearsOfService = employee.NgayVaoLam 
      ? Math.floor((new Date().getTime() - new Date(employee.NgayVaoLam).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
      : 0;

    return {
      ...employee,
      luongHienTai: salaryInfo?.Luong || 0,
      tenLoaiNhanVien: employee.LoaiNhanVien,
      tenChiNhanh: employee.ChiNhanh?.TenChiNhanh || '',
      tenKhoa: employee.Khoa?.TenKhoa || '',
      statistics: {
        totalAppointments: parseInt(appointmentStats.total) || 0,
        completedAppointments: parseInt(appointmentStats.completed) || 0,
        pendingAppointments: parseInt(appointmentStats.pending) || 0,
        yearsOfService,
      },
    };
  }

  /**
   * Create new employee
   */
  async createEmployee(createDto: CreateEmployeeDto) {
    // Check if employee ID already exists
    const existingEmployee = await this.nhanVienRepo.findOne({
      where: { MaNhanVien: createDto.maNhanVien },
    });

    if (existingEmployee) {
      throw new ConflictException(`Mã nhân viên ${createDto.maNhanVien} đã tồn tại`);
    }

    // Check if phone number already exists
    const existingPhone = await this.nhanVienRepo.findOne({
      where: { SDT: createDto.sdt },
    });

    if (existingPhone) {
      throw new ConflictException(`Số điện thoại ${createDto.sdt} đã được sử dụng`);
    }

    // Validate branch exists
    const branch = await this.chiNhanhRepo.findOne({
      where: { MaChiNhanh: createDto.maChiNhanh },
    });

    if (!branch) {
      throw new BadRequestException(`Chi nhánh ${createDto.maChiNhanh} không tồn tại`);
    }

    // Validate employee type exists
    const employeeType = await this.loaiNVLuongRepo.findOne({
      where: { LoaiNhanVien: createDto.loaiNhanVien },
    });

    if (!employeeType) {
      throw new BadRequestException(`Loại nhân viên ${createDto.loaiNhanVien} không tồn tại`);
    }

    // Validate department if provided
    if (createDto.maKhoa) {
      const department = await this.khoaRepo.findOne({
        where: { MaKhoa: createDto.maKhoa },
      });

      if (!department) {
        throw new BadRequestException(`Khoa ${createDto.maKhoa} không tồn tại`);
      }
    }

    // Validate age (must be at least 18)
    if (createDto.ngaySinh) {
      const age = Math.floor((new Date().getTime() - new Date(createDto.ngaySinh).getTime()) / (365.25 * 24 * 60 * 60 * 1000));
      if (age < 18) {
        throw new BadRequestException('Nhân viên phải đủ 18 tuổi');
      }
    }

    const newEmployee = this.nhanVienRepo.create({
      MaNhanVien: createDto.maNhanVien,
      HoTen: createDto.hoTen,
      SDT: createDto.sdt,
      NgaySinh: createDto.ngaySinh,
      NgayVaoLam: createDto.ngayVaoLam || new Date(),
      MaChiNhanh: createDto.maChiNhanh,
      LoaiNhanVien: createDto.loaiNhanVien,
      MaKhoa: createDto.maKhoa,
    });

    await this.nhanVienRepo.save(newEmployee);

    return await this.getEmployeeById(newEmployee.MaNhanVien);
  }

  /**
   * Update employee information
   */
  async updateEmployee(maNhanVien: string, updateDto: UpdateEmployeeDto) {
    const employee = await this.nhanVienRepo.findOne({
      where: { MaNhanVien: maNhanVien },
    });

    if (!employee) {
      throw new NotFoundException(`Không tìm thấy nhân viên với mã ${maNhanVien}`);
    }

    // Check phone uniqueness if being updated
    if (updateDto.sdt && updateDto.sdt !== employee.SDT) {
      const existingPhone = await this.nhanVienRepo.findOne({
        where: { SDT: updateDto.sdt },
      });

      if (existingPhone) {
        throw new ConflictException(`Số điện thoại ${updateDto.sdt} đã được sử dụng`);
      }
    }

    // Validate branch if being updated
    if (updateDto.maChiNhanh) {
      const branch = await this.chiNhanhRepo.findOne({
        where: { MaChiNhanh: updateDto.maChiNhanh },
      });

      if (!branch) {
        throw new BadRequestException(`Chi nhánh ${updateDto.maChiNhanh} không tồn tại`);
      }
    }

    // Validate employee type if being updated
    if (updateDto.loaiNhanVien) {
      const employeeType = await this.loaiNVLuongRepo.findOne({
        where: { LoaiNhanVien: updateDto.loaiNhanVien },
      });

      if (!employeeType) {
        throw new BadRequestException(`Loại nhân viên ${updateDto.loaiNhanVien} không tồn tại`);
      }
    }

    // Validate department if being updated
    if (updateDto.maKhoa) {
      const department = await this.khoaRepo.findOne({
        where: { MaKhoa: updateDto.maKhoa },
      });

      if (!department) {
        throw new BadRequestException(`Khoa ${updateDto.maKhoa} không tồn tại`);
      }
    }

    // Update fields
    if (updateDto.hoTen) employee.HoTen = updateDto.hoTen;
    if (updateDto.sdt) employee.SDT = updateDto.sdt;
    if (updateDto.ngaySinh) employee.NgaySinh = updateDto.ngaySinh;
    if (updateDto.maChiNhanh) employee.MaChiNhanh = updateDto.maChiNhanh;
    if (updateDto.loaiNhanVien) employee.LoaiNhanVien = updateDto.loaiNhanVien;
    if (updateDto.maKhoa !== undefined) employee.MaKhoa = updateDto.maKhoa;

    await this.nhanVienRepo.save(employee);

    return await this.getEmployeeById(maNhanVien);
  }

  /**
   * Delete employee (soft check for dependencies)
   */
  async deleteEmployee(maNhanVien: string) {
    const employee = await this.nhanVienRepo.findOne({
      where: { MaNhanVien: maNhanVien },
    });

    if (!employee) {
      throw new NotFoundException(`Không tìm thấy nhân viên với mã ${maNhanVien}`);
    }

    // Check if employee has any appointments
    const appointmentCount = await this.lichHenRepo.count({
      where: { MaBacSi: maNhanVien },
    });

    if (appointmentCount > 0) {
      throw new BadRequestException(
        `Không thể xóa nhân viên ${maNhanVien} vì có ${appointmentCount} lịch hẹn liên quan. Vui lòng xử lý các lịch hẹn trước.`
      );
    }

    await this.nhanVienRepo.remove(employee);

    return { 
      message: `Đã xóa nhân viên ${maNhanVien} thành công`,
      deletedEmployee: {
        maNhanVien: maNhanVien,
        hoTen: employee.HoTen,
      }
    };
  }

  // ===========================
  // SALARY MANAGEMENT
  // ===========================

  /**
   * Update salary for an employee type (affects all employees of that type)
   */
  async updateEmployeeSalary(loaiNhanVien: string, updateSalaryDto: UpdateSalaryDto) {
    const employeeType = await this.loaiNVLuongRepo.findOne({
      where: { LoaiNhanVien: loaiNhanVien },
    });

    if (!employeeType) {
      throw new NotFoundException(`Không tìm thấy loại nhân viên ${loaiNhanVien}`);
    }

    const oldSalary = employeeType.Luong;
    employeeType.Luong = updateSalaryDto.newSalary;

    await this.loaiNVLuongRepo.save(employeeType);

    // Get count of affected employees
    const affectedCount = await this.nhanVienRepo.count({
      where: { LoaiNhanVien: loaiNhanVien },
    });

    const percentageChange = ((updateSalaryDto.newSalary - oldSalary) / oldSalary) * 100;

    return {
      message: `Đã cập nhật lương cho loại nhân viên ${loaiNhanVien}`,
      loaiNhanVien: employeeType.LoaiNhanVien,
      oldSalary,
      newSalary: updateSalaryDto.newSalary,
      percentageChange: percentageChange.toFixed(2) + '%',
      affectedEmployees: affectedCount,
      reason: updateSalaryDto.reason,
    };
  }

  // ===========================
  // STATISTICS & REPORTING
  // ===========================

  /**
   * Get employee statistics by branch
   */
  async getEmployeeStatsByBranch(): Promise<EmployeeStatsDto> {
    // Get total employees
    const totalEmployees = await this.nhanVienRepo.count();

    // Get employees by branch
    const byBranch = await this.nhanVienRepo
      .createQueryBuilder('nv')
      .select('nv.MaChiNhanh', 'maChiNhanh')
      .addSelect('cn.TenChiNhanh', 'tenChiNhanh')
      .addSelect('COUNT(*)', 'count')
      .leftJoin('nv.ChiNhanh', 'cn')
      .groupBy('nv.MaChiNhanh, cn.TenChiNhanh')
      .getRawMany();

    // Get employees by type with salary
    const byType = await this.nhanVienRepo
      .createQueryBuilder('nv')
      .select('nv.LoaiNhanVien', 'loaiNhanVien')
      .addSelect('COUNT(*)', 'count')
      .addSelect('lnv.Luong', 'avgSalary')
      .leftJoin('nv.LoaiNV', 'lnv')
      .groupBy('nv.LoaiNhanVien, lnv.Luong')
      .getRawMany();

    // Calculate total payroll
    const totalPayroll = byType.reduce((sum, type) => {
      return sum + (parseFloat(type.avgSalary) || 0) * parseInt(type.count);
    }, 0);

    return {
      totalEmployees,
      byBranch: byBranch.map(b => ({
        maChiNhanh: b.maChiNhanh,
        tenChiNhanh: b.tenChiNhanh || '',
        count: parseInt(b.count),
      })),
      byType: byType.map(t => ({
        loaiNhanVien: t.loaiNhanVien,
        count: parseInt(t.count),
        avgSalary: parseFloat(t.avgSalary) || 0,
      })),
      totalPayroll,
    };
  }

  // ===========================
  // BULK OPERATIONS
  // ===========================

  /**
   * Bulk assign employees to a branch
   */
  async bulkAssignBranch(bulkAssignDto: BulkAssignBranchDto) {
    // Validate branch exists
    const branch = await this.chiNhanhRepo.findOne({
      where: { MaChiNhanh: bulkAssignDto.maChiNhanh },
    });

    if (!branch) {
      throw new BadRequestException(`Chi nhánh ${bulkAssignDto.maChiNhanh} không tồn tại`);
    }

    // Find all employees
    const employees = await this.nhanVienRepo.find({
      where: { MaNhanVien: In(bulkAssignDto.maNhanVienList) },
    });

    if (employees.length === 0) {
      throw new NotFoundException('Không tìm thấy nhân viên nào trong danh sách');
    }

    if (employees.length !== bulkAssignDto.maNhanVienList.length) {
      const foundIds = employees.map(e => e.MaNhanVien);
      const missingIds = bulkAssignDto.maNhanVienList.filter(id => !foundIds.includes(id));
      throw new BadRequestException(`Không tìm thấy nhân viên: ${missingIds.join(', ')}`);
    }

    // Update all employees
    await this.nhanVienRepo.update(
      { MaNhanVien: In(bulkAssignDto.maNhanVienList) },
      { MaChiNhanh: bulkAssignDto.maChiNhanh }
    );

    return {
      message: `Đã chuyển ${employees.length} nhân viên sang chi nhánh ${branch.TenChiNhanh}`,
      affectedEmployees: employees.length,
      targetBranch: {
        maChiNhanh: branch.MaChiNhanh,
        tenChiNhanh: branch.TenChiNhanh,
      },
      employeeList: employees.map(e => ({
        maNhanVien: e.MaNhanVien,
        hoTen: e.HoTen,
      })),
    };
  }

  /**
   * Bulk update salary by percentage
   */
  async bulkUpdateSalary(bulkSalaryDto: BulkUpdateSalaryDto) {
    const employeeType = await this.loaiNVLuongRepo.findOne({
      where: { LoaiNhanVien: bulkSalaryDto.loaiNhanVien },
    });

    if (!employeeType) {
      throw new NotFoundException(`Không tìm thấy loại nhân viên ${bulkSalaryDto.loaiNhanVien}`);
    }

    const oldSalary = employeeType.Luong;
    const newSalary = oldSalary * (1 + bulkSalaryDto.percentageIncrease / 100);

    if (newSalary < 0) {
      throw new BadRequestException('Lương mới không thể âm');
    }

    employeeType.Luong = Math.round(newSalary);
    await this.loaiNVLuongRepo.save(employeeType);

    const affectedCount = await this.nhanVienRepo.count({
      where: { LoaiNhanVien: bulkSalaryDto.loaiNhanVien },
    });

    return {
      message: `Đã ${bulkSalaryDto.percentageIncrease > 0 ? 'tăng' : 'giảm'} lương ${Math.abs(bulkSalaryDto.percentageIncrease)}% cho loại nhân viên ${employeeType.LoaiNhanVien}`,
      loaiNhanVien: employeeType.LoaiNhanVien,
      oldSalary,
      newSalary: employeeType.Luong,
      percentageChange: bulkSalaryDto.percentageIncrease + '%',
      affectedEmployees: affectedCount,
      reason: bulkSalaryDto.reason,
    };
  }

  // ===========================
  // REFERENCE DATA
  // ===========================

  /**
   * Get all employee types with salary information
   */
  async getAllEmployeeTypes() {
    const types = await this.loaiNVLuongRepo.find({
      order: { LoaiNhanVien: 'ASC' },
    });

    return types.map(t => ({
      loaiNhanVien: t.LoaiNhanVien,
      luong: t.Luong,
    }));
  }

  /**
   * Get all branches
   */
  async getAllBranches() {
    const branches = await this.chiNhanhRepo.find({
      order: { TenChiNhanh: 'ASC' },
    });

    return branches.map(b => ({
      maChiNhanh: b.MaChiNhanh,
      tenChiNhanh: b.TenChiNhanh,
      diaChi: b.DiaChi,
      sdt: b.SDT,
    }));
  }

  /**
   * Get all departments
   */
  async getAllDepartments() {
    const departments = await this.khoaRepo.find({
      order: { TenKhoa: 'ASC' },
    });

    return departments.map(k => ({
      maKhoa: k.MaKhoa,
      tenKhoa: k.TenKhoa,
      truongKhoa: k.TruongKhoa,
    }));
  }
}
