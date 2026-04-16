//src/models/nhanVienModel.js
const {sql} = require('../config/db');
const DBHelper = require('../utils/dbHelper');

class NhanVienModel {
    static async getMaxMaNV(reqUser) {
        const query = `
            SELECT ISNULL(MAX(CAST(SUBSTRING(MaNV, 3, LEN(MaNV)) AS INT)), 0) AS MaxID
            FROM [HR].[NhanVien]
            WHERE MaNV LIKE 'NV%'
        `;

        try {
            const result = await DBHelper.queryWithContext(reqUser, query);
            return result.recordset[0].MaxID;
        } catch (error) {
            throw new Error("Lỗi khi lấy mã NV lớn nhất: " + error.message);
        }
    }

    static async getAll(reqUser) {
        const query = `
            SELECT 
                nv.MaNV,
                nv.HoTen,
                nv.NgaySinh,
                nv.GioiTinh,
                nv.SoCCCD,
                nv.Email,
                nv.SoDienThoai,
                nv.QueQuan,
                nv.MaDonVi,
                dv.TenDonVi, 
                nv.TrangThai,
                nv.UserID,
                u.RoleName AS Role,
                curr.TenChucVu AS ChucVuHienTai, 
                curr.TuNgay AS NgayVaoBienChe
            FROM HR.NhanVien nv
            LEFT JOIN HR.DonVi dv ON nv.MaDonVi = dv.MaDonVi
            LEFT JOIN System.[User] u ON nv.UserID = u.UserID
            OUTER APPLY (
                SELECT TOP 1 
                    cv.TenChucVu,
                    qt.TuNgay
                FROM HR.QuaTrinhCongTac qt
                LEFT JOIN HR.ChucVu cv ON qt.MaChucVu = cv.MaChucVu 
                WHERE qt.MaNV = nv.MaNV
                AND (qt.DenNgay IS NULL OR qt.DenNgay >= GETDATE())
                ORDER BY qt.TuNgay DESC
            ) curr
        `;

        try {
            const result = await DBHelper.queryWithContext(reqUser, query);
            return result.recordset;
        } catch (err) {
            throw new Error("Lỗi khi lấy danh sách nhân viên: " + err.message);
        }
    }

    static async getById(reqUser, maNV) {
        const query = `
            SELECT 
                nv.MaNV,
                nv.HoTen,
                nv.NgaySinh,
                nv.GioiTinh,
                nv.SoCCCD,
                nv.Email,
                nv.SoDienThoai,
                nv.QueQuan,
                nv.MaDonVi,
                dv.TenDonVi, 
                nv.TrangThai,
                nv.UserID,
                u.RoleName AS Role,
                curr.MaChucVu,
                curr.TenChucVu AS ChucVuHienTai, 
                curr.TuNgay AS NgayVaoBienChe
            FROM HR.NhanVien nv
            LEFT JOIN HR.DonVi dv ON nv.MaDonVi = dv.MaDonVi
            LEFT JOIN System.[User] u ON nv.UserID = u.UserID
            OUTER APPLY (
                SELECT TOP 1 
                    qt.MaChucVu,
                    cv.TenChucVu,
                    qt.TuNgay
                FROM HR.QuaTrinhCongTac qt
                LEFT JOIN HR.ChucVu cv ON qt.MaChucVu = cv.MaChucVu
                WHERE qt.MaNV = nv.MaNV
                AND (qt.DenNgay IS NULL OR qt.DenNgay >= GETDATE())
                ORDER BY qt.TuNgay DESC
            ) curr
            WHERE nv.MaNV = @MaNV
        `;

        try {
            const inputs = [{ name: 'MaNV', type: sql.VarChar, value: maNV }];
            const result = await DBHelper.queryWithContext(reqUser, query, inputs);
            return result.recordset[0] || null;
        } catch (err) {
            throw new Error("Lỗi khi lấy nhân viên theo ID: " + err.message);
        }
    }

