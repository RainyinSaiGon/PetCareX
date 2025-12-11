export class SalaryStatisticsDto {
  // Overall statistics
  totalEmployees: number;
  totalSalaryExpense: number;
  averageSalary: number;
  medianSalary: number;
  minSalary: number;
  maxSalary: number;

  // By employee type
  byEmployeeType: SalaryByType[];

  // By branch
  byBranch: SalaryByBranch[];

  // By department (for doctors)
  byDepartment: SalaryByDepartment[];

  // Salary distribution
  salaryDistribution: SalaryDistribution[];

  // Trends
  salaryTrends: SalaryTrend[];

  // Top earners
  topEarners: TopEarner[];
}

export class SalaryByType {
  loaiNhanVien: string;
  count: number;
  totalSalary: number;
  averageSalary: number;
  minSalary: number;
  maxSalary: number;
  percentageOfTotal: number;
}

export class SalaryByBranch {
  maChiNhanh: string;
  tenChiNhanh: string;
  totalEmployees: number;
  totalSalary: number;
  averageSalary: number;
  byType: {
    loaiNhanVien: string;
    count: number;
    totalSalary: number;
  }[];
}

export class SalaryByDepartment {
  maKhoa: string;
  tenKhoa: string;
  doctorCount: number;
  totalSalary: number;
  averageSalary: number;
}

export class SalaryDistribution {
  range: string;
  minSalary: number;
  maxSalary: number;
  count: number;
  percentage: number;
}

export class SalaryTrend {
  month: string;
  totalSalary: number;
  employeeCount: number;
  averageSalary: number;
}

export class TopEarner {
  maNhanVien: string;
  hoTen: string;
  loaiNhanVien: string;
  salary: number;
  branch: string;
  department?: string;
}

export class SalaryComparisonDto {
  employeeType: string;
  currentSalary: number;
  industryAverage?: number;
  comparison?: 'above' | 'below' | 'equal';
  percentageDifference?: number;
}

export class SalaryForecastDto {
  month: string;
  predictedTotalSalary: number;
  predictedEmployeeCount: number;
  confidence: number;
}
