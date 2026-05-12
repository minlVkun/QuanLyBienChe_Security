/*
================================================================================
  SCRIPT: salary_secure_view.sql  (v2 - Fixed)
  
  Vấn đề v1: sp_rename thất bại vì Foreign Key constraints là "enforced dependencies".
  Giải pháp:  Drop FK → Drop Security Policy → Rename → Tạo lại FK & Policy → Tạo View.
  
  Chạy toàn bộ file trong SSMS với quyền db_owner/sysadmin.
================================================================================
*/
SET NOCOUNT ON;

-- ============================================================================
-- STEP 0: KIỂM TRA TIỀN ĐIỀU KIỆN
-- ============================================================================
PRINT '===== [STEP 0] Kiểm tra điều kiện =====';
IF NOT EXISTS (
    SELECT 1 FROM sys.tables t 
    JOIN sys.schemas s ON t.schema_id = s.schema_id
    WHERE s.name = 'Salary' AND t.name = 'DienBienLuong'
)
BEGIN
    RAISERROR('[ERROR] Bảng [Salary].[DienBienLuong] không tồn tại!', 16, 1);
    RETURN;
END
IF EXISTS (
    SELECT 1 FROM sys.tables t 
    JOIN sys.schemas s ON t.schema_id = s.schema_id
    WHERE s.name = 'Salary' AND t.name = 'DienBienLuong_Internal'
)
BEGIN
    RAISERROR('[ERROR] Bảng [Salary].[DienBienLuong_Internal] đã tồn tại. Script có thể đã chạy rồi!', 16, 1);
    RETURN;
END
PRINT '[OK] Tiền điều kiện hợp lệ.';
GO

-- ============================================================================
-- STEP 1: DROP FOREIGN KEY CONSTRAINTS (Nguyên nhân chính gây lỗi sp_rename)
-- ============================================================================
PRINT '===== [STEP 1] Drop Foreign Key Constraints =====';

-- Kiểm tra và drop FK_Luong_Ngach
IF EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_Luong_Ngach' AND parent_object_id = OBJECT_ID('Salary.DienBienLuong'))
BEGIN
    ALTER TABLE [Salary].[DienBienLuong] DROP CONSTRAINT [FK_Luong_Ngach];
    PRINT '[OK] Dropped FK_Luong_Ngach';
END

-- Kiểm tra và drop FK_Luong_NhanVien
IF EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_Luong_NhanVien' AND parent_object_id = OBJECT_ID('Salary.DienBienLuong'))
BEGIN
    ALTER TABLE [Salary].[DienBienLuong] DROP CONSTRAINT [FK_Luong_NhanVien];
    PRINT '[OK] Dropped FK_Luong_NhanVien';
END
GO

-- ============================================================================
-- STEP 2: TẮT VÀ XÓA RLS SECURITY POLICY
-- ============================================================================
PRINT '===== [STEP 2] Drop Security Policy =====';

IF EXISTS (SELECT 1 FROM sys.security_policies WHERE name = 'DienBienLuongPolicy')
BEGIN
    ALTER SECURITY POLICY [Security].[DienBienLuongPolicy] WITH (STATE = OFF);
    DROP  SECURITY POLICY [Security].[DienBienLuongPolicy];
    PRINT '[OK] Dropped DienBienLuongPolicy';
END
ELSE
    PRINT '[SKIP] Policy không tồn tại.';
GO

-- ============================================================================
-- STEP 3: ĐỔI TÊN BẢNG GỐC → _Internal
-- ============================================================================
PRINT '===== [STEP 3] Đổi tên bảng =====';

EXEC sp_rename 'Salary.DienBienLuong', 'DienBienLuong_Internal';
PRINT '[OK] Đã đổi tên thành [Salary].[DienBienLuong_Internal]';
GO

-- ============================================================================
-- STEP 4: TẠO LẠI FOREIGN KEY CONSTRAINTS TRÊN BẢNG _Internal
-- ============================================================================
PRINT '===== [STEP 4] Tạo lại Foreign Key Constraints =====';

ALTER TABLE [Salary].[DienBienLuong_Internal]
    WITH CHECK ADD CONSTRAINT [FK_Luong_Ngach]
    FOREIGN KEY ([MaNgach]) REFERENCES [Salary].[NgachLuong] ([MaNgach]);
ALTER TABLE [Salary].[DienBienLuong_Internal] CHECK CONSTRAINT [FK_Luong_Ngach];
PRINT '[OK] Recreated FK_Luong_Ngach';