    static async createEmployee(reqUser, employeeData) {
        try {
            const query = `
                SET XACT_ABORT ON; 
                BEGIN TRAN;

                -- 1. Tạo tài khoản hệ thống
                INSERT INTO [System].[User] (Username, PasswordHash, RoleName)
                VALUES (@MaNV, @PasswordHash, 'db_Employee');

                DECLARE @NewUserID INT = SCOPE_IDENTITY();

                -- 2. Tạo hồ sơ nhân viên
                INSERT INTO [HR].[NhanVien] 
                (MaNV, HoTen, NgaySinh, GioiTinh, SoCCCD, Email, SoDienThoai, QueQuan, MaDonVi, NgayVaoBienChe, TrangThai, UserID)
                VALUES 
                (@MaNV, @HoTen, @NgaySinh, @GioiTinh, @SoCCCD, @Email, @SoDienThoai, @QueQuan, @MaDonVi, @NgayVaoBienChe, 1, @NewUserID);

                -- 3. Khởi tạo quá trình công tác
                INSERT INTO [HR].[QuaTrinhCongTac] (MaNV, TuNgay, MaDonVi, MaChucVu, NoiDung)
                VALUES (@MaNV, GETDATE(), @MaDonVi, @MaChucVu, N'Tiếp nhận nhân sự mới');

                -- 4. Xử lý logic Trưởng phòng
                IF @MaChucVu = 'TP'
                BEGIN
                    IF EXISTS (SELECT 1 FROM [HR].[DonVi] WHERE MaDonVi = @MaDonVi AND MaTruongPhong IS NOT NULL AND MaTruongPhong <> '')
                    BEGIN
                        RAISERROR(N'Đơn vị này đã có Trưởng phòng. Vui lòng điều chuyển trước!', 16, 1);
                    END

                    UPDATE [HR].[DonVi] SET MaTruongPhong = @MaNV WHERE MaDonVi = @MaDonVi;
                    UPDATE [System].[User] SET RoleName = 'db_DeptHead' WHERE UserID = @NewUserID;
                END

                COMMIT TRAN;

                -- Trả về kết quả vừa tạo
                SELECT * FROM [HR].[NhanVien] WHERE MaNV = @MaNV;
            `;

            const inputs = [
                { name: 'MaNV', type: sql.VarChar, value: employeeData.MaNV },
                { name: 'PasswordHash', type: sql.VarBinary, value: employeeData.PasswordHash }, 
                { name: 'HoTen', type: sql.NVarChar, value: employeeData.HoTen },
                { name: 'NgaySinh', type: sql.Date, value: employeeData.NgaySinh },
                { name: 'GioiTinh', type: sql.Bit, value: employeeData.GioiTinh },
                { name: 'SoCCCD', type: sql.VarChar, value: employeeData.SoCCCD },
                { name: 'Email', type: sql.VarChar, value: employeeData.Email },
                { name: 'SoDienThoai', type: sql.VarChar, value: employeeData.SoDienThoai },
                { name: 'QueQuan', type: sql.NVarChar, value: employeeData.QueQuan },
                { name: 'MaDonVi', type: sql.VarChar, value: employeeData.MaDonVi },
                { name: 'NgayVaoBienChe', type: sql.Date, value: employeeData.NgayVaoBienChe },
                { name: 'MaChucVu', type: sql.VarChar, value: employeeData.MaChucVu }
            ];

            const result = await DBHelper.queryWithContext(reqUser, query, inputs);
            return result.recordset[0];
        } catch (err) {
            throw err;
        }
    }

    
    static async UpdateEmployee(reqUser, maNV, updateData) {
        try {
            const fieldsToUpdate = [];
            const inputs = [{ name: 'MaNV', type: sql.VarChar, value: maNV }];

            // Cấu hình các cột cho phép cập nhật
            const allowedFields = [
                { key: 'HoTen', type: sql.NVarChar },
                { key: 'NgaySinh', type: sql.Date },
                { key: 'GioiTinh', type: sql.Bit },
                { key: 'Email', type: sql.VarChar },
                { key: 'SoDienThoai', type: sql.VarChar },
                { key: 'QueQuan', type: sql.NVarChar },
                { key: 'MaDonVi', type: sql.VarChar }
            ];

            // Duyệt qua danh sách để build query động
            allowedFields.forEach(field => {
                if (updateData[field.key] !== undefined) {
                    fieldsToUpdate.push(`${field.key} = @${field.key}`);
                    inputs.push({ name: field.key, type: field.type, value: updateData[field.key] });
                }
            });

            if (fieldsToUpdate.length === 0) return 0;

            const query = `
                SET XACT_ABORT ON;
                BEGIN TRAN;
                    UPDATE [HR].[NhanVien]
                    SET ${fieldsToUpdate.join(', ')}
                    WHERE MaNV = @MaNV;
                    
                    -- Lấy số dòng bị tác động ngay sau lệnh UPDATE
                    SELECT @@ROWCOUNT AS AffectedRows;
                COMMIT TRAN;
            `;

            const result = await DBHelper.queryWithContext(reqUser, query, inputs);
            // Trả về số dòng được cập nhật
            return result.recordset[0].AffectedRows;
        } catch (err) {
            throw err;
        }
    }

    static async softDelete(reqUser, maNVCanXoa) {
        try {
            const query = `
                SET XACT_ABORT ON;
                BEGIN TRAN;

                -- 1. Khóa tài khoản đăng nhập (System.User) thông qua MaNV
                UPDATE [System].[User]
                SET TrangThai = -1 
                WHERE UserID = (SELECT UserID FROM [HR].[NhanVien] WHERE MaNV = @MaNVCanXoa);

                -- 2. Xóa mềm hồ sơ nhân viên (HR.NhanVien)
                UPDATE [HR].[NhanVien] 
                SET TrangThai = -1 
                WHERE MaNV = @MaNVCanXoa;

                -- Trả về số dòng bị tác động của lệnh UPDATE cuối cùng
                SELECT @@ROWCOUNT AS AffectedRows;

                COMMIT TRAN;
            `;

            const inputs = [
                { name: 'MaNVCanXoa', type: sql.VarChar, value: maNVCanXoa }
            ];
            
            const result = await DBHelper.queryWithContext(reqUser, query, inputs);
            // Lấy AffectedRows từ recordset
            return result.recordset[0].AffectedRows;
        } catch (err) {
            throw err;
        }
    }
}

module.exports = NhanVienModel;
            