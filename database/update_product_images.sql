USE PetCare_X;
GO

-- Update food products with matching images
UPDATE SANPHAM SET HinhAnh = '/products/pet_food_tuna_1767003424347.png' 
WHERE LoaiSanPham = N'Thức Ăn' AND (TenSanPham LIKE N'%Cá%' OR TenSanPham LIKE N'%Hải Sản%');

UPDATE SANPHAM SET HinhAnh = '/products/pet_food_dried_meat_1767003448454.png' 
WHERE LoaiSanPham = N'Thức Ăn' AND (TenSanPham LIKE N'%Thịt sấy%' OR TenSanPham LIKE N'%Bánh thưởng%');

UPDATE SANPHAM SET HinhAnh = '/products/pet_food_pate_cat_1767002052901.png' 
WHERE LoaiSanPham = N'Thức Ăn' AND (TenSanPham LIKE N'%Pate%' OR TenSanPham LIKE N'%Sốt%');

UPDATE SANPHAM SET HinhAnh = '/products/pet_food_soup_packet_1767002085375.png' 
WHERE LoaiSanPham = N'Thức Ăn' AND TenSanPham LIKE N'%Súp%';

UPDATE SANPHAM SET HinhAnh = '/products/pet_food_dry_beef_1767002032468.png' 
WHERE LoaiSanPham = N'Thức Ăn' AND TenSanPham LIKE N'%Bò%';

UPDATE SANPHAM SET HinhAnh = '/products/pet_food_dry_chicken_1767002000294.png' 
WHERE LoaiSanPham = N'Thức Ăn' AND TenSanPham LIKE N'%Gà%';

-- Default for remaining food products
UPDATE SANPHAM SET HinhAnh = '/products/pet_food_dry_chicken_1767002000294.png' 
WHERE LoaiSanPham = N'Thức Ăn' AND HinhAnh NOT LIKE '/products/pet_food%';

GO

-- Update medicine products with matching images
UPDATE SANPHAM SET HinhAnh = '/products/pet_medicine_tablet_1767002114586.png' 
WHERE LoaiSanPham = N'Thuốc' AND (TenSanPham LIKE N'%Viên nhai%' OR TenSanPham LIKE N'%tẩy giun%' OR TenSanPham LIKE N'%Canxi%');

UPDATE SANPHAM SET HinhAnh = '/products/pet_medicine_drops_1767002136424.png' 
WHERE LoaiSanPham = N'Thuốc' AND (TenSanPham LIKE N'%Thuốc nhỏ%' OR TenSanPham LIKE N'%Dung dịch%' OR TenSanPham LIKE N'%Sát trùng%');

UPDATE SANPHAM SET HinhAnh = '/products/pet_medicine_spray_1767002165132.png' 
WHERE LoaiSanPham = N'Thuốc' AND TenSanPham LIKE N'%Xịt%';

UPDATE SANPHAM SET HinhAnh = '/products/pet_medicine_gel_1767002194123.png' 
WHERE LoaiSanPham = N'Thuốc' AND (TenSanPham LIKE N'%Gel%' OR TenSanPham LIKE N'%Kem%');

-- Default for remaining medicine products
UPDATE SANPHAM SET HinhAnh = '/products/pet_medicine_tablet_1767002114586.png' 
WHERE LoaiSanPham = N'Thuốc' AND HinhAnh NOT LIKE '/products/pet_medicine%';

GO

-- Update accessory products with matching images
UPDATE SANPHAM SET HinhAnh = '/products/pet_accessory_collar_1767002219134.png' 
WHERE LoaiSanPham = N'Phụ Kiện' AND TenSanPham LIKE N'%Vòng cổ%';

UPDATE SANPHAM SET HinhAnh = '/products/pet_accessory_leash_1767002319288.png' 
WHERE LoaiSanPham = N'Phụ Kiện' AND TenSanPham LIKE N'%Dây dắt%';

UPDATE SANPHAM SET HinhAnh = '/products/pet_accessory_bowl_1767002241749.png' 
WHERE LoaiSanPham = N'Phụ Kiện' AND TenSanPham LIKE N'%Bát%';

UPDATE SANPHAM SET HinhAnh = '/products/pet_accessory_bed_1767002289898.png' 
WHERE LoaiSanPham = N'Phụ Kiện' AND (TenSanPham LIKE N'%Đệm%' OR TenSanPham LIKE N'%nằm%');

UPDATE SANPHAM SET HinhAnh = '/products/pet_accessory_toy_1767002268067.png' 
WHERE LoaiSanPham = N'Phụ Kiện' AND TenSanPham LIKE N'%Đồ chơi%';

UPDATE SANPHAM SET HinhAnh = '/products/pet_accessory_litter_1767002366580.png' 
WHERE LoaiSanPham = N'Phụ Kiện' AND TenSanPham LIKE N'%Cát%';

UPDATE SANPHAM SET HinhAnh = '/products/pet_accessory_brush_1767002387521.png' 
WHERE LoaiSanPham = N'Phụ Kiện' AND TenSanPham LIKE N'%Lược%';

UPDATE SANPHAM SET HinhAnh = '/products/pet_accessory_backpack_1767002342816.png' 
WHERE LoaiSanPham = N'Phụ Kiện' AND TenSanPham LIKE N'%Ba lô%';

UPDATE SANPHAM SET HinhAnh = '/products/pet_accessory_cage_1767002411200.png' 
WHERE LoaiSanPham = N'Phụ Kiện' AND TenSanPham LIKE N'%Chuồng%';

-- Default for remaining accessory products
UPDATE SANPHAM SET HinhAnh = '/products/pet_accessory_toy_1767002268067.png' 
WHERE LoaiSanPham = N'Phụ Kiện' AND HinhAnh NOT LIKE '/products/pet_accessory%';

GO

-- Verify update
SELECT LoaiSanPham, HinhAnh, COUNT(*) AS Count 
FROM SANPHAM 
GROUP BY LoaiSanPham, HinhAnh 
ORDER BY LoaiSanPham, COUNT(*) DESC;
GO
