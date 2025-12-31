USE PetCare_X;
GO 
SET NOCOUNT ON;

PRINT '=== BẮT ĐẦU SINH DỮ LIỆU ===';

-- ============================================================================
-- NHÓM 1: CƠ CẤU TỔ CHỨC & NHÂN SỰ
-- ============================================================================

PRINT '1. Insert CHINHANH...';

INSERT INTO CHINHANH (MaChiNhanh, TenChiNhanh, DiaChi, SDT, ThoiGianMoCua, ThoiGianDongCua, MaQuanLy) VALUES 
('CN01', N'PetCareX Hà Nội', N'15 Tràng Tiền, P. Tràng Tiền, TP. Hà Nội', '0901000001', '08:00:00', '22:00:00', NULL),
('CN02', N'PetCareX Hải Phòng', N'20 Lạch Tray, P. Lạch Tray, TP. Hải Phòng', '0901000002', '08:00:00', '22:00:00', NULL),
('CN03', N'PetCareX Quảng Ninh', N'50 Lê Thánh Tông, P. Hồng Gai, Tỉnh Quảng Ninh', '0901000003', '08:00:00', '22:00:00', NULL),
('CN04', N'PetCareX Nghệ An', N'10 Quang Trung, P. Quang Trung, Tỉnh Nghệ An', '0901000004', '08:00:00', '22:00:00', NULL),
('CN05', N'PetCareX Huế', N'15 Lê Lợi, P. Vĩnh Ninh, TP. Huế', '0901000005', '08:00:00', '22:00:00', NULL),
('CN06', N'PetCareX Đà Nẵng', N'200 Bạch Đằng, P. Phước Ninh, TP. Đà Nẵng', '0901000006', '08:00:00', '22:00:00', NULL),
('CN07', N'PetCareX Nha Trang', N'78 Trần Phú, P. Lộc Thọ, Tỉnh Khánh Hòa', '0901000007', '08:00:00', '22:00:00', NULL),
('CN08', N'PetCareX Đà Lạt', N'01 Lê Đại Hành, P. 1, Tỉnh Lâm Đồng', '0901000008', '08:00:00', '22:00:00', NULL),
('CN09', N'PetCareX Hồ Chí Minh', N'68 Nguyễn Huệ, P. Bến Nghé, TP. Hồ Chí Minh', '0901000009', '08:00:00', '22:00:00', NULL),
('CN10', N'PetCareX Cần Thơ', N'50 Đường 30/4, P. An Phú, TP. Cần Thơ', '0901000010', '08:00:00', '22:00:00', NULL);

GO

PRINT '2. Insert KHOA...';
INSERT INTO KHOA (MaKhoa, TenKhoa, TruongKhoa) VALUES 
('01', N'Khoa Nội', NULL), ('02', N'Khoa Ngoại', NULL), ('03', N'Da Liễu', NULL), ('04', N'CĐ Hình ảnh', NULL), ('05', N'Cấp cứu', NULL);

GO

PRINT '3. Insert LOAINHANVIEN_LUONG...';
INSERT INTO LOAINHANVIEN_LUONG (LoaiNhanVien, Luong) VALUES 
('QuanLy', 25000000), ('BacSi', 18000000), ('TiepTan', 8000000), ('Kho', 7000000), ('TapVu', 6000000);

GO

PRINT '4. Insert NHANVIEN...';

DECLARE @i INT = 1;
DECLARE @Ho NVARCHAR(20), @Dem NVARCHAR(20), @Ten NVARCHAR(20);
DECLARE @Fullname NVARCHAR(50);
DECLARE @SDT_Dau CHAR(3);
DECLARE @SDT_Duoi CHAR(7);
DECLARE @MaCN CHAR(4);
DECLARE @LoaiNV NVARCHAR(20);
DECLARE @MaKhoa CHAR(2);

WHILE @i <= 150
BEGIN
    -- 1. Logic Phân bổ Chi nhánh & Loại NV
    SET @MaCN = 'CN' + RIGHT('00' + CAST(((@i % 10) + 1) AS VARCHAR), 2);
    
    SET @LoaiNV = CASE 
        WHEN @i <= 10 THEN 'QuanLy' 
        WHEN @i <= 60 THEN 'BacSi' 
        WHEN @i <= 110 THEN 'TiepTan' 
        ELSE 'Kho' END;
    
    SET @MaKhoa = NULL;
    IF @LoaiNV = 'BacSi' SET @MaKhoa = RIGHT('00' + CAST(((@i % 5) + 1) AS VARCHAR), 2);

    -- 2. SINH TÊN (Dùng cách SELECT FROM VALUES để không bao giờ bị NULL)
    
    -- Random Họ
    SELECT TOP 1 @Ho = Ho FROM (VALUES 
        (N'Nguyễn'), (N'Trần'), (N'Lê'), (N'Phạm'), (N'Huỳnh'), (N'Hoàng'), (N'Phan'), (N'Vũ'), (N'Võ'), (N'Đặng'), 
        (N'Bùi'), (N'Đỗ'), (N'Hồ'), (N'Ngô'), (N'Dương'), (N'Lý')
    ) AS A(Ho) ORDER BY NEWID();

    -- Random Đệm
    SELECT TOP 1 @Dem = Dem FROM (VALUES 
        (N'Văn'), (N'Thị'), (N'Minh'), (N'Ngọc'), (N'Thanh'), (N'Quốc'), (N'Đức'), (N'Hữu'), (N'Mỹ'), (N'Xuân'), (N'Gia'), (N'Bảo')
    ) AS A(Dem) ORDER BY NEWID();

    -- Random Tên
    SELECT TOP 1 @Ten = Ten FROM (VALUES 
        (N'Hùng'), (N'Dũng'), (N'Lan'), (N'Hương'), (N'Tuấn'), (N'Kiệt'), (N'Vy'), (N'Trân'), (N'Phúc'), (N'Lộc'), 
        (N'Thảo'), (N'Tâm'), (N'Anh'), (N'Khang'), (N'Châu'), (N'Quỳnh'), (N'Nhung'), (N'Huy'), (N'Tú'), (N'Giang')
    ) AS A(Ten) ORDER BY NEWID();

    -- Ghép tên (Sử dụng ISNULL để chặn mọi trường hợp xấu nhất)
    SET @Fullname = ISNULL(@Ho, N'Nguyễn') + ' ' + ISNULL(@Dem, N'Văn') + ' ' + ISNULL(@Ten, N'A');

    -- 3. SINH SỐ ĐIỆN THOẠI
    -- Random đầu số
    SELECT TOP 1 @SDT_Dau = DauSo FROM (VALUES 
        ('090'), ('091'), ('098'), ('032'), ('070'), ('089'), ('093')
    ) AS A(DauSo) ORDER BY NEWID();
    
    -- Random đuôi số (Đảm bảo đủ 7 ký tự)
    SET @SDT_Duoi = RIGHT('0000000' + CAST(ABS(CHECKSUM(NEWID())) % 10000000 AS VARCHAR), 7);

    -- 4. INSERT VÀO BẢNG
    INSERT INTO NHANVIEN (MaNhanVien, HoTen, NgayVaoLam, NgaySinh, SDT, MaChiNhanh, LoaiNhanVien, MaKhoa)
    VALUES (
        RIGHT('00000' + CAST(@i AS VARCHAR(5)), 5), 
        @Fullname, 
        DATEADD(DAY, -CAST(RAND()*1500 AS INT), GETDATE()), 
        DATEADD(YEAR, -CAST((RAND()*20 + 22) AS INT), GETDATE()), 
        @SDT_Dau + @SDT_Duoi, 
        @MaCN, @LoaiNV, @MaKhoa
    );
    
    SET @i = @i + 1;