-- Kiểm tra bảng NhanVien hay NhanVien_Internal
IF OBJECT_ID('HR.NhanVien_Internal') IS NOT NULL
BEGIN
    ALTER TABLE [Salary].[DienBienLuong_Internal]
        WITH CHECK ADD CONSTRAINT [FK_Luong_NhanVien]
        FOREIGN KEY ([MaNV]) REFERENCES [HR].[NhanVien_Internal] ([MaNV]);
END
ELSE
BEGIN
    ALTER TABLE [Salary].[DienBienLuong_Internal]
        WITH CHECK ADD CONSTRAINT [FK_Luong_NhanVien]
        FOREIGN KEY ([MaNV]) REFERENCES [HR].[NhanVien] ([MaNV]);
END
ALTER TABLE [Salary].[DienBienLuong_Internal] CHECK CONSTRAINT [FK_Luong_NhanVien];
PRINT '[OK] Recreated FK_Luong_NhanVien';
GO

-- ============================================================================
-- STEP 5: GÁN DDM THÊM TRÊN BẢNG INTERNAL
-- (HeSoLuong đã có MASKED từ bảng cũ, thêm NgayXetNangBacTiepTheo)
-- ============================================================================
PRINT '===== [STEP 5] Áp dụng DDM trên bảng Internal =====';

-- Bỏ comment nếu cột chưa có MASKED:
-- ALTER TABLE [Salary].[DienBienLuong_Internal]
--     ALTER COLUMN [HeSoLuong] ADD MASKED WITH (FUNCTION = 'default()');

IF NOT EXISTS (
    SELECT 1 FROM sys.masked_columns c
    JOIN sys.tables t ON c.object_id = t.object_id
    WHERE t.name = 'DienBienLuong_Internal' AND c.name = 'NgayXetNangBacTiepTheo'
)
BEGIN
    ALTER TABLE [Salary].[DienBienLuong_Internal]
        ALTER COLUMN [NgayXetNangBacTiepTheo] ADD MASKED WITH (FUNCTION = 'default()');
    PRINT '[OK] DDM applied to NgayXetNangBacTiepTheo';
END
ELSE
    PRINT '[SKIP] DDM đã tồn tại trên NgayXetNangBacTiepTheo';
GO

-- ============================================================================
-- STEP 6: TẠO LẠI RLS SECURITY POLICY TRÊN BẢNG _Internal
-- ============================================================================
PRINT '===== [STEP 6] Tạo lại RLS Security Policy =====';

CREATE SECURITY POLICY [Security].[DienBienLuongPolicy]
ADD FILTER PREDICATE [Security].[fn_SecurityPredicate]([MaNV], '')
    ON [Salary].[DienBienLuong_Internal],
ADD BLOCK PREDICATE [Security].[fn_SecurityPredicate]([MaNV], '')
    ON [Salary].[DienBienLuong_Internal]
WITH (STATE = ON, SCHEMABINDING = ON);
GO
PRINT '[OK] Recreated DienBienLuongPolicy ON DienBienLuong_Internal';
GO

-- ============================================================================
-- STEP 7: TẠO SECURE VIEW [Salary].[DienBienLuong]
-- View giữ nguyên tên cũ → ứng dụng (salary.model.js) không cần sửa code.
-- Logic Masking bổ sung cho role DeptHead ở tầng View.
-- ============================================================================
PRINT '===== [STEP 7] Tạo Secure View [Salary].[DienBienLuong] =====';
GO

CREATE OR ALTER VIEW [Salary].[DienBienLuong]
AS
SELECT
    dbl.ID_Luong,
    dbl.MaNV,
    dbl.MaNgach,
    nl.TenNgach,
    nl.NhomNgach,
    dbl.BacLuong,
    /*
     * MASKING TẦNG VIEW (bổ sung cho DDM tầng bảng):
     *   - Admin / HR (BypassRLS=1)  → thấy đầy đủ
     *   - Nhân viên                 → chỉ thấy bản ghi của mình (RLS đã lọc)
     *   - DeptHead                  → thấy danh sách đơn vị mình,
     *                                  nhưng HeSoLuong bị che khi xem người khác
     */
    CASE
        WHEN CAST(SESSION_CONTEXT(N'IsDeptHead') AS INT) = 1
             AND dbl.MaNV <> CAST(SESSION_CONTEXT(N'MaNV') AS VARCHAR(20))
        THEN '***'
        ELSE CAST(dbl.HeSoLuong AS NVARCHAR(20))
    END AS HeSoLuong,
    dbl.NgayHuong,
    CASE
        WHEN CAST(SESSION_CONTEXT(N'IsDeptHead') AS INT) = 1
             AND dbl.MaNV <> CAST(SESSION_CONTEXT(N'MaNV') AS VARCHAR(20))
        THEN '***'
        ELSE CAST(dbl.NgayXetNangBacTiepTheo AS NVARCHAR(20))
    END AS NgayXetNangBacTiepTheo,
    dbl.IsCurrent,
    CASE
        WHEN CAST(SESSION_CONTEXT(N'IsDeptHead') AS INT) = 1
             AND dbl.MaNV <> CAST(SESSION_CONTEXT(N'MaNV') AS VARCHAR(20))
        THEN N'***'
        ELSE dbl.GhiChu
    END AS GhiChu
