const { sql } = require('../config/db');
const DBHelper = require('../utils/dbHelper');

class DonViModel {
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
}

module.exports = DonViModel;