END;

GO

-- Update lại MaQuanLy và TruongKhoa sau khi đã có dữ liệu nhân viên
UPDATE CHINHANH SET MaQuanLy = (SELECT TOP 1 MaNhanVien FROM NHANVIEN WHERE MaChiNhanh = CHINHANH.MaChiNhanh AND LoaiNhanVien = 'QuanLy');
UPDATE KHOA SET TruongKhoa = (SELECT TOP 1 MaNhanVien FROM NHANVIEN WHERE MaKhoa = KHOA.MaKhoa AND LoaiNhanVien = 'BacSi');

GO

PRINT '5. Insert KHO...';
INSERT INTO KHO (MaKho, NhanVienPhuTrach)
SELECT 
    'K' + RIGHT('00' + SUBSTRING(MaChiNhanh, 3, 2), 3),
    (SELECT TOP 1 MaNhanVien FROM NHANVIEN WHERE MaChiNhanh = CN.MaChiNhanh AND LoaiNhanVien='Kho') 
FROM CHINHANH CN;

GO


PRINT '6. Insert LICHLAMVIECBACSI...';
DECLARE @DayCount INT = 0;
WHILE @DayCount < 100
BEGIN
    INSERT INTO LICHLAMVIECBACSI (MaBacSi, MaChiNhanh, Ngay, TrangThai)
    SELECT 
        MaNhanVien, MaChiNhanh, DATEADD(DAY, @DayCount, '2025-01-01'), 
        CASE WHEN (ABS(CHECKSUM(NEWID())) % 2) = 0 THEN N'Bận' ELSE N'Trống' END
    FROM NHANVIEN WHERE LoaiNhanVien = 'BacSi';
    SET @DayCount = @DayCount + 1;
END;

GO

-- ============================================================================
-- NHÓM 2: KHÁCH HÀNG & THÚ CƯNG
-- ============================================================================

-- 7. KHACHHANG (TĂNG LÊN 80.000)
PRINT '7. Insert KHACHHANG...';

DECLARE @i INT = 1;
DECLARE @Ho NVARCHAR(20), @Dem NVARCHAR(20), @Ten NVARCHAR(20);
DECLARE @Fullname NVARCHAR(50);
DECLARE @SDT_Dau CHAR(3);
DECLARE @SDT_Duoi CHAR(7);

WHILE @i <= 80000
BEGIN
    -- 1. SINH HỌ TÊN NGẪU NHIÊN
    
    -- Random Họ (Mở rộng danh sách họ phổ biến VN)
    SELECT TOP 1 @Ho = Ho FROM (VALUES 
        (N'Nguyễn'), (N'Trần'), (N'Lê'), (N'Phạm'), (N'Huỳnh'), (N'Hoàng'), (N'Phan'), (N'Vũ'), (N'Võ'), (N'Đặng'), 
        (N'Bùi'), (N'Đỗ'), (N'Hồ'), (N'Ngô'), (N'Dương'), (N'Lý'), (N'Phí'), (N'Đinh'), (N'Lâm'), (N'Đoàn'),
        (N'Trịnh'), (N'Mai'), (N'Cao'), (N'Lương'), (N'Thái')
    ) AS A(Ho) ORDER BY NEWID();

    -- Random Đệm
    SELECT TOP 1 @Dem = Dem FROM (VALUES 
        (N'Văn'), (N'Thị'), (N'Minh'), (N'Ngọc'), (N'Thanh'), (N'Quốc'), (N'Đức'), (N'Hữu'), (N'Mỹ'), (N'Xuân'), 
        (N'Gia'), (N'Bảo'), (N'Tuấn'), (N'Thùy'), (N'Kim'), (N'Hoài'), (N'Hồng'), (N'Nhật'), (N'Đình')
    ) AS A(Dem) ORDER BY NEWID();

    -- Random Tên
    SELECT TOP 1 @Ten = Ten FROM (VALUES 
        (N'Hùng'), (N'Dũng'), (N'Lan'), (N'Hương'), (N'Tuấn'), (N'Kiệt'), (N'Vy'), (N'Trân'), (N'Phúc'), (N'Lộc'), 
        (N'Thảo'), (N'Tâm'), (N'Anh'), (N'Khang'), (N'Châu'), (N'Quỳnh'), (N'Nhung'), (N'Huy'), (N'Tú'), (N'Giang'),
        (N'Linh'), (N'Chi'), (N'Khánh'), (N'My'), (N'Ngân'), (N'Yến'), (N'Trang'), (N'Vân'), (N'Nam'), (N'Bình')
    ) AS A(Ten) ORDER BY NEWID();

    -- Ghép tên (Có ISNULL dự phòng)
    SET @Fullname = ISNULL(@Ho, N'Nguyễn') + ' ' + ISNULL(@Dem, N'Văn') + ' ' + ISNULL(@Ten, N'A');

    -- 2. SINH SỐ ĐIỆN THOẠI
    -- Random đầu số (Viettel, Vina, Mobi...)
    SELECT TOP 1 @SDT_Dau = DauSo FROM (VALUES 
        ('090'), ('091'), ('098'), ('097'), ('088'), ('086'), ('093'), ('039'), ('079'), ('077')
    ) AS A(DauSo) ORDER BY NEWID();
    
    SET @SDT_Duoi = RIGHT('0000000' + CAST(ABS(CHECKSUM(NEWID())) % 10000000 AS VARCHAR), 7);

    -- 3. INSERT
    INSERT INTO KHACHHANG (HoTen, SoDienThoai) 
    VALUES (@Fullname, @SDT_Dau + @SDT_Duoi);
    
    -- In log mỗi 10.000 dòng
    IF @i % 10000 = 0 PRINT N'-> Đã sinh ' + CAST(@i AS NVARCHAR) + N' khách hàng...';

    SET @i = @i + 1;
END;

GO

PRINT '8. Insert HANGTHANHVIEN...';
INSERT INTO HANGTHANHVIEN (TenHang, GiamGia, DiemTichLuyToiThieu) VALUES (N'VIP', 0.30, 10000000), (N'Thân thiết', 0.20, 5000000), (N'Cơ bản', 0, 0);

GO

-- 9. KHACHHANGTHANHVIEN (Tăng lên 30.000)
PRINT '9. Insert KHACHHANGTHANHVIEN (30k dòng)...';
INSERT INTO KHACHHANGTHANHVIEN (MaKhachHang, Email, GioiTinh, NgaySinh, CCCD, TongChiTieu, TenHang, DiaChi)
SELECT 
    MaKhachHang,
    'user' + CAST(MaKhachHang AS VARCHAR) + '@gmail.com',
    CASE WHEN RAND(CHECKSUM(NEWID())) > 0.5 THEN 'Nam' ELSE N'Nữ' END,
    -- Random ngày sinh (18-60 tuổi)
    DATEADD(DAY, -CAST(RAND(CHECKSUM(NEWID())) * 15000 + 6500 AS INT), GETDATE()),
    -- CCCD Random (12 số)
    RIGHT('000000000000' + CAST(ABS(CHECKSUM(NEWID())) AS VARCHAR) + CAST(ABS(CHECKSUM(NEWID())) AS VARCHAR), 12),
    
    -- Cột Tổng chi tiêu và Tên hạng được lấy từ Subquery bên dưới
    RandomChiTieu,
    CASE 
        WHEN RandomChiTieu < 5000000 THEN N'Cơ bản'
        WHEN RandomChiTieu < 12000000 THEN N'Thân thiết'
        ELSE N'VIP'
    END AS TenHang,
    
    N'TP.HCM'
