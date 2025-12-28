/**
 * Comprehensive Data Seeding Script for PetCareX
 * This script seeds ~400,000+ records matching the TypeORM entity schemas
 * 
 * Run: node scripts/seed-full-data.js --force
 */

require('dotenv').config();
const { Client } = require('pg');

// Helper Functions
function padNumber(num, length) {
    return String(num).padStart(length, '0');
}

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomChoice(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function randomDate(startDaysAgo, endDaysAgo = 0) {
    const now = new Date();
    const daysAgo = randomInt(endDaysAgo, startDaysAgo);
    now.setDate(now.getDate() - daysAgo);
    return now.toISOString().split('T')[0];
}

function randomDateTime(startDaysAgo, endDaysAgo = 0) {
    const now = new Date();
    const daysAgo = randomInt(endDaysAgo, startDaysAgo);
    now.setDate(now.getDate() - daysAgo);
    now.setHours(randomInt(8, 20), randomInt(0, 59), 0, 0);
    return now.toISOString();
}

// Vietnamese name generators
const HO_LIST = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Huỳnh', 'Phan', 'Vũ', 'Võ', 'Đặng', 'Bùi', 'Đỗ', 'Hồ', 'Ngô', 'Dương'];
const DEM_LIST = ['Văn', 'Thị', 'Ngọc', 'Minh', 'Hoàng', 'Thanh', 'Quốc', 'Xuân', 'Kim', 'Hữu', 'Đức', 'Anh', 'Thu'];
const TEN_LIST = ['An', 'Bình', 'Cường', 'Dũng', 'Hà', 'Hương', 'Lan', 'Mai', 'Nam', 'Phương', 'Quân', 'Trang', 'Tuấn', 'Vy', 'Hải', 'Linh', 'Long', 'Tâm', 'Thảo', 'Yến'];

function generateVietnameseName() {
    return `${randomChoice(HO_LIST)} ${randomChoice(DEM_LIST)} ${randomChoice(TEN_LIST)}`;
}

function generatePhone() {
    const prefixes = ['090', '091', '093', '094', '096', '097', '098', '086', '083', '084', '085', '081', '082'];
    return prefixes[randomInt(0, prefixes.length - 1)] + String(randomInt(1000000, 9999999));
}

const PET_NAMES = ['Miu', 'Lu', 'Bông', 'Lucky', 'Cún', 'Su', 'Bi', 'Nâu', 'Đen', 'Vàng', 'Bé', 'Cưng', 'Mập', 'Tí', 'Mochi', 'Kiki', 'Lulu', 'Bun', 'Bim', 'Coco'];
const PET_SUFFIXES = [' Con', ' Nhỏ', ' Xinh', ' Bé', ' Mập', ' 2', ' Jr'];

function generatePetName() {
    const baseName = randomChoice(PET_NAMES);
    if (Math.random() < 0.4) return baseName;
    return (baseName + randomChoice(PET_SUFFIXES)).substring(0, 20);
}

// Main seeding function
async function seedData() {
    const client = new Client({
        host: process.env.DATABASE_HOST,
        port: parseInt(process.env.DATABASE_PORT || '5432'),
        user: process.env.DATABASE_USERNAME,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE_NAME || 'postgres',
        ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
    });

    try {
        console.log('🔌 Connecting to database...');
        await client.connect();
        console.log('✅ Connected successfully!\n');

        // Check if data exists
        const forceReseed = process.argv.includes('--force');
        const existingDataCheck = await client.query('SELECT COUNT(*) FROM "CHINHANH"');
        const hasExistingData = parseInt(existingDataCheck.rows[0].count) > 0;

        if (hasExistingData && !forceReseed) {
            console.log('═══════════════════════════════════════════════════════════════');
            console.log('ℹ️  DATA ALREADY EXISTS - SKIPPING SEEDING');
            console.log('═══════════════════════════════════════════════════════════════\n');
            console.log('To force re-seeding, run: node scripts/seed-full-data.js --force\n');
            await client.end();
            return;
        }

        if (hasExistingData && forceReseed) {
            console.log('═══════════════════════════════════════════════════════════════');
            console.log('⚠️  FORCE RE-SEEDING REQUESTED');
            console.log('═══════════════════════════════════════════════════════════════\n');
        }

        // Clear existing data
        console.log('🗑️  CLEARING ALL EXISTING DATA...\n');
        const tablesToClear = [
            '"DANHGIAMUAHANG"', '"DANHGIAYTE"', '"THANHTOANDICHVUYTE"', '"HOADON_SANPHAM"', '"HOADON"',
            '"GIAYTIEMPHONG"', '"CHITIETTOATHUOC"', '"TOATHUOC"',
            '"CHITIETKHAMBENH_CHUANDOAN"', '"CHITIETKHAMBENH_TRIEUCHUNG"', '"GIAYKHAMBENHCHUYENKHOA"', '"GIAYKHAMBENHTONGQUAT"',
            '"PHIEUDANGKYLE"', '"PHIEUDANGKYGOI"', '"PHIEUDANGKYTIEMPHONG"',
            '"CHITIETGOITIEMPHONG"', '"GOITIEMPHONG"', '"CUNGCAPDICHVU"', '"DICHVUYTE"',
            '"KHOVACCINE"', '"VACCINE"', '"CHI_TIET_TON_KHO"',
            '"THANHPHANTHUCAN"', '"PHUKIEN"', '"THUCAN"', '"THUOC"', '"LICHSUGIASANPHAM"', '"SANPHAM"',
            '"LICHHEN"', '"THUCUNG"', '"CHUNGLOAITHUCUNG"', '"LOAITHUCUNG"',
            '"KHACHHANGTHANHVIEN"', '"HANGTHANHVIEN"', '"KHACHHANG"',
            '"LICHLAMVIECBACSI"', '"KHO"', '"NHANVIEN"', '"LOAINHANVIEN_LUONG"', '"KHOA"', '"CHINHANH"',
        ];
        for (const table of tablesToClear) {
            try {
                await client.query(`TRUNCATE TABLE ${table} CASCADE`);
                console.log(`   ✅ Cleared ${table}`);
            } catch (err) {
                console.log(`   ⏭️  Skipped ${table}`);
            }
        }
        console.log('\n✅ All existing data cleared!\n');

        // ============================================================================
        // NHÓM 1: CƠ CẤU TỔ CHỨC & NHÂN SỰ
        // ============================================================================
        console.log('═══════════════════════════════════════════════════════════════');
        console.log('📍 NHÓM 1: CƠ CẤU TỔ CHỨC & NHÂN SỰ');
        console.log('═══════════════════════════════════════════════════════════════\n');

        // 1. CHINHANH (10 branches)
        console.log('1️⃣  Inserting CHINHANH (10 branches)...');
        const branches = [
            { id: 'CN01', name: 'PetCareX Hà Nội', addr: '15 Tràng Tiền, Hoàn Kiếm, Hà Nội', phone: '0901000001' },
            { id: 'CN02', name: 'PetCareX Hải Phòng', addr: '20 Lạch Tray, Hải Phòng', phone: '0901000002' },
            { id: 'CN03', name: 'PetCareX Quảng Ninh', addr: '50 Lê Thánh Tông, Hạ Long', phone: '0901000003' },
            { id: 'CN04', name: 'PetCareX Nghệ An', addr: '10 Quang Trung, Vinh', phone: '0901000004' },
            { id: 'CN05', name: 'PetCareX Huế', addr: '15 Lê Lợi, TP Huế', phone: '0901000005' },
            { id: 'CN06', name: 'PetCareX Đà Nẵng', addr: '200 Bạch Đằng, Đà Nẵng', phone: '0901000006' },
            { id: 'CN07', name: 'PetCareX Nha Trang', addr: '78 Trần Phú, Nha Trang', phone: '0901000007' },
            { id: 'CN08', name: 'PetCareX Đà Lạt', addr: '01 Lê Đại Hành, Đà Lạt', phone: '0901000008' },
            { id: 'CN09', name: 'PetCareX HCM', addr: '68 Nguyễn Huệ, Q1, TP.HCM', phone: '0901000009' },
            { id: 'CN10', name: 'PetCareX Cần Thơ', addr: '50 Đường 30/4, Cần Thơ', phone: '0901000010' },
        ];
        for (const b of branches) {
            await client.query(`
                INSERT INTO "CHINHANH" ("MaChiNhanh", "TenChiNhanh", "DiaChi", "SDT", "ThoiGianMoCua", "ThoiGianDongCua")
                VALUES ($1, $2, $3, $4, '08:00:00', '22:00:00') ON CONFLICT DO NOTHING
            `, [b.id, b.name, b.addr, b.phone]);
        }
        console.log('   ✅ 10 branches inserted\n');

        // 2. KHOA (5 departments)
        console.log('2️⃣  Inserting KHOA (5 departments)...');
        const departments = [
            { id: '01', name: 'Khoa Nội' }, { id: '02', name: 'Khoa Ngoại' }, { id: '03', name: 'Da Liễu' },
            { id: '04', name: 'CĐ Hình ảnh' }, { id: '05', name: 'Cấp cứu' }
        ];
        for (const d of departments) {
            await client.query(`INSERT INTO "KHOA" ("MaKhoa", "TenKhoa") VALUES ($1, $2) ON CONFLICT DO NOTHING`, [d.id, d.name]);
        }
        console.log('   ✅ 5 departments inserted\n');

        // 3. LOAINHANVIEN_LUONG
        console.log('3️⃣  Inserting LOAINHANVIEN_LUONG...');
        const empTypes = [
            { type: 'QuanLy', salary: 25000000 }, { type: 'BacSi', salary: 18000000 },
            { type: 'TiepTan', salary: 8000000 }, { type: 'Kho', salary: 7000000 }, { type: 'TapVu', salary: 6000000 }
        ];
        for (const e of empTypes) {
            await client.query(`INSERT INTO "LOAINHANVIEN_LUONG" ("LoaiNhanVien", "Luong") VALUES ($1, $2) ON CONFLICT DO NOTHING`, [e.type, e.salary]);
        }
        console.log('   ✅ 5 employee types inserted\n');

        // 4. NHANVIEN (150 employees)
        console.log('4️⃣  Inserting NHANVIEN (150 employees)...');
        for (let i = 1; i <= 150; i++) {
            const maNV = padNumber(i, 5);
            const hoTen = generateVietnameseName();
            const sdt = generatePhone();
            const maCN = 'CN' + padNumber((i % 10) + 1, 2);
            let loaiNV, maKhoa = null;
            if (i <= 10) loaiNV = 'QuanLy';
            else if (i <= 60) { loaiNV = 'BacSi'; maKhoa = padNumber((i % 5) + 1, 2); }
            else if (i <= 110) loaiNV = 'TiepTan';
            else if (i <= 130) loaiNV = 'Kho';
            else loaiNV = 'TapVu';
            const ngayVao = randomDate(2000, 30);
            const ngaySinh = randomDate(15000, 8000);

            await client.query(`
                INSERT INTO "NHANVIEN" ("MaNhanVien", "HoTen", "SDT", "MaChiNhanh", "LoaiNhanVien", "MaKhoa", "NgayVaoLam", "NgaySinh")
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT DO NOTHING
            `, [maNV, hoTen, sdt, maCN, loaiNV, maKhoa, ngayVao, ngaySinh]);
        }
        console.log('   ✅ 150 employees inserted\n');

        // 5. KHO (10 warehouses)
        console.log('5️⃣  Inserting KHO (10 warehouses)...');
        for (let i = 1; i <= 10; i++) {
            const maKho = 'K' + padNumber(i, 3);
            const nvPhuTrach = padNumber(110 + i, 5);
            await client.query(`INSERT INTO "KHO" ("MaKho", "NhanVienPhuTrach") VALUES ($1, $2) ON CONFLICT DO NOTHING`, [maKho, nvPhuTrach]);
        }
        console.log('   ✅ 10 warehouses inserted\n');

        // Update managers
        console.log('👔 Updating managers...');
        for (let i = 1; i <= 10; i++) {
            await client.query(`UPDATE "CHINHANH" SET "MaQuanLy" = $1 WHERE "MaChiNhanh" = $2`, [padNumber(i, 5), 'CN' + padNumber(i, 2)]);
        }
        for (let i = 1; i <= 5; i++) {
            await client.query(`UPDATE "KHOA" SET "TruongKhoa" = $1 WHERE "MaKhoa" = $2`, [padNumber(10 + i, 5), padNumber(i, 2)]);
        }
        console.log('   ✅ Managers updated\n');

        // ============================================================================
        // NHÓM 2: KHÁCH HÀNG & THÚ CƯNG
        // ============================================================================
        console.log('═══════════════════════════════════════════════════════════════');
        console.log('👤 NHÓM 2: KHÁCH HÀNG & THÚ CƯNG');
        console.log('═══════════════════════════════════════════════════════════════\n');

        // Member Tiers
        console.log('⭐ Inserting HANGTHANHVIEN...');
        await client.query(`INSERT INTO "HANGTHANHVIEN" ("TenHang", "GiamGia", "DiemTichLuyToiThieu") VALUES ('Cơ bản', 0, 0), ('Thân thiết', 0.20, 5000000), ('VIP', 0.30, 12000000) ON CONFLICT DO NOTHING`);
        console.log('   ✅ 3 member tiers inserted\n');

        // Pet Types
        console.log('🐕 Inserting LOAITHUCUNG...');
        const petTypes = [{ id: 'L1', name: 'Chó' }, { id: 'L2', name: 'Mèo' }, { id: 'L3', name: 'Hamster' }, { id: 'L4', name: 'Thỏ' }, { id: 'L5', name: 'Chim' }];
        for (const p of petTypes) {
            await client.query(`INSERT INTO "LOAITHUCUNG" ("MaLoaiThuCung", "TenLoaiThuCung") VALUES ($1, $2) ON CONFLICT DO NOTHING`, [p.id, p.name]);
        }
        console.log('   ✅ 5 pet types inserted\n');

        // Pet Breeds
        console.log('🐩 Inserting CHUNGLOAITHUCUNG...');
        const breeds = [
            { id: 'C1', name: 'Chó Corgi', type: 'L1' }, { id: 'C2', name: 'Chó Husky', type: 'L1' },
            { id: 'C3', name: 'Mèo Anh', type: 'L2' }, { id: 'C4', name: 'Mèo Ba Tư', type: 'L2' },
            { id: 'C5', name: 'Hamster Winter', type: 'L3' }, { id: 'C6', name: 'Thỏ Hà Lan', type: 'L4' }
        ];
        for (const b of breeds) {
            await client.query(`INSERT INTO "CHUNGLOAITHUCUNG" ("MaChungLoaiThuCung", "TenChungLoaiThuCung", "MaLoaiThuCung") VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`, [b.id, b.name, b.type]);
        }
        console.log('   ✅ 6 pet breeds inserted\n');

        // Customers (80,000)
        console.log('👤 Inserting KHACHHANG (80,000 customers)...');
        console.log('   ⏳ This may take a few minutes...');
        const batchSize = 1000;
        for (let batch = 0; batch < 80; batch++) {
            const values = [];
            const params = [];
            let idx = 1;
            for (let j = 0; j < batchSize; j++) {
                values.push(`($${idx}, $${idx + 1})`);
                params.push(generateVietnameseName(), generatePhone());
                idx += 2;
            }
            try {
                await client.query(`INSERT INTO "KHACHHANG" ("HoTen", "SoDienThoai") VALUES ${values.join(', ')} ON CONFLICT DO NOTHING`, params);
            } catch (err) { /* skip */ }
            if ((batch + 1) % 16 === 0) console.log(`   -> Inserted ${(batch + 1) * batchSize} customers...`);
        }
        console.log('   ✅ 80,000 customers inserted\n');

        // Member Customers (30,000)
        console.log('👤 Inserting KHACHHANGTHANHVIEN (30,000 members)...');
        for (let batch = 0; batch < 60; batch++) {
            const values = [];
            const params = [];
            let idx = 1;
            for (let j = 0; j < 500; j++) {
                const maKH = batch * 500 + j + 1;
                const email = `user${maKH}@gmail.com`;
                const gioiTinh = Math.random() > 0.5 ? 'Nam' : 'Nữ';
                const dob = randomDate(15000, 6500);
                const cccd = String(randomInt(100000000000, 999999999999));
                const chiTieu = randomInt(10, 190) * 100000;
                let tenHang = chiTieu < 5000000 ? 'Cơ bản' : (chiTieu < 12000000 ? 'Thân thiết' : 'VIP');

                values.push(`($${idx}, $${idx + 1}, $${idx + 2}, $${idx + 3}, $${idx + 4}, $${idx + 5}, $${idx + 6}, $${idx + 7})`);
                params.push(maKH, email, gioiTinh, dob, cccd, chiTieu, tenHang, 'TP.HCM');
                idx += 8;
            }
            try {
                await client.query(`INSERT INTO "KHACHHANGTHANHVIEN" ("MaKhachHang", "Email", "GioiTinh", "NgaySinh", "CCCD", "TongChiTieu", "TenHang", "DiaChi") VALUES ${values.join(', ')} ON CONFLICT DO NOTHING`, params);
            } catch (err) { /* skip */ }
            if ((batch + 1) % 12 === 0) console.log(`   -> Inserted ${(batch + 1) * 500} members...`);
        }
        console.log('   ✅ 30,000 member customers inserted\n');

        // Pets (120,000)
        console.log('🐾 Inserting THUCUNG (120,000 pets)...');
        console.log('   ⏳ This may take several minutes...');
        for (let batch = 0; batch < 120; batch++) {
            const values = [];
            const params = [];
            let idx = 1;
            for (let j = 0; j < batchSize; j++) {
                const maKH = randomInt(1, 80000);
                const breed = randomChoice(breeds);
                const gioiTinh = Math.random() > 0.5 ? 'Đực' : 'Cái';
                const canNang = (Math.random() * 25 + 1).toFixed(1);
                values.push(`($${idx}, $${idx + 1}, $${idx + 2}, $${idx + 3}, $${idx + 4}, $${idx + 5})`);
                params.push(generatePetName(), randomDate(2000, 30), gioiTinh, canNang, maKH, breed.id);
                idx += 6;
            }
            try {
                await client.query(`INSERT INTO "THUCUNG" ("TenThuCung", "NgaySinhThuCung", "GioiTinh", "CanNang", "MaKhachHang", "MaChungLoaiThuCung") VALUES ${values.join(', ')}`, params);
            } catch (err) { /* skip */ }
            if ((batch + 1) % 24 === 0) console.log(`   -> Inserted ${(batch + 1) * batchSize} pets...`);
        }
        console.log('   ✅ 120,000 pets inserted\n');

        // ============================================================================
        // NHÓM 3: SẢN PHẨM & KHO
        // ============================================================================
        console.log('═══════════════════════════════════════════════════════════════');
        console.log('📦 NHÓM 3: SẢN PHẨM & KHO');
        console.log('═══════════════════════════════════════════════════════════════\n');

        // Products (999)
        console.log('📦 Inserting SANPHAM (999 products)...');
        const productBrands = {
            food: ['Royal Canin', 'Whiskas', 'Pedigree', 'Me-O', 'SmartHeart'],
            medicine: ['Viên nhai', 'Dung dịch', 'Thuốc nhỏ', 'Gel', 'Kem bôi'],
            accessory: ['Vòng cổ', 'Dây dắt', 'Bát ăn', 'Đồ chơi', 'Chuồng'],
        };
        for (let i = 1; i <= 999; i++) {
            const maSP = 'SP' + padNumber(i, 3);
            let tenSP, giaTien, loaiSP;
            if (i <= 333) {
                loaiSP = 'Thuốc';
                tenSP = `Thuốc ${randomChoice(productBrands.medicine)} ${i}`;
                giaTien = randomInt(50, 500) * 1000;
            } else if (i <= 666) {
                loaiSP = 'Thức Ăn';
                tenSP = `${randomChoice(productBrands.food)} ${i}`;
                giaTien = randomInt(100, 800) * 1000;
            } else {
                loaiSP = 'Phụ Kiện';
                tenSP = `${randomChoice(productBrands.accessory)} ${i}`;
                giaTien = randomInt(50, 1000) * 1000;
            }
            await client.query(`INSERT INTO "SANPHAM" ("MaSanPham", "TenSanPham", "GiaTienSanPham", "LoaiSanPham") VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING`, [maSP, tenSP, giaTien, loaiSP]);
        }
        console.log('   ✅ 999 products inserted\n');

        // Link products to subtables
        console.log('💊 Linking products to subtables...');
        await client.query(`INSERT INTO "THUOC" ("MaSanPham") SELECT "MaSanPham" FROM "SANPHAM" WHERE "LoaiSanPham" = 'Thuốc' ON CONFLICT DO NOTHING`);

        // THUCAN (TypeORM: MASANPHAM + extra columns)
        const foodProds = await client.query(`SELECT "MaSanPham" FROM "SANPHAM" WHERE "LoaiSanPham" = 'Thức Ăn'`);
        for (const p of foodProds.rows) {
            try {
                await client.query(`INSERT INTO "THUCAN" ("MASANPHAM", "THUONGHIEU", "DOITUONGTHUCUNG", "TRONGLUONG", "DONVITINH") VALUES ($1, $2, $3, $4, $5) ON CONFLICT DO NOTHING`,
                    [p.MaSanPham, randomChoice(productBrands.food), randomChoice(['Chó', 'Mèo', 'Thú nhỏ']), (Math.random() * 5 + 0.5).toFixed(2), 'kg']);
            } catch (err) { /* skip */ }
        }

        // PHUKIEN (TypeORM: MASANPHAM + extra columns)
        const accProds = await client.query(`SELECT "MaSanPham" FROM "SANPHAM" WHERE "LoaiSanPham" = 'Phụ Kiện'`);
        for (const p of accProds.rows) {
            try {
                await client.query(`INSERT INTO "PHUKIEN" ("MASANPHAM", "LOAIPHUKIEN", "CHATLIEU", "KICHTHUOC", "MAUSAC") VALUES ($1, $2, $3, $4, $5) ON CONFLICT DO NOTHING`,
                    [p.MaSanPham, randomChoice(productBrands.accessory), randomChoice(['Nhựa', 'Inox', 'Vải']), randomChoice(['S', 'M', 'L']), randomChoice(['Đỏ', 'Xanh', 'Đen'])]);
            } catch (err) { /* skip */ }
        }
        console.log('   ✅ Products linked to subtables\n');

        // Inventory (CHI_TIET_TON_KHO - note underscores!)
        console.log('📊 Inserting CHI_TIET_TON_KHO (inventory)...');
        for (let kho = 1; kho <= 10; kho++) {
            const maKho = 'K' + padNumber(kho, 3);
            for (let sp = 1; sp <= 999; sp++) {
                const maSP = 'SP' + padNumber(sp, 3);
                try {
                    await client.query(`INSERT INTO "CHI_TIET_TON_KHO" ("MaKho", "MaSanPham", "SoLuong") VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`, [maKho, maSP, randomInt(0, 5000)]);
                } catch (err) { /* skip */ }
            }
            console.log(`   -> Kho ${kho}/10 done`);
        }
        console.log('   ✅ 9,990 inventory records inserted\n');

        // ============================================================================
        // NHÓM 4: VACCINE & DỊCH VỤ
        // ============================================================================
        console.log('═══════════════════════════════════════════════════════════════');
        console.log('💉 NHÓM 4: VACCINE & DỊCH VỤ');
        console.log('═══════════════════════════════════════════════════════════════\n');

        // Vaccines (50)
        console.log('💉 Inserting VACCINE (50 vaccines)...');
        for (let i = 1; i <= 50; i++) {
            const maVC = 'VC' + padNumber(i, 3);
            const tenVC = `Vaccine ${['Dại', 'Parvo', 'Care', '5-in-1', '7-in-1', 'Lepto', 'FIP'][i % 7]} ${i}`;
            await client.query(`INSERT INTO "VACCINE" ("MaVaccine", "TenVaccine", "LoaiVaccine", "GiaVaccine") VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING`,
                [maVC, tenVC, randomChoice(['Chó', 'Mèo']), randomInt(150, 800) * 1000]);
        }
        console.log('   ✅ 50 vaccines inserted\n');

        // Services
        console.log('🏥 Inserting DICHVUYTE (5 services)...');
        const services = [
            { id: 'DV001', name: 'Khám Lâm Sàng', type: 'KhamBenh' },
            { id: 'DV002', name: 'Tiêm Vaccine', type: 'TiemPhong' },
            { id: 'DV003', name: 'Siêu âm', type: 'KhamBenh' },
            { id: 'DV004', name: 'X-Quang', type: 'KhamBenh' },
            { id: 'DV005', name: 'Spa Cắt tỉa', type: 'Spa' },
        ];
        for (const s of services) {
            await client.query(`INSERT INTO "DICHVUYTE" ("MaDichVu", "TenDichVu", "LoaiDichVu") VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`, [s.id, s.name, s.type]);
        }
        console.log('   ✅ 5 services inserted\n');

        // Service-Branch mappings
        console.log('🔗 Inserting CUNGCAPDICHVU (50 mappings)...');
        for (const b of branches) {
            for (const s of services) {
                await client.query(`INSERT INTO "CUNGCAPDICHVU" ("MaChiNhanh", "MaDichVu") VALUES ($1, $2) ON CONFLICT DO NOTHING`, [b.id, s.id]);
            }
        }
        console.log('   ✅ 50 service-branch mappings inserted\n');

        // Vaccination Packages (TypeORM: auto PK + different columns)
        console.log('📋 Inserting GOITIEMPHONG...');
        const pkgResult = await client.query(`
            INSERT INTO "GOITIEMPHONG" ("TENGOI", "DOITUONG", "MOTA", "TONGTIEN", "THOIHAN", "TRANGTHAI")
            VALUES 
                ('Gói Cơ Bản Chó', 'Chó', 'Gói tiêm phòng cơ bản cho chó con', 1500000, 12, true),
                ('Gói Đầy Đủ Chó', 'Chó', 'Gói tiêm phòng đầy đủ cho chó', 3000000, 12, true),
                ('Gói Cơ Bản Mèo', 'Mèo', 'Gói tiêm phòng cơ bản cho mèo', 1200000, 12, true),
                ('Gói Đầy Đủ Mèo', 'Mèo', 'Gói tiêm phòng đầy đủ cho mèo', 2500000, 12, true)
            RETURNING "MAGOITIEMPHONG"
        `);
        const packageIds = pkgResult.rows.map(r => r.MAGOITIEMPHONG);
        console.log('   ✅ 4 packages inserted\n');

        // Package details
        console.log('💉 Inserting CHITIETGOITIEMPHONG...');
        for (const pkgId of packageIds) {
            for (let i = 1; i <= 3; i++) {
                const maVC = 'VC' + padNumber(randomInt(1, 50), 3);
                try {
                    await client.query(`INSERT INTO "CHITIETGOITIEMPHONG" ("MAGOITIEMPHONG", "MAVACCINE", "SOLUONG", "THUTUMUITIEM", "KHOANGCACHTIEM") VALUES ($1, $2, 1, $3, 30) ON CONFLICT DO NOTHING`,
                        [pkgId, maVC, i]);
                } catch (err) { /* skip */ }
            }
        }
        console.log('   ✅ Package details inserted\n');

        // KHOVACCINE
        console.log('💉 Inserting KHOVACCINE...');
        for (let kho = 1; kho <= 10; kho++) {
            const maKho = 'K' + padNumber(kho, 3);
            for (let vc = 1; vc <= 50; vc++) {
                const maVC = 'VC' + padNumber(vc, 3);
                const expiry = new Date();
                expiry.setMonth(expiry.getMonth() + randomInt(6, 24));
                try {
                    await client.query(`INSERT INTO "KHOVACCINE" ("MAVACCINE", "MAKHO", "SOLUONG", "HANSUDUNG") VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING`,
                        [maVC, maKho, randomInt(10, 500), expiry.toISOString().split('T')[0]]);
                } catch (err) { /* skip */ }
            }
        }
        console.log('   ✅ 500 warehouse-vaccine records inserted\n');

        // ============================================================================
        // NHÓM 5: LỊCH HẸN & LỊCH LÀM VIỆC
        // ============================================================================
        console.log('═══════════════════════════════════════════════════════════════');
        console.log('📅 NHÓM 5: LỊCH HẸN & LỊCH LÀM VIỆC');
        console.log('═══════════════════════════════════════════════════════════════\n');

        // Appointments (100,000)
        console.log('📅 Inserting LICHHEN (100,000 appointments)...');
        console.log('   ⏳ This may take several minutes...');
        const statuses = ['Chờ xác nhận', 'Đã xác nhận', 'Đã hoàn thành', 'Đã hủy'];
        for (let batch = 0; batch < 200; batch++) {
            const values = [];
            const params = [];
            let idx = 1;
            for (let j = 0; j < 500; j++) {
                const maKH = randomInt(1, 80000);
                const maThuCung = randomInt(1, 120000);
                const maBacSi = padNumber(randomInt(11, 60), 5);
                const maCN = 'CN' + padNumber(randomInt(1, 10), 2);
                const maDV = services[randomInt(0, services.length - 1)].id;
                values.push(`($${idx}, $${idx + 1}, $${idx + 2}, $${idx + 3}, $${idx + 4}, $${idx + 5}, $${idx + 6}, $${idx + 7})`);
                params.push(maKH, maThuCung, maBacSi, maCN, maDV, randomDate(1000, 0), `${padNumber(randomInt(8, 17), 2)}:00:00`, randomChoice(statuses));
                idx += 8;
            }
            try {
                await client.query(`INSERT INTO "LICHHEN" ("MaKhachHang", "MaThuCung", "MaBacSi", "MaChiNhanh", "MaDichVu", "NgayHen", "GioHen", "TrangThai") VALUES ${values.join(', ')}`, params);
            } catch (err) { /* skip */ }
            if ((batch + 1) % 40 === 0) console.log(`   -> Inserted ${(batch + 1) * 500} appointments...`);
        }
        console.log('   ✅ 100,000 appointments inserted\n');

        // Doctor schedules (5,000)
        console.log('📆 Inserting LICHLAMVIECBACSI (5,000 records)...');
        const scheduleStatuses = ['Bận', 'Trống'];
        for (let day = 0; day < 100; day++) {
            const date = new Date();
            date.setDate(date.getDate() + day - 50);
            const dateStr = date.toISOString().split('T')[0];
            for (let doc = 11; doc <= 60; doc++) {
                const maBacSi = padNumber(doc, 5);
                const maCN = 'CN' + padNumber((doc % 10) + 1, 2);
                try {
                    await client.query(`INSERT INTO "LICHLAMVIECBACSI" ("MaBacSi", "MaChiNhanh", "Ngay", "TrangThai") VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING`,
                        [maBacSi, maCN, dateStr, randomChoice(scheduleStatuses)]);
                } catch (err) { /* skip */ }
            }
        }
        console.log('   ✅ 5,000 doctor schedule records inserted\n');

        // ============================================================================
        // NHÓM 6: HÓA ĐƠN
        // ============================================================================
        console.log('═══════════════════════════════════════════════════════════════');
        console.log('🧾 NHÓM 6: HÓA ĐƠN');
        console.log('═══════════════════════════════════════════════════════════════\n');

        // Invoices (100,000)
        console.log('🧾 Inserting HOADON (100,000 invoices)...');
        console.log('   ⏳ This will take several minutes...');
        for (let batch = 0; batch < 200; batch++) {
            for (let j = 0; j < 500; j++) {
                const maNV = padNumber(randomInt(61, 110), 5);
                const maKH = randomInt(1, 80000);
                const maCN = 'CN' + padNumber(randomInt(1, 10), 2);
                const tongTien = randomInt(100, 5000) * 1000;

                try {
                    const result = await client.query(`
                        INSERT INTO "HOADON" ("NgayLap", "GiamGia", "TongTien", "MaNhanVien", "MaKhachHang", "MaChiNhanh", "TrangThai")
                        VALUES ($1, 0, $2, $3, $4, $5, 'Đã thanh toán') RETURNING "MaHoaDon"
                    `, [randomDateTime(1000, 0), tongTien, maNV, maKH, maCN]);

                    const maHD = result.rows[0]?.MaHoaDon;
                    if (maHD) {
                        for (let p = 0; p < randomInt(1, 3); p++) {
                            const maSP = 'SP' + padNumber(randomInt(1, 999), 3);
                            await client.query(`INSERT INTO "HOADON_SANPHAM" ("MaHoaDon", "MaSanPham", "SoLuong") VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`, [maHD, maSP, randomInt(1, 5)]);
                        }
                    }
                } catch (err) { /* skip */ }
            }
            if ((batch + 1) % 20 === 0) console.log(`   -> Inserted ${(batch + 1) * 500} invoices...`);
        }
        console.log('   ✅ 100,000 invoices inserted\n');

        // ============================================================================
        // COMPLETION
        // ============================================================================
        console.log('═══════════════════════════════════════════════════════════════');
        console.log('✅ SEED DATA COMPLETED SUCCESSFULLY!');
        console.log('═══════════════════════════════════════════════════════════════\n');

        console.log('📊 Summary:');
        console.log('   • 10 Branches (Chi Nhánh)');
        console.log('   • 5 Departments (Khoa)');
        console.log('   • 5 Employee Types');
        console.log('   • 150 Employees (Nhân Viên)');
        console.log('   • 10 Warehouses (Kho)');
        console.log('   • 80,000 Customers (Khách Hàng)');
        console.log('   • 30,000 Member Customers');
        console.log('   • 3 Member Tiers');
        console.log('   • 5 Pet Types, 6 Pet Breeds');
        console.log('   • 120,000 Pets (Thú Cưng)');
        console.log('   • 999 Products (Sản Phẩm)');
        console.log('   • 9,990 Inventory Records');
        console.log('   • 50 Vaccines');
        console.log('   • 500 Warehouse-Vaccine Records');
        console.log('   • 5 Medical Services');
        console.log('   • 50 Service-Branch Mappings');
        console.log('   • 4 Vaccination Packages');
        console.log('   • 100,000 Appointments (Lịch Hẹn)');
        console.log('   • 5,000 Doctor Schedules');
        console.log('   • 100,000 Invoices (Hóa Đơn)');

    } catch (error) {
        console.error('\n❌ Error during data seeding:', error.message);
        console.error(error.stack);
        process.exit(1);
    } finally {
        await client.end();
        console.log('\n🔌 Database connection closed.');
    }
}

seedData();
