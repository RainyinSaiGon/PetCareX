-- Migration: Update existing 0đ invoices with "Đã hoàn thành" status to 200,000 VND
-- Date: 2025-12-30
-- Description: Fix invoices created from completed appointments that have 0đ amount

-- Update HOADON table: set TongTien to 200000 for invoices with 0 amount and "Đã hoàn thành" status
UPDATE HOADON
SET TongTien = 200000
WHERE TongTien = 0 
  AND TrangThai = N'Đã hoàn thành';

-- Also update any with "Hoàn thành" status (in case old invoices exist)
UPDATE HOADON
SET TongTien = 200000,
    TrangThai = N'Đã hoàn thành'
WHERE TongTien = 0 
  AND TrangThai = N'Hoàn thành';

-- Update the corresponding service payment records in THANHTOANDICHVUYTE
UPDATE THANHTOANDICHVUYTE
SET SoTien = 200000
WHERE SoTien = 0;

-- Show updated records
SELECT MaHoaDon, NgayLap, TongTien, TrangThai, MaKhachHang
FROM HOADON
WHERE TrangThai = N'Đã hoàn thành'
ORDER BY NgayLap DESC;