FROM (
    SELECT TOP 30000 
        MaKhachHang,
        -- Random Tổng chi tiêu từ 1.000.000 đến 20.000.000 VNĐ
        -- Để rải đều khách vào các hạng Cơ bản, Thân thiết và VIP
        (CAST(ABS(CHECKSUM(NEWID())) % 190 + 10 AS INT) * 100000) AS RandomChiTieu
    FROM KHACHHANG
    ORDER BY NEWID()
) AS DataNguon;

GO

PRINT '10. Insert LOAITHUCUNG...';
INSERT INTO LOAITHUCUNG (MaLoaiThuCung, TenLoaiThuCung) VALUES ('01', N'Chó'), ('02', N'Mèo'), ('03', N'Hamster'), ('04', N'Thỏ'), ('05', N'Chim');

GO

PRINT '11. Insert CHUNGLOAITHUCUNG...';
INSERT INTO CHUNGLOAITHUCUNG (MaChungLoaiThuCung, TenChungLoaiThuCung, MaLoaiThuCung) VALUES 
('01', N'Husky', '01'), ('02', N'Corgi', '01'), ('03', N'Poodle', '01'), ('04', N'Mèo Anh', '02'), ('05', N'Mèo Ba Tư', '02'), ('06', N'W.White', '03');

GO

-- 12. THUCUNG (TĂNG LÊN 120.000)
PRINT '12. Insert THUCUNG...';

DECLARE @i INT = 1;
DECLARE @TenPet NVARCHAR(20);
DECLARE @BaseName NVARCHAR(15); -- Tên gốc
DECLARE @Suffix NVARCHAR(10);   -- Hậu tố (Adjective/Số)
DECLARE @RandomDate DATE;
DECLARE @MaKhachHang INT;
DECLARE @MaChungLoai CHAR(2);

WHILE @i <= 120000
BEGIN
    -- 1. SINH TÊN THÚ CƯNG ĐA DẠNG (KHÔNG NULL)
    
    -- Bước A: Random Tên Gốc (Mở rộng thêm tên Tiếng Anh cho phong phú)
    SELECT TOP 1 @BaseName = Ten FROM (VALUES 
        (N'Milu'), (N'Kiki'), (N'Lu'), (N'Misa'), (N'Bông'), (N'Mực'), (N'Vàng'), (N'Cọp'), (N'Đen'), (N'Xoài'), 
        (N'Mận'), (N'Kem'), (N'Bơ'), (N'Sữa'), (N'Cafe'), (N'Mập'), (N'Lùn'), (N'Hổ'), (N'Báo'), (N'Gấu'),
        (N'Bim'), (N'Bon'), (N'Tôm'), (N'Tép'), (N'Cam'), (N'Quýt'), (N'Na'), (N'Miu'), (N'Mun'), (N'Vằn'),
        (N'Rex'), (N'Bella'), (N'Charlie'), (N'Luna'), (N'Lucy'), (N'Max'), (N'Bailey'), (N'Cooper'), (N'Daisy'), (N'Rocky')
    ) AS A(Ten) ORDER BY NEWID();

    -- Bước B: Random Hậu tố (Để tạo sự khác biệt)
    -- Tỉ lệ: 40% chỉ lấy tên gốc, 60% sẽ ghép thêm hậu tố (Ví dụ: "Nhỏ", "Béo", "01", "VIP"...)
    IF RAND() < 0.4
    BEGIN
        SET @TenPet = @BaseName;
    END
    ELSE
    BEGIN
        SELECT TOP 1 @Suffix = HauTo FROM (VALUES 
            (N' Nhỏ'), (N' Béo'), (N' Còi'), (N' Xinh'), (N' Đại'), (N' Ú'), (N' Xù'), (N' Hôi'), (N' Lỳ'), (N' Ngốc'),
            (N' 01'), (N' 02'), (N' 03'), (N' 04'), (N' 05'), (N' Pro'), (N' VIP'), (N' Cute'), (N' Lười'), (N' Lucky')
        ) AS B(HauTo) ORDER BY NEWID();
        
        -- Ghép lại: "Milu" + " Béo" = "Milu Béo"
        SET @TenPet = @BaseName + @Suffix;
    END

    -- Bước C: Cắt chuỗi an toàn (Chặn mọi trường hợp lố 20 ký tự)
    SET @TenPet = LEFT(@TenPet, 20);

    -- 2. SINH NGÀY SINH (Giữ nguyên logic của bạn)
    SET @RandomDate = DATEADD(DAY, -CAST(RAND()*2900 AS INT), GETDATE());

    -- 3. MÃ KHÁCH HÀNG (Logic toán học nhanh, khớp với dữ liệu 1-80.000 đã tạo)
    SET @MaKhachHang = CAST(RAND() * 80000 AS INT) + 1;

    -- 4. CHỦNG LOÀI (Giữ nguyên logic)
    SET @MaChungLoai = RIGHT('00' + CAST((CAST(RAND()*6 AS INT) + 1) AS VARCHAR), 2);

    -- 5. INSERT
    INSERT INTO THUCUNG (TenThuCung, NgaySinhThuCung, MaKhachHang, MaChungLoai)
    VALUES (@TenPet, @RandomDate, @MaKhachHang, @MaChungLoai);
    
    -- Log tiến độ
    IF @i % 20000 = 0 PRINT N'-> Đã sinh ' + CAST(@i AS NVARCHAR) + N' thú cưng...';

    SET @i = @i + 1;
END;

GO

PRINT '13. Insert LICHHEN...';
INSERT INTO LICHHEN (MaKhachHang, MaThuCung, MaBacSi, NgayHen, GioHen, TrangThai)
SELECT TOP 100000 
    T.MaKhachHang, 
    T.MaThuCung,
    -- Random Bác sĩ (ID từ 00011 đến 00060 theo logic tạo nhân viên ở mục 4)
    -- Công thức: '000' + (Random từ 11 đến 60)
    RIGHT('00000' + CAST((ABS(CHECKSUM(NEWID())) % 50 + 11) AS VARCHAR), 5),
    
    -- Random Ngày hẹn (Trong vòng 1000 ngày qua)
    DATEADD(DAY, -CAST(ABS(CHECKSUM(NEWID())) % 1000 AS INT), GETDATE()),
    
    -- Random Giờ hẹn (Từ 8h đến 17h)
    CAST(DATEADD(HOUR, ABS(CHECKSUM(NEWID())) % 9 + 8, 0) AS TIME(0)),
    
    -- Random Trạng thái
    CASE ABS(CHECKSUM(NEWID())) % 3
        WHEN 0 THEN N'Đã hoàn thành'
        WHEN 1 THEN N'Đã hủy'
        ELSE N'Chờ khám'
    END
FROM THUCUNG T
ORDER BY NEWID();

GO

