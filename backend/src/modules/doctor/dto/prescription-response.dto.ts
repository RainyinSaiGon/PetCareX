export class PrescriptionResponseDto {
  maToaThuoc: number;
  maThuCung: number;
  tenThuCung: string;
  ngayKham: Date;
  tongTien: number;
  chiTiets: PrescriptionDetailResponseDto[];
}

export class PrescriptionDetailResponseDto {
  maThuoc: string;
  tenSanPham: string;
  soLuong: number;
  ghiChu: string;
}
