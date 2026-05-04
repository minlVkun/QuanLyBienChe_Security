const { sql } = require('../../config/db');
const DBHelper = require('../../utils/dbHelper');

class DepartmentModel {
    static async getById(reqUser, id) {
        const query = `SELECT * FROM [HR].[DonVi] WHERE MaDonVi = @ID`;
        const result = await DBHelper.queryWithContext(reqUser, query, [{ name: 'ID', type: sql.VarChar, value: id }]);
        return result.recordset[0] || null;
    }
    /**
     * Lấy danh sách đơn vị để vẽ sơ đồ tổ chức
     */
    static async getOrgChart(reqUser) {
        const query = `
            SELECT 
                dv.MaDonVi, 
                dv.TenDonVi, 
                dv.MaDonViCha, 
                dv.MaTruongPhong, 
                nv.HoTen as TenTruongPhong 
            FROM [HR].[DonVi] dv
            LEFT JOIN [HR].[NhanVien] nv ON dv.MaTruongPhong = nv.MaNV
            ORDER BY dv.MaDonViCha, dv.MaDonVi
        `;
        try {
            const result = await DBHelper.queryWithContext(reqUser, query);
            return result.recordset || [];
        } catch (error) {
            console.error(`[Model Error - getOrgChart]:`, error.message);
            throw error;
        }
    }

    /**
     * Cập nhật trưởng phòng và điều chỉnh Role hệ thống
     */
    static async updateDeptHead(reqUser, maDonVi, maTruongPhong) {
        const query = `
            SET XACT_ABORT ON;
            BEGIN TRAN;

            -- 1. Lưu lại Trưởng phòng cũ
            DECLARE @OldTP VARCHAR(50);
            SELECT @OldTP = MaTruongPhong FROM [HR].[DonVi] WHERE MaDonVi = @MaDonVi;

            -- 2. Cập nhật Trưởng phòng mới cho Đơn vị
            UPDATE [HR].[DonVi]
            SET MaTruongPhong = @MaTruongPhong
            WHERE MaDonVi = @MaDonVi;

            -- 3. Nâng cấp quyền cho người mới (nếu chưa phải là Admin/HR)
            IF @MaTruongPhong IS NOT NULL AND @MaTruongPhong <> ''
            BEGIN
                UPDATE [System].[User]
                SET RoleName = 'db_DeptHead'
                WHERE UserID = (SELECT UserID FROM [HR].[NhanVien] WHERE MaNV = @MaTruongPhong)
                AND RoleName NOT IN ('db_Admin', 'db_HR_Human', 'db_HR_Payroll');
            END

            -- 4. Hạ cấp quyền cho người cũ nếu họ không còn quản lý đơn vị nào khác
            IF @OldTP IS NOT NULL AND @OldTP <> ISNULL(@MaTruongPhong, '')
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM [HR].[DonVi] WHERE MaTruongPhong = @OldTP)
                BEGIN
                    UPDATE [System].[User]
                    SET RoleName = 'db_Employee'
                    WHERE UserID = (SELECT UserID FROM [HR].[NhanVien] WHERE MaNV = @OldTP)
                    AND RoleName NOT IN ('db_Admin', 'db_HR_Human', 'db_HR_Payroll');
                END
            END

            -- Trả về số dòng bị tác động
            SELECT @@ROWCOUNT AS AffectedRows;

            COMMIT TRAN;
        `;

        const inputs = [
            { name: 'MaDonVi', type: sql.VarChar, value: maDonVi },
            { name: 'MaTruongPhong', type: sql.VarChar, value: maTruongPhong || null }
        ];

        try {
            const result = await DBHelper.queryWithContext(reqUser, query, inputs);
            return result.recordset[0].AffectedRows;
        } catch (error) {
            console.error(`[Model Error - updateDeptHead]:`, error.message);
            throw error;
        }
    }

    /**
     * Thêm đơn vị mới
     */
    static async create(reqUser, data) {
        const query = `
            INSERT INTO [HR].[DonVi] (MaDonVi, TenDonVi, MaDonViCha)
            VALUES (@MaDonVi, @TenDonVi, @MaDonViCha)
        `;
        const inputs = [
            { name: 'MaDonVi', type: sql.VarChar, value: data.maDonVi },
            { name: 'TenDonVi', type: sql.NVarChar, value: data.tenDonVi },
            { name: 'MaDonViCha', type: sql.VarChar, value: data.maDonViCha || null }
        ];
        await DBHelper.queryWithContext(reqUser, query, inputs);
    }

    /**
     * Cập nhật thông tin đơn vị
     */
    static async update(reqUser, id, data) {
        const query = `
            UPDATE [HR].[DonVi]
            SET TenDonVi = @TenDonVi,
                MaDonViCha = @MaDonViCha
            WHERE MaDonVi = @ID
        `;
        const inputs = [
            { name: 'ID', type: sql.VarChar, value: id },
            { name: 'TenDonVi', type: sql.NVarChar, value: data.tenDonVi },
            { name: 'MaDonViCha', type: sql.VarChar, value: data.maDonViCha || null }
        ];
        await DBHelper.queryWithContext(reqUser, query, inputs);
    }

    /**
     * Xóa đơn vị
     */
    static async delete(reqUser, id) {
        // Kiểm tra xem có nhân viên nào thuộc đơn vị này không
        const checkQuery = `SELECT COUNT(*) as Count FROM [HR].[NhanVien] WHERE MaDonVi = @ID`;
        const checkResult = await DBHelper.queryWithContext(reqUser, checkQuery, [{ name: 'ID', type: sql.VarChar, value: id }]);
        
        if (checkResult.recordset[0].Count > 0) {
            const err = new Error("Không thể xóa đơn vị đang có nhân viên.");
            err.statusCode = 422;
            throw err;
        }

        const query = `DELETE FROM [HR].[DonVi] WHERE MaDonVi = @ID`;
        await DBHelper.queryWithContext(reqUser, query, [{ name: 'ID', type: sql.VarChar, value: id }]);
    }
}

module.exports = DepartmentModel;