-- ============================================================================
-- NHÓM 3: SẢN PHẨM & KHO
-- ============================================================================

PRINT '14. Insert SANPHAM...';

DECLARE @i INT = 1;
DECLARE @MaSP CHAR(5);
DECLARE @TenSP NVARCHAR(100);
DECLARE @GiaTien DECIMAL(18,0);
DECLARE @LoaiSP NVARCHAR(20);
DECLARE @Part1 NVARCHAR(30), @Part2 NVARCHAR(30), @Part3 NVARCHAR(30);

WHILE @i <= 999 
BEGIN
    -- 1. XÁC ĐỊNH MÃ SP VÀ LOẠI SP (Tiếng Việt có dấu)
    SET @MaSP = 'SP' + RIGHT('000' + CAST(@i AS VARCHAR), 3);
    
    -- Chia đều 3 loại theo số dư
    IF @i % 3 = 0 SET @LoaiSP = N'Thuốc';
    ELSE IF @i % 3 = 1 SET @LoaiSP = N'Thức Ăn';
    ELSE SET @LoaiSP = N'Phụ Kiện';

    -- 2. SINH TÊN SẢN PHẨM (Dùng VALUES để chống NULL)
    IF @LoaiSP = N'Thức Ăn'
    BEGIN
        -- Part 1: Thương hiệu
        SELECT TOP 1 @Part1 = V FROM (VALUES (N'Royal Canin'), (N'Whiskas'), (N'Pedigree'), (N'Me-O'), (N'SmartHeart'), (N'Ganador'), (N'Nutrience')) A(V) ORDER BY NEWID();
        -- Part 2: Loại
        SELECT TOP 1 @Part2 = V FROM (VALUES (N'Hạt khô'), (N'Pate'), (N'Sốt'), (N'Bánh thưởng'), (N'Súp thưởng'), (N'Thịt sấy')) A(V) ORDER BY NEWID();
        -- Part 3: Vị/Đặc điểm
        SELECT TOP 1 @Part3 = V FROM (VALUES (N'Vị Gà'), (N'Vị Bò'), (N'Vị Cá Ngừ'), (N'Cho Chó Con'), (N'Cho Mèo Lớn'), (N'Dưỡng Lông'), (N'Hải Sản')) A(V) ORDER BY NEWID();
        
        SET @TenSP = @Part1 + N' - ' + @Part2 + N' ' + @Part3;
        SET @GiaTien = (CAST(RAND()*100 AS INT) + 20) * 5000; 
    END
    ELSE IF @LoaiSP = N'Thuốc'
    BEGIN
        -- Part 1: Dạng
        SELECT TOP 1 @Part1 = V FROM (VALUES (N'Viên nhai'), (N'Dung dịch'), (N'Thuốc nhỏ'), (N'Gel'), (N'Xịt'), (N'Kem bôi')) A(V) ORDER BY NEWID();
        -- Part 2: Công dụng
        SELECT TOP 1 @Part2 = V FROM (VALUES (N'Trị ve rận'), (N'Tẩy giun'), (N'Trị nấm da'), (N'Bổ sung Canxi'), (N'Hỗ trợ tiêu hóa'), (N'Sát trùng'), (N'Giảm đau')) A(V) ORDER BY NEWID();
        -- Part 3: Thương hiệu
        SELECT TOP 1 @Part3 = V FROM (VALUES (N'NexGard'), (N'Bravecto'), (N'Bio-Pharm'), (N'Frontline'), (N'Vime-Blue'), (N'Advantage')) A(V) ORDER BY NEWID();

        SET @TenSP = @Part1 + N' ' + @Part2 + N' ' + @Part3;
        SET @GiaTien = (CAST(RAND()*50 AS INT) + 10) * 5000;
    END
    ELSE -- Phụ Kiện
    BEGIN
        -- Part 1: Vật dụng
        SELECT TOP 1 @Part1 = V FROM (VALUES (N'Vòng cổ'), (N'Dây dắt'), (N'Bát ăn'), (N'Chuồng'), (N'Đệm nằm'), (N'Đồ chơi'), (N'Cát vệ sinh'), (N'Lược chải'), (N'Ba lô')) A(V) ORDER BY NEWID();
        -- Part 2: Tính năng
        SELECT TOP 1 @Part2 = V FROM (VALUES (N'Inox'), (N'Nhựa cao cấp'), (N'Vải Cotton'), (N'Phản quang'), (N'Tự động'), (N'Hình xương'), (N'Gỗ thông')) A(V) ORDER BY NEWID();
        -- Part 3: Size/Đối tượng
        SELECT TOP 1 @Part3 = V FROM (VALUES (N'Cho Chó'), (N'Cho Mèo'), (N'Size L'), (N'Size S'), (N'Size M'), (N'Đa năng')) A(V) ORDER BY NEWID();

        SET @TenSP = @Part1 + N' ' + @Part2 + N' (' + @Part3 + N')';
        SET @GiaTien = (CAST(RAND()*80 AS INT) + 10) * 5000;
    END

    -- 3. INSERT
    INSERT INTO SANPHAM (MaSanPham, TenSanPham, GiaTienSanPham, LoaiSanPham)
    VALUES (@MaSP, @TenSP, @GiaTien, @LoaiSP);

    SET @i = @i + 1;
END;

GO

PRINT '15-18. Đưa các sản phẩm vào các bảng cụ thể...';

-- Lưu ý: Điều kiện WHERE bây giờ phải dùng N'...' và đúng từ khóa tiếng Việt
INSERT INTO THUOC(MaSanPham) 
SELECT MaSanPham FROM SANPHAM WHERE LoaiSanPham = N'Thuốc';

GO

INSERT INTO THUCAN(MASANPHAM, THUONGHIEU, DOITUONGTHUCUNG, TRONGLUONG, DONVITINH) 
SELECT MaSanPham, 
    CASE (ABS(CHECKSUM(NEWID())) % 5)
        WHEN 0 THEN N'Royal Canin'
        WHEN 1 THEN N'Whiskas'
        WHEN 2 THEN N'Pedigree'
        WHEN 3 THEN N'Me-O'
        ELSE N'SmartHeart'
    END,
    CASE WHEN ABS(CHECKSUM(NEWID())) % 2 = 0 THEN N'Chó' ELSE N'Mèo' END,
    CAST(ABS(CHECKSUM(NEWID())) % 50 + 1 AS DECIMAL(10,2)) / 10,
    N'kg'
FROM SANPHAM WHERE LoaiSanPham = N'Thức Ăn';

GO

-- Insert Thành phần thức ăn (Using MATHUCAN FK and correct column names)
INSERT INTO THANHPHANTHUCAN (MATHUCAN, TENTHANHPHAN, PHANTRAM)
SELECT 
    T.MATHUCAN,
    Ingredient.TenThanhPhan,
    -- Random phần trăm từ 5% đến 40% cho mỗi thành phần
    CAST(ABS(CHECKSUM(NEWID())) % 35 + 5 AS DECIMAL(5,2))
FROM THUCAN T
CROSS APPLY (
    SELECT TOP 3 TenThanhPhan FROM (VALUES 
        (N'Thịt gà'), (N'Protein'), (N'Gạo lứt'), (N'Vitamin'), 
        (N'Cá ngừ'), (N'Omega-3'), (N'Chất xơ'), (N'Khoáng chất')
    ) AS A(TenThanhPhan) ORDER BY NEWID()
) AS Ingredient;