FROM [Salary].[DienBienLuong_Internal] dbl
JOIN [Salary].[NgachLuong] nl ON dbl.MaNgach = nl.MaNgach;
GO
PRINT '[OK] Tạo View [Salary].[DienBienLuong] thành công';
GO

-- ============================================================================
-- STEP 8: CẤP QUYỀN (Bỏ comment và thay tên DB User thực tế)
-- ============================================================================
PRINT '===== [STEP 8] Cấp quyền truy cập =====';
-- GRANT SELECT ON [Salary].[DienBienLuong]          TO [HRM_AppUser];
-- DENY  SELECT ON [Salary].[DienBienLuong_Internal] TO [HRM_AppUser];
PRINT '[SKIP] Bỏ comment dòng GRANT/DENY và thay [HRM_AppUser] để cấp quyền.';
GO

-- ============================================================================
-- STEP 9: XÁC NHẬN KẾT QUẢ
-- ============================================================================
PRINT '===== [STEP 9] Xác nhận kết quả =====';

SELECT 'TABLE (Internal)' AS Type, SCHEMA_NAME(schema_id)+'.'+name AS Name
FROM sys.tables WHERE name = 'DienBienLuong_Internal'
UNION ALL
SELECT 'VIEW (Secure)',    SCHEMA_NAME(schema_id)+'.'+name
FROM sys.views  WHERE name = 'DienBienLuong'
UNION ALL
SELECT 'FK '+ fk.name, OBJECT_SCHEMA_NAME(fk.parent_object_id)+'.'+OBJECT_NAME(fk.parent_object_id)
FROM sys.foreign_keys fk WHERE fk.parent_object_id = OBJECT_ID('Salary.DienBienLuong_Internal')
UNION ALL
SELECT 'POLICY '+ p.name, CASE p.is_enabled WHEN 1 THEN 'ENABLED' ELSE 'DISABLED' END
FROM sys.security_policies p WHERE p.name = 'DienBienLuongPolicy';

PRINT '===== HOÀN TẤT ====='
GO

-- ============================================================================
-- STEP 10: THÊM CỘT DaThanhToan VÀO Salary.BangLuong
-- (Cột này đang được dùng ở Frontend nhưng chưa có trong DB)
-- ============================================================================
PRINT '===== [STEP 10] Thêm cột DaThanhToan vào Salary.BangLuong =====';

IF NOT EXISTS (
    SELECT 1 FROM sys.columns
    WHERE object_id = OBJECT_ID('Salary.BangLuong')
      AND name = 'DaThanhToan'
)
BEGIN
    ALTER TABLE [Salary].[BangLuong]
    ADD [DaThanhToan] [bit] NOT NULL CONSTRAINT [DF_BangLuong_DaThanhToan] DEFAULT (0);
    PRINT '[OK] Đã thêm cột DaThanhToan (BIT, DEFAULT 0)';
END
ELSE
    PRINT '[SKIP] Cột DaThanhToan đã tồn tại';
GO

