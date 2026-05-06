//src/models/employeeModel.js
const { sql } = require('../../config/db');
const DBHelper = require('../../utils/dbHelper');

class EmployeeModel {
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
                curr.TuNgay AS NgayVaoBienChe,
                nv.MaCaLamViec,
                c.TenCa AS TenCaLamViec
            FROM HR.NhanVien nv
            LEFT JOIN HR.DonVi dv ON nv.MaDonVi = dv.MaDonVi
            LEFT JOIN System.[User] u ON nv.UserID = u.UserID
            LEFT JOIN HR.CaLamViec c ON nv.MaCaLamViec = c.MaCaLamViec
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
                curr.TuNgay AS NgayVaoBienChe,
                nv.MaCaLamViec
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
            const inputs = [{ name: 'MaNV', type: sql.VarChar(20), value: maNV }];
            const result = await DBHelper.queryWithContext(reqUser, query, inputs);
            return result.recordset[0] || null;
        } catch (err) {
            throw new Error("Lỗi khi lấy nhân viên theo ID: " + err.message);
        }
    }

    static async checkTruongPhongExists(reqUser, maDonVi) {
        const query = `
            SELECT 1 
            FROM [HR].[DonVi] 
            WHERE MaDonVi = @MaDonVi AND MaTruongPhong IS NOT NULL AND MaTruongPhong <> ''
        `;
        try {
            const inputs = [{ name: 'MaDonVi', type: sql.VarChar(20), value: maDonVi }];
            const result = await DBHelper.queryWithContext(reqUser, query, inputs);
            return result.recordset.length > 0;
        } catch (error) {
            throw new Error("Lỗi khi kiểm tra Trưởng phòng: " + error.message);
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
                (MaNV, HoTen, NgaySinh, GioiTinh, SoCCCD, Email, SoDienThoai, QueQuan, MaDonVi, TrangThai, UserID, MaCaLamViec)
                VALUES 
                (@MaNV, @HoTen, @NgaySinh, @GioiTinh, @SoCCCD, @Email, @SoDienThoai, @QueQuan, @MaDonVi, 1, @NewUserID, @MaCaLamViec);

                -- 3. Khởi tạo quá trình công tác
                INSERT INTO [HR].[QuaTrinhCongTac] (MaNV, TuNgay, MaDonVi, MaChucVu, NoiDung)
                VALUES (@MaNV, @NgayVaoBienChe, @MaDonVi, @MaChucVu, N'Tiếp nhận nhân sự mới');

                -- 4. Cập nhật Trưởng phòng (Logic kiểm tra đã được chuyển sang Service)
                IF @MaChucVu = 'TP'
                BEGIN
                    UPDATE [HR].[DonVi] SET MaTruongPhong = @MaNV WHERE MaDonVi = @MaDonVi;
                    UPDATE [System].[User] SET RoleName = 'db_DeptHead' WHERE UserID = @NewUserID;
                END

                COMMIT TRAN;

                -- Trả về kết quả vừa tạo
                SELECT * FROM [HR].[NhanVien] WHERE MaNV = @MaNV;
            `;

            const inputs = [
                { name: 'MaNV', type: sql.VarChar(20), value: employeeData.MaNV },
                { name: 'PasswordHash', type: sql.VarBinary(sql.MAX), value: employeeData.PasswordHash },
                { name: 'HoTen', type: sql.NVarChar(100), value: employeeData.HoTen },
                { name: 'NgaySinh', type: sql.Date, value: employeeData.NgaySinh },
                { name: 'GioiTinh', type: sql.Bit, value: employeeData.GioiTinh },
                { name: 'SoCCCD', type: sql.VarChar(20), value: employeeData.SoCCCD },
                { name: 'Email', type: sql.VarChar(100), value: employeeData.Email },
                { name: 'SoDienThoai', type: sql.VarChar(15), value: employeeData.SoDienThoai },
                { name: 'QueQuan', type: sql.NVarChar(255), value: employeeData.QueQuan },
                { name: 'MaDonVi', type: sql.VarChar(20), value: employeeData.MaDonVi },
                { name: 'NgayVaoBienChe', type: sql.Date, value: employeeData.NgayVaoBienChe },
                { name: 'MaChucVu', type: sql.VarChar(20), value: employeeData.MaChucVu },
                { name: 'MaCaLamViec', type: sql.VarChar(10), value: employeeData.MaCaLamViec || null }
            ];

            const result = await DBHelper.queryWithContext(reqUser, query, inputs);
            return result.recordset[0];
        } catch (err) {
            throw err;
        }
    }

    static async createEmployeeWithTransaction(transaction, reqUser, employeeData) {
        try {
            const query = `
                -- 1. Tạo tài khoản hệ thống
                INSERT INTO [System].[User] (Username, PasswordHash, RoleName)
                VALUES (@MaNV, @PasswordHash, 'db_Employee');

                DECLARE @NewUserID INT = SCOPE_IDENTITY();

                -- 2. Tạo hồ sơ nhân viên
                INSERT INTO [HR].[NhanVien] 
                (MaNV, HoTen, NgaySinh, GioiTinh, SoCCCD, Email, SoDienThoai, QueQuan, MaDonVi, TrangThai, UserID, MaCaLamViec)
                VALUES 
                (@MaNV, @HoTen, @NgaySinh, @GioiTinh, @SoCCCD, @Email, @SoDienThoai, @QueQuan, @MaDonVi, 1, @NewUserID, @MaCaLamViec);

                -- 3. Khởi tạo quá trình công tác
                INSERT INTO [HR].[QuaTrinhCongTac] (MaNV, TuNgay, MaDonVi, MaChucVu, NoiDung)
                VALUES (@MaNV, @NgayVaoBienChe, @MaDonVi, @MaChucVu, N'Tiếp nhận nhân sự mới');

                -- 4. Cập nhật Trưởng phòng
                IF @MaChucVu = 'TP'
                BEGIN
                    UPDATE [HR].[DonVi] SET MaTruongPhong = @MaNV WHERE MaDonVi = @MaDonVi;
                    UPDATE [System].[User] SET RoleName = 'db_DeptHead' WHERE UserID = @NewUserID;
                END

                -- Trả về kết quả vừa tạo
                SELECT * FROM [HR].[NhanVien] WHERE MaNV = @MaNV;
            `;

            const inputs = [
                { name: 'MaNV', type: sql.VarChar(20), value: employeeData.MaNV },
                { name: 'PasswordHash', type: sql.VarBinary(sql.MAX), value: employeeData.PasswordHash },
                { name: 'HoTen', type: sql.NVarChar(100), value: employeeData.HoTen },
                { name: 'NgaySinh', type: sql.Date, value: employeeData.NgaySinh },
                { name: 'GioiTinh', type: sql.Bit, value: employeeData.GioiTinh },
                { name: 'SoCCCD', type: sql.VarChar(20), value: employeeData.SoCCCD },
                { name: 'Email', type: sql.VarChar(100), value: employeeData.Email },
                { name: 'SoDienThoai', type: sql.VarChar(15), value: employeeData.SoDienThoai },
                { name: 'QueQuan', type: sql.NVarChar(255), value: employeeData.QueQuan },
                { name: 'MaDonVi', type: sql.VarChar(20), value: employeeData.MaDonVi },
                { name: 'NgayVaoBienChe', type: sql.Date, value: employeeData.NgayVaoBienChe },
                { name: 'MaChucVu', type: sql.VarChar(20), value: employeeData.MaChucVu },
                { name: 'MaCaLamViec', type: sql.VarChar(10), value: employeeData.MaCaLamViec || null }
            ];

            const result = await DBHelper.queryWithContext(reqUser, query, inputs, null, transaction);
            return result.recordset[0];
        } catch (err) {
            throw err;
        }
    }


    static async UpdateEmployee(reqUser, maNV, updateData) {
        try {
            const fieldsToUpdate = [];
            const inputs = [{ name: 'MaNV', type: sql.VarChar(20), value: maNV }];

            // Cấu hình các cột cho phép cập nhật trực tiếp tại HR.NhanVien
            const allowedFields = [
                { key: 'HoTen', type: sql.NVarChar(100) },
                { key: 'NgaySinh', type: sql.Date },
                { key: 'GioiTinh', type: sql.Bit },
                { key: 'Email', type: sql.VarChar(100) },
                { key: 'SoDienThoai', type: sql.VarChar(15) },
                { key: 'QueQuan', type: sql.NVarChar(255) },
                { key: 'MaDonVi', type: sql.VarChar(20) },
                { key: 'MaCaLamViec', type: sql.VarChar(10) }
            ];

            allowedFields.forEach(field => {
                if (updateData[field.key] !== undefined) {
                    fieldsToUpdate.push(`${field.key} = @${field.key}`);
                    inputs.push({ name: field.key, type: field.type, value: updateData[field.key] });
                }
            });

            // Query xây dựng động
            let sqlQuery = `SET XACT_ABORT ON; BEGIN TRAN; \n`;
            sqlQuery += `DECLARE @Rows1 INT = 0, @Rows2 INT = 0;\n`;

            if (fieldsToUpdate.length > 0) {
                sqlQuery += `
                    UPDATE [HR].[NhanVien]
                    SET ${fieldsToUpdate.join(', ')}
                    WHERE MaNV = @MaNV;
                    SET @Rows1 = @@ROWCOUNT;
                `;
            }

            // Logic bổ sung: Cập nhật Chức vụ hoặc Ngày vào biên chế (sang bảng QuaTrinhCongTac)
            if (updateData.MaChucVu || updateData.NgayVaoBienChe) {
                // Đảm bảo các biến này có trong inputs nếu chưa có
                if (!inputs.find(i => i.name === 'MaChucVu'))
                    inputs.push({ name: 'MaChucVu', type: sql.VarChar(20), value: updateData.MaChucVu || null });
                if (!inputs.find(i => i.name === 'NgayVaoBienChe'))
                    inputs.push({ name: 'NgayVaoBienChe', type: sql.Date, value: updateData.NgayVaoBienChe || null });

                sqlQuery += `
                    UPDATE [HR].[QuaTrinhCongTac]
                    SET MaChucVu = ISNULL(@MaChucVu, MaChucVu),
                        TuNgay = ISNULL(@NgayVaoBienChe, TuNgay)
                    WHERE MaNV = @MaNV AND (DenNgay IS NULL OR DenNgay >= GETDATE());
                    SET @Rows2 = @@ROWCOUNT;
                `;
            }

            sqlQuery += `\n SELECT (@Rows1 + @Rows2) AS AffectedRows; COMMIT TRAN;`;

            // --- DEBUG LOG CHO PHÁT TRIỂN ---
            console.log("==========================================");
            console.log("🚀 [Model - UpdateEmployee] Đang thực thi Query:");
            console.log(sqlQuery);
            console.log("📦 Tham số đầu vào:");
            inputs.forEach(i => console.log(`   - @${i.name} (${i.type}): ${i.value}`));
            console.log("==========================================");

            const result = await DBHelper.queryWithContext(reqUser, sqlQuery, inputs);

            const affected = result.recordset[0]?.AffectedRows || 0;
            return affected;
        } catch (err) {
            console.error("[Model Error - UpdateEmployee]:", err.message);
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
                { name: 'MaNVCanXoa', type: sql.VarChar(20), value: maNVCanXoa }
            ];

            const result = await DBHelper.queryWithContext(reqUser, query, inputs);
            // Lấy AffectedRows từ recordset
            return result.recordset[0].AffectedRows;
        } catch (err) {
            throw err;
        }
    }
    /**
     * Cập nhật thông tin nhân viên (MaDonVi) trong Transaction
     */
    /**
     * Cập nhật thông tin nhân viên (MaDonVi) trong Transaction
     * BẢO MẬT: Sử dụng DBHelper.queryWithContext để đảm bảo RLS context được set trong batch.
     */
    static async updateInfoWithTransaction(transaction, reqUser, maNV, { maDonVi }) {
        const query = `
            UPDATE [HR].[NhanVien]
            SET MaDonVi = @MaDonVi
            WHERE MaNV = @MaNV;
        `;
        const inputs = [
            { name: 'MaNV', type: sql.VarChar(20), value: maNV },
            { name: 'MaDonVi', type: sql.VarChar(20), value: maDonVi }
        ];
        return await DBHelper.queryWithContext(reqUser, query, inputs, null, transaction);
    }
}

module.exports = EmployeeModel;