GO

INSERT INTO PHUKIEN(MASANPHAM, LOAIPHUKIEN, CHATLIEU, KICHTHUOC, MAUSAC) 
SELECT MaSanPham,
    CASE (ABS(CHECKSUM(NEWID())) % 5)
        WHEN 0 THEN N'Vòng cổ'
        WHEN 1 THEN N'Dây dắt'
        WHEN 2 THEN N'Bát ăn'
        WHEN 3 THEN N'Đệm nằm'
        ELSE N'Đồ chơi'
    END,
    CASE (ABS(CHECKSUM(NEWID())) % 3)
        WHEN 0 THEN N'Nhựa cao cấp'
        WHEN 1 THEN N'Vải Cotton'
        ELSE N'Inox'
    END,
    CASE (ABS(CHECKSUM(NEWID())) % 3)
        WHEN 0 THEN N'Size S'
        WHEN 1 THEN N'Size M'
        ELSE N'Size L'
    END,
    CASE (ABS(CHECKSUM(NEWID())) % 4)
        WHEN 0 THEN N'Đỏ'
        WHEN 1 THEN N'Xanh'
        WHEN 2 THEN N'Vàng'
        ELSE N'Hồng'
    END
FROM SANPHAM WHERE LoaiSanPham = N'Phụ Kiện';

GO

PRINT '19. Insert LICHSUGIASANPHAM...';
INSERT INTO LICHSUGIASANPHAM (MaSanPham, NgayBatDau, NgayKetThuc, Gia) 
SELECT 
    MaSanPham, 
    -- Ngày bắt đầu: Cách đây khoảng 1-2 năm
    DATEADD(DAY, -CAST(RAND(CHECKSUM(NEWID())) * 365 + 365 AS INT), GETDATE()), 
    
    -- Ngày kết thúc: Cách đây vài ngày/tháng (đã hết hiệu lực)
    DATEADD(DAY, -CAST(RAND(CHECKSUM(NEWID())) * 300 + 1 AS INT), GETDATE()),
    
    -- GIÁ LỊCH SỬ:
    -- Logic: Giá gốc * (Random từ 0.8 đến 1.2) -> Biến động +/- 20% so với giá hiện tại
    -- Ví dụ: Giá 100k -> Lịch sử có thể là 80k hoặc 120k
    CAST(GiaTienSanPham * (0.8 + (RAND(CHECKSUM(NEWID())) * 0.4)) AS INT)
FROM SANPHAM;
GO


PRINT '20. Insert CHI_TIET_TON_KHO...';
INSERT INTO CHI_TIET_TON_KHO (MaKho, MaSanPham, SoLuong) 
SELECT 
    K.MaKho, 
    S.MaSanPham,
    ABS(CHECKSUM(NEWID())) % 5001
FROM KHO K CROSS JOIN SANPHAM S;

GO

DECLARE @i INT = 1;
DECLARE @MaVC CHAR(5);
DECLARE @TenVC NVARCHAR(20); -- Giới hạn 20 ký tự
DECLARE @LoaiVC NVARCHAR(100); -- Mô tả dài thì để ở cột Loại
DECLARE @GiaVC DECIMAL(18,0);
DECLARE @HangSX NVARCHAR(10);
DECLARE @Benh NVARCHAR(10);
DECLARE @MaLoai CHAR(2);

WHILE @i <= 50
BEGIN
    SET @MaVC = 'VC' + RIGHT('000' + CAST(@i AS VARCHAR), 3);
    
    -- Random Chó (01) hay Mèo (02)
    IF RAND() < 0.7 
    BEGIN
        SET @MaLoai = '01'; -- CHÓ
        
        -- Hãng ngắn gọn (Max 8 ký tự)
        SELECT TOP 1 @HangSX = V FROM (VALUES (N'Nobivac'), (N'Vanguard'), (N'Canigen'), (N'Recomb')) A(V) ORDER BY NEWID();
        
        -- Loại bệnh ngắn gọn (Max 8 ký tự)
        SELECT TOP 1 @Benh = V FROM (VALUES (N'Parvo'), (N'Care'), (N'Dại'), (N'5-in-1'), (N'7-in-1'), (N'Lepto')) A(V) ORDER BY NEWID();

        -- Ghép tên: "Nobivac Parvo" (Tổng tầm 10-15 ký tự -> An toàn)
        SET @TenVC = @HangSX + ' ' + @Benh;
        SET @LoaiVC = N'Vaccine cho Chó - Phòng ' + @Benh;
        
        -- Giá
        IF @Benh LIKE N'%in-1%' SET @GiaVC = 350000; ELSE SET @GiaVC = 150000;
    END
    ELSE 
    BEGIN
        SET @MaLoai = '02'; -- MÈO

        -- Hãng ngắn gọn
        SELECT TOP 1 @HangSX = V FROM (VALUES (N'Rabisin'), (N'Purevax'), (N'Feligen')) A(V) ORDER BY NEWID();

        -- Loại bệnh ngắn gọn
        SELECT TOP 1 @Benh = V FROM (VALUES (N'Dại'), (N'3-in-1'), (N'4-in-1'), (N'FIP'), (N'Giảm BC')) A(V) ORDER BY NEWID();

        -- Ghép tên
        SET @TenVC = @HangSX + ' ' + @Benh;
        SET @LoaiVC = N'Vaccine cho Mèo - Phòng ' + @Benh;

        -- Giá
        IF @Benh LIKE N'%in-1%' SET @GiaVC = 450000; ELSE SET @GiaVC = 200000;
    END

    -- Cắt chuỗi lần cuối để đảm bảo tuyệt đối không lỗi
    SET @TenVC = LEFT(@TenVC, 20);

    -- INSERT
    INSERT INTO VACCINE (MaVaccine, TenVaccine, LoaiVaccine, GiaVaccine)
    VALUES (@MaVC, @TenVC, @LoaiVC, @GiaVC);

    SET @i = @i + 1;
END;

GO

PRINT '22. Insert KHOVACCINE...';
INSERT INTO KHOVACCINE (MAVACCINE, MAKHO, SOLUONG, HANSUDUNG) 
SELECT 
    V.MaVaccine, 
    K.MaKho, 
    ABS(CHECKSUM(NEWID())) % 500 + 10,
    DATEADD(DAY, ABS(CHECKSUM(NEWID())) % 365 + 180, GETDATE())
FROM KHO K CROSS JOIN VACCINE V;

GO

-- ============================================================================
-- NHÓM 4: DỊCH VỤ & GÓI TIÊM PHÒNG
-- ============================================================================

PRINT '23. Insert DICHVUYTE...';
INSERT INTO DICHVUYTE (MaDichVu, TenDichVu, LoaiDichVu) VALUES 
('DV001', N'Dịch vụ Khám Lâm Sàng', N'KhamBenh'), 
('DV002', N'Dịch vụ Tiêm Vaccine', N'TiemPhong'), 
('DV003', N'Dịch vụ Siêu âm', N'KhamBenh'),
('DV004', N'Dịch vụ X-Quang', N'KhamBenh'),
('DV005', N'Dịch vụ Spa Cắt tỉa', N'Spa');

GO

PRINT '24. Insert CUNGCAPDICHVU...';
INSERT INTO CUNGCAPDICHVU (MaChiNhanh, MaDichVu) SELECT C.MaChiNhanh, D.MaDichVu FROM CHINHANH C CROSS JOIN DICHVUYTE D;