-- ============================================================================
-- STEP 11: TẠO SECURE VIEW [Salary].[vw_BangLuong]
--
-- Chính sách hiển thị cho từng Role:
--   ┌─────────────────┬────────────┬─────────┬────────┬──────────┬──────────┐
--   │ Thông tin        │ Admin/HR   │ NV mình │ DeptH  │ DeptH    │          │
--   │                  │ Payroll    │         │(mình)  │(người k) │          │
--   ├─────────────────┼────────────┼─────────┼────────┼──────────┤          │
--   │ LuongCoSo        │ ✅ Đầy đủ │ ✅      │ ✅     │ ❌ NULL  │          │
--   │ HeSoLuong        │ ✅ Đầy đủ │ ✅      │ ✅     │ ❌ NULL  │          │
--   │ PhuCap           │ ✅ Đầy đủ │ ✅      │ ✅     │ ❌ NULL  │          │
--   │ TienKhauTruBH    │ ✅ Đầy đủ │ ✅      │ ✅     │ ❌ NULL  │          │
--   │ ThucLanh         │ ✅ Đầy đủ │ ✅      │ ✅     │ ✅ Thấy  │ (cần để  │
--   │                  │            │         │        │          │ quản lý  │
--   │                  │            │         │        │          │ ngân sách│
--   └─────────────────┴────────────┴─────────┴────────┴──────────┴──────────┘
-- ============================================================================
PRINT '===== [STEP 11] Tạo Secure View [Salary].[vw_BangLuong] =====';
GO

CREATE OR ALTER VIEW [Salary].[vw_BangLuong]
AS
SELECT
    bl.ID_BangLuong,
    bl.MaNV,
    nv.HoTen,
    dv.TenDonVi,
    nv.MaDonVi,
    bl.ThangNam,
    -- HeSoLuong: Chỉ Admin/HR và chính người đó mới thấy
    CASE
        WHEN CAST(SESSION_CONTEXT(N'IsDeptHead') AS INT) = 1
             AND bl.MaNV <> CAST(SESSION_CONTEXT(N'MaNV') AS VARCHAR(20))
        THEN '***'
        ELSE CAST(bl.HeSoLuong AS NVARCHAR(20))
    END AS HeSoLuong,
    -- LuongCoSo: Ẩn với DeptHead khi xem người khác
    CASE
        WHEN CAST(SESSION_CONTEXT(N'IsDeptHead') AS INT) = 1
             AND bl.MaNV <> CAST(SESSION_CONTEXT(N'MaNV') AS VARCHAR(20))
        THEN '***'
        ELSE CAST(bl.LuongCoSo AS NVARCHAR(20))
    END AS LuongCoSo,
    -- PhuCap: Ẩn với DeptHead khi xem người khác
    CASE
        WHEN CAST(SESSION_CONTEXT(N'IsDeptHead') AS INT) = 1
             AND bl.MaNV <> CAST(SESSION_CONTEXT(N'MaNV') AS VARCHAR(20))
        THEN '***'
        ELSE CAST(bl.PhuCap AS NVARCHAR(20))
    END AS PhuCap,
    -- TienKhauTruBH: Ẩn với DeptHead khi xem người khác (thông tin nhạy cảm nhất)
    CASE
        WHEN CAST(SESSION_CONTEXT(N'IsDeptHead') AS INT) = 1
             AND bl.MaNV <> CAST(SESSION_CONTEXT(N'MaNV') AS VARCHAR(20))
        THEN '***'
        ELSE CAST(bl.TienKhauTruBH AS NVARCHAR(20))
    END AS TienKhauTruBH,
    -- ThucLanh: DeptHead ĐƯỢC PHÉP thấy để quản lý ngân sách phòng ban
    -- Nếu muốn che cả thực lĩnh, bỏ comment logic dưới đây:
    /*
    CASE
        WHEN CAST(SESSION_CONTEXT(N'IsDeptHead') AS INT) = 1
             AND bl.MaNV <> CAST(SESSION_CONTEXT(N'MaNV') AS VARCHAR(20))
        THEN '***'
        ELSE CAST(bl.ThucLanh AS NVARCHAR(20))
    END 
    */
    CAST(bl.ThucLanh AS NVARCHAR(20)) AS ThucLanh,
    bl.NgayChot,
    bl.DaThanhToan,
    -- GhiChu: Ẩn với DeptHead khi xem người khác
    CASE
        WHEN CAST(SESSION_CONTEXT(N'IsDeptHead') AS INT) = 1
             AND bl.MaNV <> CAST(SESSION_CONTEXT(N'MaNV') AS VARCHAR(20))
        THEN N'***'
        ELSE bl.GhiChu
    END AS GhiChu
FROM [Salary].[BangLuong] bl
JOIN [HR].[NhanVien] nv ON bl.MaNV = nv.MaNV
JOIN [HR].[DonVi] dv ON nv.MaDonVi = dv.MaDonVi;
GO
PRINT '[OK] Đã tạo View [Salary].[vw_BangLuong]';
GO
