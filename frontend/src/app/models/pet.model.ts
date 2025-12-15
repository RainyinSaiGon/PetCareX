export interface ThuCung {
  MaThuCung: number;
  MaKhachHang: number;
  TenThuCung: string;
  MaChungLoai: string;
  NgaySinhThuCung?: Date;
  ChungLoai?: {
    MaChungLoaiThuCung: string;
    TenChungLoaiThuCung: string;
    MaLoaiThuCung: string;
  };
}

export interface CreateThuCungDto {
  TenThuCung: string;
  MaChungLoai: string;
  NgaySinhThuCung?: Date;
}

export interface UpdateThuCungDto {
  TenThuCung?: string;
  MaChungLoai?: string;
  NgaySinhThuCung?: Date;
}

export interface LoaiThuCung {
  MaLoaiThuCung: string;
  TenLoaiThuCung: string;
}

export interface ChungLoaiThuCung {
  MaChungLoaiThuCung: string;
  TenChungLoaiThuCung: string;
  MaLoaiThuCung: string;
  LoaiThuCung?: LoaiThuCung;
}

export interface PetStatistics {
  totalPets: number;
  petsByType: { [type: string]: number };
  petsPerCustomer: number;
}