GO

PRINT '25. Insert GOITIEMPHONG...';
-- TypeORM schema uses MAGOITIEMPHONG (auto-increment), TENGOI, DOITUONG, TONGTIEN, THOIHAN, TRANGTHAI
INSERT INTO GOITIEMPHONG (TENGOI, DOITUONG, TONGTIEN, THOIHAN, TRANGTHAI) VALUES 
(N'Gói tiêm phòng cơ bản cho Chó', N'Chó', 1000000, 12, 1), 
(N'Gói tiêm phòng đầy đủ cho Chó', N'Chó', 1500000, 12, 1),
(N'Gói tiêm phòng cơ bản cho Mèo', N'Mèo', 800000, 12, 1),
(N'Gói tiêm phòng đầy đủ cho Mèo', N'Mèo', 1200000, 12, 1);

GO

PRINT '26. Insert CHITIETGOITIEMPHONG...';
-- TypeORM schema uses MACHITIET (auto), MAGOITIEMPHONG, MAVACCINE, SOLUONG, THUTUMUITIEM, KHOANGCACHTIEM
INSERT INTO CHITIETGOITIEMPHONG (MAGOITIEMPHONG, MAVACCINE, SOLUONG, THUTUMUITIEM, KHOANGCACHTIEM) VALUES 
(1, 'VC001', 1, 1, 0), (1, 'VC002', 1, 2, 21), (1, 'VC003', 1, 3, 21),
(2, 'VC001', 1, 1, 0), (2, 'VC002', 1, 2, 14), (2, 'VC003', 1, 3, 14), (2, 'VC004', 1, 4, 21),
(3, 'VC010', 1, 1, 0), (3, 'VC011', 1, 2, 21),
(4, 'VC010', 1, 1, 0), (4, 'VC011', 1, 2, 14), (4, 'VC012', 1, 3, 21);

GO

PRINT '27. Insert PHIEUDANGKYTIEMPHONG...';
INSERT INTO PHIEUDANGKYTIEMPHONG (MaKhachHang, MaThuCung, NgayDangKy, MaDichVu) 
SELECT TOP 40000 
    MaKhachHang, 
    MaThuCung, 
    -- Random ngày
    DATEADD(DAY, -CAST(ABS(CHECKSUM(NEWID())) % 365 AS INT), GETDATE()),
    
    -- RANDOM DỊCH VỤ (Thay vì fix cứng 'DV002')
    -- Lấy ngẫu nhiên 1 mã dịch vụ bất kỳ trong bảng DICHVUYTE
    (SELECT TOP 1 MaDichVu FROM DICHVUYTE ORDER BY NEWID())
FROM THUCUNG
ORDER BY NEWID();

GO

PRINT '28. Insert PHIEUDANGKYGOI...';
-- Logic: Lấy 10.000 phiếu bất kỳ để gán vào Gói tiêm
-- Uses: MADANGKYGOI (auto), MADANGKYTIEMPHONG, MAGOITIEMPHONG, NGAYBATDAU, TRANGTHAI
INSERT INTO PHIEUDANGKYGOI (MADANGKYTIEMPHONG, MAGOITIEMPHONG, NGAYBATDAU, TRANGTHAI) 
SELECT TOP 10000 
    MaDangKy, 
    (ABS(CHECKSUM(NEWID())) % 4) + 1,
    DATEADD(DAY, -ABS(CHECKSUM(NEWID())) % 180, GETDATE()),
    N'Đang thực hiện'
FROM PHIEUDANGKYTIEMPHONG
ORDER BY NEWID();

GO

PRINT '29. Insert PHIEUDANGKYLE...';
-- Logic: Những phiếu còn lại là tiêm lẻ
-- Uses: MADANGKYLE (auto), MADANGKYTIEMPHONG, MAVACCINE, SOLUONG, DONGIA, THANHTIEN
INSERT INTO PHIEUDANGKYLE (MADANGKYTIEMPHONG, MAVACCINE, SOLUONG, DONGIA, THANHTIEN) 
SELECT 
    P.MaDangKy, 
    (SELECT TOP 1 MaVaccine FROM VACCINE ORDER BY NEWID()),
    1,
    200000,
    200000
FROM PHIEUDANGKYTIEMPHONG P
WHERE P.MaDangKy NOT IN (SELECT MADANGKYTIEMPHONG FROM PHIEUDANGKYGOI);

GO

-- ============================================================================
-- NHÓM 5: KHÁM CHỮA BỆNH
-- ============================================================================

PRINT '30-35. Insert DU LIEU Y TE...';
DECLARE @k INT = 1;
DECLARE @MaThuCung INT, @MaBacSi CHAR(5), @NgayKham DATETIME;
DECLARE @MaGKTQ INT, @MaGKCK INT, @MaToa INT;
DECLARE @MaPDK INT;
DECLARE @NhietDo DECIMAL(3,1);
DECLARE @MoTaTQ NVARCHAR(50);
DECLARE @MaDichVu CHAR(5);
DECLARE @TrieuChung NVARCHAR(200);
DECLARE @ChuanDoan NVARCHAR(200);
DECLARE @HuongDanThuoc NVARCHAR(100);
DECLARE @KichBan INT; -- Biến để chọn kịch bản bệnh (0: Da liễu, 1: Tiêu hóa, 2: Hô hấp...)

