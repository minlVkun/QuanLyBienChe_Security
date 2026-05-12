/*
==============================================================================
SQL SCRIPT: HARDENING SALARY SECURITY WITH ALWAYS ENCRYPTED
==============================================================================
Mục tiêu: Mã hóa các cột số tiền nhạy cảm trong bảng Lương.
Các cột mục tiêu: LuongCoSo, PhuCap, MucLuongDongBH, TienKhauTruBH, ThucLanh.
==============================================================================
*/

-- 1. Tạo Column Master Key (CMK) - Lưu trong Windows Certificate Store
-- Lưu ý: Bạn cần chạy lệnh này trong SSMS với quyền Admin
IF NOT EXISTS (SELECT * FROM sys.column_master_keys WHERE name = 'CMK_HRM_Payroll')
BEGIN
    CREATE COLUMN MASTER KEY [CMK_HRM_Payroll]
    WITH (
        KEY_STORE_PROVIDER_NAME = 'MSSQL_CERTIFICATE_STORE',
        KEY_PATH = 'CurrentUser/My/HRM_Payroll_Master_Key' -- Thay bằng Certificate của bạn
    );
END
GO

-- 2. Tạo Column Encryption Key (CEK)
IF NOT EXISTS (SELECT * FROM sys.column_encryption_keys WHERE name = 'CEK_HRM_Salary')
BEGIN
    CREATE COLUMN ENCRYPTION KEY [CEK_HRM_Salary]
    WITH VALUES (
        COLUMN_MASTER_KEY = [CMK_HRM_Payroll],
        ALGORITHM = 'RSA_OAEP',
        ENCRYPTED_VALUE = 0x01 -- Giá trị mẫu
    );
END
GO

-- 3. Cập nhật cấu trúc bảng Salary.BangLuong
-- LƯU Ý: Chuyển đổi sang Always Encrypted nên dùng SSMS Wizard để xử lý dữ liệu hiện có.
/*
ALTER TABLE [Salary].[BangLuong]
ALTER COLUMN [ThucLanh] [decimal](18, 2) 
ENCRYPTED WITH (
    COLUMN_ENCRYPTION_KEY = [CEK_HRM_Salary], 
    ENCRYPTION_TYPE = Randomized, 
    ALGORITHM = 'AEAD_AES_256_CBC_HMAC_SHA_256'
) NOT NULL;
*/
