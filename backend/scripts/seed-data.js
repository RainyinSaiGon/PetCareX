const { Client } = require('pg');
require('dotenv').config();

async function seedData() {
  const client = new Client({
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT || '5432'),
    user: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME || 'postgres',
    ssl: process.env.DATABASE_SSL === 'true' ? {
      rejectUnauthorized: false
    } : false,
  });

  try {
    console.log('Connecting to database...');
    await client.connect();
    console.log('Connected successfully!');

    // ============ INSERT CHI NHÁNH (BRANCHES) ============
    console.log('\n Inserting Chi Nhánh (Branches)...');

    const branches = [
      {
        MaChiNhanh: '001',
        TenChiNhanh: 'Chi Nhánh Chính - TP.HCM',
        DiaChi: '123 Đường Nguyễn Hữu Cảnh, Quận 1, TP.HCM',
        SDT: '0933333333',
        ThoiGianMoCua: '08:00:00',
        ThoiGianDongCua: '18:00:00'
      },
      {
        MaChiNhanh: '002',
        TenChiNhanh: 'Chi Nhánh Sài Gòn',
        DiaChi: '456 Đường Lê Lợi, Quận 1, TP.HCM',
        SDT: '0934444444',
        ThoiGianMoCua: '08:00:00',
        ThoiGianDongCua: '18:00:00'
      },
      {
        MaChiNhanh: '003',
        TenChiNhanh: 'Chi Nhánh Bình Dương',
        DiaChi: '789 Đường Độc Lập, TP.Thủ Dầu Một, Bình Dương',
        SDT: '0935555555',
        ThoiGianMoCua: '08:00:00',
        ThoiGianDongCua: '18:00:00'
      },
      {
        MaChiNhanh: '004',
        TenChiNhanh: 'Chi Nhánh Đà Nẵng',
        DiaChi: '321 Đường Bạch Đằng, Quận Hải Châu, Đà Nẵng',
        SDT: '0936666666',
        ThoiGianMoCua: '08:00:00',
        ThoiGianDongCua: '18:00:00'
      },
      {
        MaChiNhanh: '005',
        TenChiNhanh: 'Chi Nhánh Hà Nội',
        DiaChi: '654 Đường Trần Hưng Đạo, Quận Hoàn Kiếm, Hà Nội',
        SDT: '0937777777',
        ThoiGianMoCua: '08:00:00',
        ThoiGianDongCua: '18:00:00'
      }
    ];

    for (const branch of branches) {
      try {
        await client.query(
          `INSERT INTO "CHINHANH" ("MaChiNhanh", "TenChiNhanh", "DiaChi", "SDT", "ThoiGianMoCua", "ThoiGianDongCua") 
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT ("MaChiNhanh") DO UPDATE 
           SET "TenChiNhanh" = $2, "DiaChi" = $3, "SDT" = $4`,
          [branch.MaChiNhanh, branch.TenChiNhanh, branch.DiaChi, branch.SDT, branch.ThoiGianMoCua, branch.ThoiGianDongCua]
        );
        console.log(`  ✓ ${branch.TenChiNhanh} (${branch.MaChiNhanh})`);
      } catch (err) {
        console.log(`  ⚠ ${branch.TenChiNhanh} - ${err.message}`);
      }
    }

    // ============ INSERT LOẠI NHÂN VIÊN - LƯƠNG (EMPLOYEE TYPES) ============
    console.log('\n💰 Creating Loại Nhân Viên - Lương...');

    const employeeTypes = [
      { LoaiNhanVien: 'Bác sĩ', Luong: 25000000 },
      { LoaiNhanVien: 'Y tá', Luong: 12000000 },
      { LoaiNhanVien: 'Lễ tân', Luong: 8000000 },
      { LoaiNhanVien: 'Quản lý', Luong: 30000000 },
      { LoaiNhanVien: 'Kỹ thuật viên', Luong: 15000000 },
    ];

    for (const type of employeeTypes) {
      try {
        await client.query(
          `INSERT INTO "LOAINHANVIEN_LUONG" ("LoaiNhanVien", "Luong") 
           VALUES ($1, $2)
           ON CONFLICT ("LoaiNhanVien") DO UPDATE 
           SET "Luong" = $2`,
          [type.LoaiNhanVien, type.Luong]
        );
        console.log(`  ✓ ${type.LoaiNhanVien}`);
      } catch (err) {
        console.log(`  ⚠ ${type.LoaiNhanVien} - ${err.message}`);
      }
    }

    // ============ INSERT NHÂN VIÊN (EMPLOYEES) ============
    console.log('\n👨‍⚕️ Inserting Nhân Viên (Employees)...');

    const employees = [
      { MaNhanVien: 'NV001', HoTen: 'Nguyễn Văn An', NgaySinh: '1985-03-15', SDT: '0901234567', MaChiNhanh: '001', LoaiNhanVien: 'Bác sĩ' },
      { MaNhanVien: 'NV002', HoTen: 'Trần Thị Bình', NgaySinh: '1990-07-22', SDT: '0902345678', MaChiNhanh: '001', LoaiNhanVien: 'Bác sĩ' },
      { MaNhanVien: 'NV003', HoTen: 'Lê Văn Cường', NgaySinh: '1988-11-10', SDT: '0903456789', MaChiNhanh: '002', LoaiNhanVien: 'Bác sĩ' },
      { MaNhanVien: 'NV004', HoTen: 'Phạm Thị Dung', NgaySinh: '1992-05-08', SDT: '0904567890', MaChiNhanh: '002', LoaiNhanVien: 'Y tá' },
      { MaNhanVien: 'NV005', HoTen: 'Hoàng Văn Em', NgaySinh: '1987-09-25', SDT: '0905678901', MaChiNhanh: '003', LoaiNhanVien: 'Bác sĩ' },
      { MaNhanVien: 'NV006', HoTen: 'Võ Thị Phương', NgaySinh: '1995-01-12', SDT: '0906789012', MaChiNhanh: '003', LoaiNhanVien: 'Lễ tân' },
      { MaNhanVien: 'NV007', HoTen: 'Đặng Văn Giang', NgaySinh: '1983-06-30', SDT: '0907890123', MaChiNhanh: '004', LoaiNhanVien: 'Bác sĩ' },
      { MaNhanVien: 'NV008', HoTen: 'Bùi Thị Hương', NgaySinh: '1991-12-05', SDT: '0908901234', MaChiNhanh: '004', LoaiNhanVien: 'Y tá' },
      { MaNhanVien: 'NV009', HoTen: 'Ngô Văn Inh', NgaySinh: '1986-04-18', SDT: '0909012345', MaChiNhanh: '005', LoaiNhanVien: 'Bác sĩ' },
      { MaNhanVien: 'NV010', HoTen: 'Lý Thị Kim', NgaySinh: '1993-08-28', SDT: '0910123456', MaChiNhanh: '005', LoaiNhanVien: 'Quản lý' },
    ];

    for (const emp of employees) {
      try {
        await client.query(
          `INSERT INTO "NHANVIEN" ("MaNhanVien", "HoTen", "NgaySinh", "SDT", "MaChiNhanh", "LoaiNhanVien", "NgayVaoLam") 
           VALUES ($1, $2, $3, $4, $5, $6, CURRENT_DATE)
           ON CONFLICT ("MaNhanVien") DO UPDATE 
           SET "HoTen" = $2, "NgaySinh" = $3, "SDT" = $4, "MaChiNhanh" = $5, "LoaiNhanVien" = $6`,
          [emp.MaNhanVien, emp.HoTen, emp.NgaySinh, emp.SDT, emp.MaChiNhanh, emp.LoaiNhanVien]
        );
        console.log(`  ✓ ${emp.HoTen} (${emp.MaNhanVien}) - ${emp.LoaiNhanVien}`);
      } catch (err) {
        console.log(`  ⚠ ${emp.HoTen} - ${err.message}`);
      }
    }

    // ============ INSERT KHO (WAREHOUSES) ============
    console.log('\n🏢 Creating Kho (Warehouses)...');

    for (const branch of branches) {
      try {
        await client.query(
          `INSERT INTO "KHO" ("MaKho") 
           VALUES ($1)
           ON CONFLICT ("MaKho") DO NOTHING`,
          [branch.MaChiNhanh]
        );
        console.log(`  ✓ Kho ${branch.TenChiNhanh}`);
      } catch (err) {
        if (!err.message.includes('duplicate')) {
          console.log(`  ⚠ Kho ${branch.TenChiNhanh} - ${err.message}`);
        }
      }
    }

    // ============ INSERT SẢN PHẨM (PRODUCTS) ============
    console.log('\n📦 Inserting Sản Phẩm (Products)...');

    const products = [
      // Thuốc (Medicines)
      { MaSanPham: '00001', TenSanPham: 'Amoxicillin 250mg', GiaTienSanPham: 15000, LoaiSanPham: 'Thuốc', HinhAnh: 'https://images.pexels.com/photos/3808517/pexels-photo-3808517.jpeg?auto=compress&cs=tinysrgb&w=400' },
      { MaSanPham: '00002', TenSanPham: 'Erythromycin 500mg', GiaTienSanPham: 25000, LoaiSanPham: 'Thuốc', HinhAnh: 'https://images.pexels.com/photos/3808517/pexels-photo-3808517.jpeg?auto=compress&cs=tinysrgb&w=400' },
      { MaSanPham: '00003', TenSanPham: 'Vitamin B Complex', GiaTienSanPham: 35000, LoaiSanPham: 'Thuốc', HinhAnh: 'https://images.pexels.com/photos/3873854/pexels-photo-3873854.jpeg?auto=compress&cs=tinysrgb&w=400' },
      { MaSanPham: '00004', TenSanPham: 'Ibuprofen 400mg', GiaTienSanPham: 12000, LoaiSanPham: 'Thuốc', HinhAnh: 'https://images.pexels.com/photos/5632399/pexels-photo-5632399.jpeg?auto=compress&cs=tinysrgb&w=400' },
      { MaSanPham: '00005', TenSanPham: 'Paracetamol 500mg', GiaTienSanPham: 8000, LoaiSanPham: 'Thuốc', HinhAnh: 'https://images.pexels.com/photos/3873854/pexels-photo-3873854.jpeg?auto=compress&cs=tinysrgb&w=400' },

      // Thức ăn (Food)
      { MaSanPham: '00006', TenSanPham: 'Thức ăn cho chó Premium', GiaTienSanPham: 150000, LoaiSanPham: 'Thức ăn', HinhAnh: 'https://images.pexels.com/photos/3621644/pexels-photo-3621644.jpeg?auto=compress&cs=tinysrgb&w=400' },
      { MaSanPham: '00007', TenSanPham: 'Thức ăn cho mèo Premium', GiaTienSanPham: 180000, LoaiSanPham: 'Thức ăn', HinhAnh: 'https://images.pexels.com/photos/5632399/pexels-photo-5632399.jpeg?auto=compress&cs=tinysrgb&w=400' },
      { MaSanPham: '00008', TenSanPham: 'Snack cho chó (200g)', GiaTienSanPham: 45000, LoaiSanPham: 'Thức ăn', HinhAnh: 'https://images.pexels.com/photos/2317904/pexels-photo-2317904.jpeg?auto=compress&cs=tinysrgb&w=400' },
      { MaSanPham: '00009', TenSanPham: 'Snack cho mèo (150g)', GiaTienSanPham: 50000, LoaiSanPham: 'Thức ăn', HinhAnh: 'https://images.pexels.com/photos/2256059/pexels-photo-2256059.jpeg?auto=compress&cs=tinysrgb&w=400' },
      { MaSanPham: '00010', TenSanPham: 'Sữa cho thú cưng', GiaTienSanPham: 35000, LoaiSanPham: 'Thức ăn', HinhAnh: 'https://images.pexels.com/photos/3621644/pexels-photo-3621644.jpeg?auto=compress&cs=tinysrgb&w=400' },

      // Phụ kiện (Accessories)
      { MaSanPham: '00011', TenSanPham: 'Vòng cổ chó', GiaTienSanPham: 25000, LoaiSanPham: 'Phụ kiện', HinhAnh: 'https://images.pexels.com/photos/2255367/pexels-photo-2255367.jpeg?auto=compress&cs=tinysrgb&w=400' },
      { MaSanPham: '00012', TenSanPham: 'Vòng cổ mèo', GiaTienSanPham: 20000, LoaiSanPham: 'Phụ kiện', HinhAnh: 'https://images.pexels.com/photos/1595432/pexels-photo-1595432.jpeg?auto=compress&cs=tinysrgb&w=400' },
      { MaSanPham: '00013', TenSanPham: 'Dây xích chó', GiaTienSanPham: 40000, LoaiSanPham: 'Phụ kiện', HinhAnh: 'https://images.pexels.com/photos/2255367/pexels-photo-2255367.jpeg?auto=compress&cs=tinysrgb&w=400' },
      { MaSanPham: '00014', TenSanPham: 'Giường cho thú cưng', GiaTienSanPham: 200000, LoaiSanPham: 'Phụ kiện', HinhAnh: 'https://images.pexels.com/photos/5733390/pexels-photo-5733390.jpeg?auto=compress&cs=tinysrgb&w=400' },
      { MaSanPham: '00015', TenSanPham: 'Bát ăn thú cưng', GiaTienSanPham: 30000, LoaiSanPham: 'Phụ kiện', HinhAnh: 'https://images.pexels.com/photos/1974991/pexels-photo-1974991.jpeg?auto=compress&cs=tinysrgb&w=400' },
      { MaSanPham: '00016', TenSanPham: 'Đồ chơi cho chó', GiaTienSanPham: 60000, LoaiSanPham: 'Phụ kiện', HinhAnh: 'https://images.pexels.com/photos/4588417/pexels-photo-4588417.jpeg?auto=compress&cs=tinysrgb&w=400' },
      { MaSanPham: '00017', TenSanPham: 'Đồ chơi cho mèo', GiaTienSanPham: 50000, LoaiSanPham: 'Phụ kiện', HinhAnh: 'https://images.pexels.com/photos/1440391/pexels-photo-1440391.jpeg?auto=compress&cs=tinysrgb&w=400' },
      { MaSanPham: '00018', TenSanPham: 'Chuốt lông chó', GiaTienSanPham: 75000, LoaiSanPham: 'Phụ kiện', HinhAnh: 'https://images.pexels.com/photos/2255367/pexels-photo-2255367.jpeg?auto=compress&cs=tinysrgb&w=400' },
      { MaSanPham: '00019', TenSanPham: 'Lược chải lông mèo', GiaTienSanPham: 55000, LoaiSanPham: 'Phụ kiện', HinhAnh: 'https://images.pexels.com/photos/1595432/pexels-photo-1595432.jpeg?auto=compress&cs=tinysrgb&w=400' },
      { MaSanPham: '00020', TenSanPham: 'Shampoo cho thú cưng', GiaTienSanPham: 85000, LoaiSanPham: 'Phụ kiện', HinhAnh: 'https://images.pexels.com/photos/3621644/pexels-photo-3621644.jpeg?auto=compress&cs=tinysrgb&w=400' }
    ];

    for (const product of products) {
      try {
        await client.query(
          `INSERT INTO "SANPHAM" ("MaSanPham", "TenSanPham", "GiaTienSanPham", "LoaiSanPham", "HinhAnh") 
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT ("MaSanPham") DO UPDATE 
           SET "TenSanPham" = $2, "GiaTienSanPham" = $3, "LoaiSanPham" = $4, "HinhAnh" = $5`,
          [product.MaSanPham, product.TenSanPham, product.GiaTienSanPham, product.LoaiSanPham, product.HinhAnh]
        );
        console.log(`  ✓ ${product.TenSanPham} (${product.MaSanPham})`);
      } catch (err) {
        console.log(`  ⚠ ${product.TenSanPham} - ${err.message}`);
      }
    }

    // ============ INSERT THUỐC (MEDICINES INTO THUOC TABLE) ============
    console.log('\n Inserting Medicines into THUOC table...');

    const medicines = products.filter(p => p.LoaiSanPham === 'Thuốc');
    for (const medicine of medicines) {
      try {
        await client.query(
          `INSERT INTO "THUOC" ("MaSanPham") 
           VALUES ($1)
           ON CONFLICT ("MaSanPham") DO NOTHING`,
          [medicine.MaSanPham]
        );
        console.log(`  ✓ ${medicine.TenSanPham} added to THUOC`);
      } catch (err) {
        console.log(`  ⚠ ${medicine.TenSanPham} - ${err.message}`);
      }
    }

    // ============ INSERT CHI TIẾT TỒN KHO (INVENTORY DETAILS) ============
    console.log('\n Creating Inventory Stock Levels...');

    // Initialize inventory for each product in each branch warehouse
    const stockLevels = {
      '00001': 50, '00002': 30, '00003': 100, '00004': 75, '00005': 120,
      '00006': 20, '00007': 18, '00008': 45, '00009': 40, '00010': 60,
      '00011': 85, '00012': 95, '00013': 35, '00014': 10, '00015': 150,
      '00016': 25, '00017': 28, '00018': 15, '00019': 22, '00020': 18
    };

    let inventoryCount = 0;
    for (const branch of branches) {
      for (const product of products) {
        try {
          await client.query(
            `INSERT INTO "CHI_TIET_TON_KHO" ("MaKho", "MaSanPham", "SoLuong") 
             VALUES ($1, $2, $3)
             ON CONFLICT ("MaKho", "MaSanPham") DO UPDATE 
             SET "SoLuong" = $3`,
            [branch.MaChiNhanh, product.MaSanPham, stockLevels[product.MaSanPham] || 50]
          );
          inventoryCount++;
        } catch (err) {
          if (!err.message.includes('duplicate')) {
            console.log(`  ⚠ Inventory error: ${err.message}`);
          }
        }
      }
    }
    console.log(`  ✓ Created ${inventoryCount} inventory records`);

    // ============ INSERT DỊCH VỤ Y TẾ (MEDICAL SERVICES) ============
    console.log('\n🏥 Creating Dịch Vụ Y Tế (Medical Services)...');

    const services = [
      { MaDichVu: 'DV001', TenDichVu: 'Khám tổng quát', LoaiDichVu: 'Khám bệnh' },
      { MaDichVu: 'DV002', TenDichVu: 'Tiêm phòng', LoaiDichVu: 'Tiêm chủng' },
      { MaDichVu: 'DV003', TenDichVu: 'Khám chuyên khoa', LoaiDichVu: 'Khám bệnh' },
      { MaDichVu: 'DV004', TenDichVu: 'Xét nghiệm máu', LoaiDichVu: 'Xét nghiệm' },
      { MaDichVu: 'DV005', TenDichVu: 'Siêu âm', LoaiDichVu: 'Chẩn đoán' },
      { MaDichVu: 'DV006', TenDichVu: 'Phẫu thuật nhỏ', LoaiDichVu: 'Phẫu thuật' },
      { MaDichVu: 'DV007', TenDichVu: 'Triệt sản', LoaiDichVu: 'Phẫu thuật' },
      { MaDichVu: 'DV008', TenDichVu: 'Chăm sóc răng miệng', LoaiDichVu: 'Nha khoa' },
    ];

    for (const service of services) {
      try {
        await client.query(
          `INSERT INTO "DICHVUYTE" ("MaDichVu", "TenDichVu", "LoaiDichVu") 
           VALUES ($1, $2, $3)
           ON CONFLICT ("MaDichVu") DO UPDATE 
           SET "TenDichVu" = $2, "LoaiDichVu" = $3`,
          [service.MaDichVu, service.TenDichVu, service.LoaiDichVu]
        );
        console.log(`  ✓ ${service.TenDichVu} (${service.MaDichVu})`);
      } catch (err) {
        console.log(`  ⚠ ${service.TenDichVu} - ${err.message}`);
      }
    }

    // ============ INSERT CUNG CẤP DỊCH VỤ (SERVICE-BRANCH MAPPINGS) ============
    console.log('\n🔗 Linking Services to Branches...');

    let serviceMappingCount = 0;
    for (const branch of branches) {
      for (const service of services) {
        try {
          await client.query(
            `INSERT INTO "CUNGCAPDICHVU" ("MaChiNhanh", "MaDichVu") 
             VALUES ($1, $2)
             ON CONFLICT ("MaChiNhanh", "MaDichVu") DO NOTHING`,
            [branch.MaChiNhanh, service.MaDichVu]
          );
          serviceMappingCount++;
        } catch (err) {
          if (!err.message.includes('duplicate')) {
            console.log(`  ⚠ Mapping error: ${err.message}`);
          }
        }
      }
    }
    console.log(`  ✓ Created ${serviceMappingCount} service-branch mappings`);

    console.log('\n  Data seeding completed successfully!');

  } catch (error) {
    console.error('\n Error during data seeding:', error.message);
    process.exit(1);
  } finally {
    await client.end();
    console.log('\nDatabase connection closed.');
  }
}

seedData();