WHILE @k <= 10000 
BEGIN
    -- A. SETUP CƠ BẢN
    -- Lấy random 1 thú cưng và 1 bác sĩ
    SET @MaThuCung = CAST(RAND()*120000 AS INT) + 1;
    -- Random Bác sĩ (ID từ 11-60)
    SET @MaBacSi = RIGHT('00000' + CAST((CAST(RAND()*50 AS INT) + 11) AS VARCHAR), 5);
    -- Ngày khám random
    SET @NgayKham = DATEADD(HOUR, -CAST(RAND()*4000 AS INT), GETDATE());

    -- B. XỬ LÝ KHÁM TỔNG QUÁT (Fix Nhiệt độ & Mã Đăng Ký)
    -- Random Nhiệt độ từ 37.5 đến 40.5
    SET @NhietDo = CAST(37.5 + (RAND() * 3.0) AS DECIMAL(3,1));
    
    -- Random Mô tả dựa theo nhiệt độ
    IF @NhietDo > 39.5 SET @MoTaTQ = N'Sốt cao, mệt mỏi';
    ELSE IF @NhietDo > 38.5 SET @MoTaTQ = N'Sốt nhẹ, lừ đừ';
    ELSE SET @MoTaTQ = N'Thể trạng bình thường, ổn định';

    -- Lấy Random 1 Mã phiếu đăng ký tiêm phòng (Để không bị NULL)
    -- (Lấy ngẫu nhiên 10% cơ hội là NULL - khám vãng lai, còn lại là có phiếu)
    SET @MaPDK = NULL;
    IF RAND() < 0.9 
    BEGIN
        SELECT TOP 1 @MaPDK = MaDangKy FROM PHIEUDANGKYTIEMPHONG ORDER BY NEWID();
    END

    INSERT INTO GIAYKHAMBENHTONGQUAT (NhietDo, MoTa, MaThuCung, MaPhieuDangKyTiemPhong) 
    VALUES (@NhietDo, @MoTaTQ, @MaThuCung, @MaPDK);
    SET @MaGKTQ = SCOPE_IDENTITY();

    -- C. XỬ LÝ KHÁM CHUYÊN KHOA (Fix Triệu chứng & Chẩn đoán)
    -- Chọn kịch bản bệnh ngẫu nhiên (0-4)
    SET @KichBan = ABS(CHECKSUM(NEWID())) % 5;

    IF @KichBan = 0 -- BỆNH DA LIỄU
    BEGIN
        SET @MaDichVu = 'DV005'; -- Spa/Cắt tỉa (hoặc khám da)
        SET @TrieuChung = N'Rụng lông mảng lớn, gãi nhiều, da mẩn đỏ';
        SET @ChuanDoan = N'Viêm da dị ứng / Nấm da';
        SET @HuongDanThuoc = N'Bôi trực tiếp lên vùng da bệnh';
    END
    ELSE IF @KichBan = 1 -- BỆNH TIÊU HÓA
    BEGIN
        SET @MaDichVu = 'DV003'; -- Siêu âm
        SET @TrieuChung = N'Nôn mửa dịch vàng, bỏ ăn, tiêu chảy';
        SET @ChuanDoan = N'Viêm dạ dày / Rối loạn tiêu hóa cấp';
        SET @HuongDanThuoc = N'Uống sau khi ăn, chia 2 lần';
    END
    ELSE IF @KichBan = 2 -- BỆNH HÔ HẤP
    BEGIN
        SET @MaDichVu = 'DV004'; -- X-Quang
        SET @TrieuChung = N'Ho khan, khò khè, chảy nước mũi';
        SET @ChuanDoan = N'Viêm phổi / Viêm phế quản';
        SET @HuongDanThuoc = N'Uống sáng - chiều sau ăn';
    END
    ELSE IF @KichBan = 3 -- CHẤN THƯƠNG
    BEGIN
        SET @MaDichVu = 'DV004'; -- X-Quang xương
        SET @TrieuChung = N'Đi khập khiễng chân sau, kêu đau khi chạm';
        SET @ChuanDoan = N'Rạn xương / Sai khớp nhẹ';
        SET @HuongDanThuoc = N'Uống giảm đau, hạn chế vận động';
    END
    ELSE -- KHÁM ĐỊNH KỲ/SỨC KHỎE
    BEGIN
        SET @MaDichVu = 'DV001'; -- Khám lâm sàng
        SET @TrieuChung = N'Ăn uống bình thường, đến lịch tẩy giun';
        SET @ChuanDoan = N'Sức khỏe tốt, cần bổ sung Vitamin';
        SET @HuongDanThuoc = N'Uống kèm trong bữa ăn';
    END

    -- Insert Giấy khám chuyên khoa
    INSERT INTO GIAYKHAMBENHCHUYENKHOA (NgayKham, NgayTaiKham, MaBacSi, MaThuCung, MaDichVu) 
    VALUES (@NgayKham, DATEADD(DAY, 7, @NgayKham), @MaBacSi, @MaThuCung, @MaDichVu);
    SET @MaGKCK = SCOPE_IDENTITY();

    -- Insert Chi tiết (Triệu chứng & Chẩn đoán)
    INSERT INTO CHITIETKHAMBENHTRIEUZHUNG (MAGIAYKHAMBENHCHUYENKHOA, TRIEUZHUNG) VALUES (@MaGKCK, @TrieuChung);
    INSERT INTO CHITIETKHAMBENRCHUANDOAN (MAGIAYKHAMBENHCHUYENKHOA, CHUANDOAN) VALUES (@MaGKCK, @ChuanDoan);

    -- D. XỬ LÝ TOA THUỐC (Fix Ghi chú)
    INSERT INTO TOATHUOC (MaThuCung, MaBacSi, NgayKham, TongTien) 
    VALUES (@MaThuCung, @MaBacSi, @NgayKham, 0); -- Tổng tiền update sau
    SET @MaToa = SCOPE_IDENTITY();

    -- Insert thuốc ngẫu nhiên
    INSERT INTO CHITIETTOATHUOC (MaToaThuoc, MaThuoc, SoLuong, GhiChu)
    SELECT TOP 3 
        @MaToa, 
        MaSanPham, 
        CAST(RAND()*2 AS INT) + 1, 
        @HuongDanThuoc -- Lấy hướng dẫn từ kịch bản trên
    FROM THUOC 
    ORDER BY NEWID();
    
    -- Cập nhật tổng tiền toa thuốc
    UPDATE TOATHUOC 
    SET TongTien = (SELECT SUM(C.SoLuong * S.GiaTienSanPham) 
                    FROM CHITIETTOATHUOC C JOIN SANPHAM S ON C.MaThuoc = S.MaSanPham 
                    WHERE C.MaToaThuoc = @MaToa)
    WHERE MaToaThuoc = @MaToa;

    -- Log tiến độ
    IF @k % 2000 = 0 PRINT N'-> Đã khám bệnh ' + CAST(@k AS NVARCHAR) + N' ca...';
    
    SET @k = @k + 1;
END;

GO

PRINT '36. Insert GIAYTIEMPHONG (Lấy từ kết quả khám tổng quát)...';
-- Chỉ những ca khám tổng quát nào có "Sức khỏe ổn định" (Nhiệt độ < 39) mới được tiêm
INSERT INTO GIAYTIEMPHONG (MaVaccine, MaBacSi, LieuLuong, NgayTiem, MaGiayKhamTongQuat)
SELECT TOP 4000 
    (SELECT TOP 1 MaVaccine FROM VACCINE ORDER BY NEWID()), 
    (SELECT TOP 1 MaNhanVien FROM NHANVIEN WHERE LoaiNhanVien='BacSi' ORDER BY NEWID()), 
    1, 
    GETDATE(), 
    MaGiayKhamTongQuat 
FROM GIAYKHAMBENHTONGQUAT 
WHERE NhietDo < 39 -- Chỉ tiêm khi không sốt
ORDER BY NEWID();

GO

-- ============================================================================
-- NHÓM 6: HÓA ĐƠN & ĐÁNH GIÁ
-- ============================================================================

PRINT 'Insert 37 - 39: HOADON & CHI TIET...';

DECLARE @i INT = 1;
DECLARE @MaHD INT;
DECLARE @NgayLap DATETIME;
DECLARE @TongTien DECIMAL(18,0);
DECLARE @SoLuongMon INT;
DECLARE @MaNV CHAR(5);
DECLARE @MaKH INT;
DECLARE @PhanTramGiam DECIMAL(3,2); -- Lưu % giảm (0.00, 0.20, 0.30...)

WHILE @i <= 100000 
BEGIN
    SET @TongTien = 0;
    
    -- 1. Random thông tin cơ bản
    -- Ngày lập: Trong vòng 3 năm trở lại đây
    SET @NgayLap = DATEADD(HOUR, 8 + CAST(RAND()*13 AS INT), DATEADD(DAY, -CAST(RAND()*1000 AS INT), GETDATE()));
    -- Nhân viên: Chỉ lấy Tiếp tân (khoảng ID từ 61-110 theo logic nhân viên cũ)
    SET @MaNV = RIGHT('00000' + CAST((CAST(RAND()*50 AS INT) + 61) AS VARCHAR), 5);
    -- Khách hàng: Random từ 1 đến 80.000
    SET @MaKH = CAST(RAND()*80000 AS INT) + 1;
    
    -- [LOGIC QUAN TRỌNG]: Lấy % Giảm giá dựa trên Hạng thành viên hiện tại
    SET @PhanTramGiam = 0; -- Mặc định là khách vãng lai (0%)

    SELECT @PhanTramGiam = H.GiamGia
    FROM KHACHHANGTHANHVIEN K
    JOIN HANGTHANHVIEN H ON K.TenHang = H.TenHang
    WHERE K.MaKhachHang = @MaKH;

    -- Đề phòng trường hợp NULL (khách không có thẻ thành viên)
    IF @PhanTramGiam IS NULL SET @PhanTramGiam = 0;

    -- 2. Tạo Header Hóa đơn (Lưu % giảm giá vào cột GiamGia để đối chiếu sau này)
    INSERT INTO HOADON (NgayLap, GiamGia, TongTien, MaNhanVien, MaKhachHang)
    VALUES (@NgayLap, @PhanTramGiam, 0, @MaNV, @MaKH);
    
    SET @MaHD = SCOPE_IDENTITY();

    -- 3. Tạo Chi tiết Sản phẩm (Mua từ 1-3 món)
    SET @SoLuongMon = CAST(RAND()*3 AS INT) + 1;

    INSERT INTO HOADON_SANPHAM (MaHoaDon, MaSanPham, SoLuong) 
    SELECT TOP (@SoLuongMon) 
        @MaHD, 
        MaSanPham, 
        CAST(RAND()*5 AS INT) + 1 -- Số lượng mua mỗi món: 1-5 cái
    FROM SANPHAM 
    ORDER BY NEWID(); -- Random sản phẩm không trùng lặp

    -- Cộng tiền hàng vào Tổng tiền
    SELECT @TongTien = SUM(C.SoLuong * S.GiaTienSanPham)
    FROM HOADON_SANPHAM C 
    JOIN SANPHAM S ON C.MaSanPham = S.MaSanPham
    WHERE C.MaHoaDon = @MaHD;

    -- 4. Xử lý Dịch vụ Y tế (30% hóa đơn có sử dụng dịch vụ)
    IF RAND() < 0.3 
    BEGIN
        -- Random 1 dịch vụ bất kỳ
        INSERT INTO THANHTOANDICHVUYTE (MaHoaDon, MaDichVu) 
        VALUES (@MaHD, (SELECT TOP 1 MaDichVu FROM DICHVUYTE ORDER BY NEWID()));
        
        -- Cộng thêm chi phí dịch vụ (Giả định trung bình 200k/dịch vụ vì bảng DICHVU không có cột giá)
        SET @TongTien = @TongTien + 200000; 
    END

    -- 5. CHỐT TỔNG TIỀN (Áp dụng giảm giá VIP/Thân thiết)
    -- Công thức: Tiền phải trả = Tổng tiền * (1 - %Giảm)
    SET @TongTien = @TongTien * (1.0 - @PhanTramGiam);

    -- Cập nhật lại vào bảng Hóa đơn
    UPDATE HOADON SET TongTien = @TongTien WHERE MaHoaDon = @MaHD;

    -- Log tiến độ (Mỗi 10k dòng báo 1 lần)
    IF @i % 10000 = 0 PRINT N'-> Đã lập ' + CAST(@i AS NVARCHAR) + N' hóa đơn (Có tính giảm giá VIP)...';
    
    SET @i = @i + 1;
END;

GO

PRINT '40. Insert DANHGIAYTE...';
-- TypeORM schema uses: MADANHGIAYTE (auto), MAHOADON, MADICHVU, SOSAO, NHANXET, NGAYDANHGIA
INSERT INTO DANHGIAYTE (MAHOADON, MADICHVU, SOSAO, NHANXET)
SELECT 
    T.MaHoaDon,
    T.MaDichVu,
    RandomScore,
    ISNULL(
        CASE 
            WHEN RandomScore = 5 THEN 
                CHOOSE(ABS(CHECKSUM(NEWID())) % 5 + 1, 
                    N'Tuyệt vời', N'Bác sĩ rất tận tâm', N'Rất hài lòng', N'Dịch vụ chuyên nghiệp', N'Sẽ quay lại')
            WHEN RandomScore = 4 THEN 
                CHOOSE(ABS(CHECKSUM(NEWID())) % 4 + 1, 
                    N'Khá ổn', N'Bác sĩ nhiệt tình', N'Sạch sẽ, tốt', N'Cần cải thiện thời gian chờ')
            WHEN RandomScore = 3 THEN 
                CHOOSE(ABS(CHECKSUM(NEWID())) % 3 + 1, 
                    N'Tạm được', N'Hơi đông khách', N'Bình thường')
            ELSE 
                CHOOSE(ABS(CHECKSUM(NEWID())) % 3 + 1, 
                    N'Thất vọng', N'Phục vụ chậm', N'Giá hơi cao')
        END, 
        N'Dịch vụ ổn'
    )
FROM (
    SELECT TOP 3000 
        MaHoaDon, MaDichVu,
        CASE 
            WHEN RAND(CHECKSUM(NEWID())) < 0.6 THEN 5
            WHEN RAND(CHECKSUM(NEWID())) < 0.9 THEN 4
            ELSE CAST(RAND(CHECKSUM(NEWID())) * 3 AS INT) + 1
        END AS RandomScore
    FROM THANHTOANDICHVUYTE
    ORDER BY NEWID()
) AS T;

GO

PRINT '41. Insert DANHGIAMUAHANG...';

INSERT INTO DANHGIAMUAHANG (MAHOADON, MASANPHAM, SOSAO, NHANXET)
SELECT 
    MaHoaDon,
    MaSanPham,
    RandomScore,
    -- Sinh nhận xét dựa theo điểm số
    ISNULL(
        CASE 
            WHEN RandomScore = 5 THEN 
                CHOOSE(ABS(CHECKSUM(NEWID())) % 5 + 1, 
                    N'Hàng chất lượng', N'Giao hàng nhanh', N'Đóng gói kỹ', N'Rất ưng ý', N'Pet rất thích')
            WHEN RandomScore = 4 THEN 
                CHOOSE(ABS(CHECKSUM(NEWID())) % 3 + 1, 
                    N'Hàng ổn so với giá', N'Giao hơi chậm xíu', N'Tạm được')
            ELSE 
                CHOOSE(ABS(CHECKSUM(NEWID())) % 3 + 1, 
                    N'Hàng không giống hình', N'Chất lượng kém', N'Đóng gói sơ sài')
        END,
        N'Đã nhận hàng' -- Fallback text
    )
FROM (
    SELECT TOP 5000 
        H.MaHoaDon,
        HS.MaSanPham,
        CASE 
            WHEN RAND(CHECKSUM(NEWID())) < 0.7 THEN 5 -- 70% 5 sao
            WHEN RAND(CHECKSUM(NEWID())) < 0.9 THEN 4 -- 20% 4 sao
            ELSE CAST(RAND(CHECKSUM(NEWID())) * 3 AS INT) + 1 
        END AS RandomScore
    FROM HOADON_SANPHAM HS
    INNER JOIN HOADON H ON HS.MaHoaDon = H.MaHoaDon
    ORDER BY NEWID()
) AS TempTable;

GO

PRINT '=== HOÀN TẤT TOÀN BỘ DỮ LIỆU ===';
