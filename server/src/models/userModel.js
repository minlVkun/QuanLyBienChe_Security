const { sql } = require('../config/db');
const DBHelper = require('../utils/dbHelper');

class UserModel {
    /**
     * Lấy danh sách user kèm thông tin nhân viên, phân trang và tìm kiếm
     */
    static async findAll(reqUser, { page = 1, limit = 10, search = '' }) {
        const offset = (page - 1) * limit;
        const searchQuery = search ? `AND (u.Username LIKE @search OR nv.HoTen LIKE @search)` : '';

        const query = `
            SELECT 
                u.UserID, u.Username, u.RoleName, u.TrangThai,
                nv.HoTen, nv.Email,
                COUNT(*) OVER() as TotalRows
            FROM [System].[User] u
            LEFT JOIN [HR].[NhanVien] nv ON u.Username = nv.MaNV
            WHERE 1=1 ${searchQuery}
            ORDER BY u.UserID ASC
            OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
        `;

        const inputs = [
            { name: 'offset', type: sql.Int, value: offset },
            { name: 'limit', type: sql.Int, value: limit },
            { name: 'search', type: sql.NVarChar, value: `%${search}%` }
        ];

        try {
            const result = await DBHelper.queryWithContext(reqUser, query, inputs);
            return result.recordset;
        } catch (error) {
            throw error;
        }
    }

    static async findById(reqUser, id) {
        const query = `SELECT UserID, Username, RoleName, TrangThai FROM [System].[User] WHERE UserID = @UserID`;
        const result = await DBHelper.queryWithContext(reqUser, query, [{ name: 'UserID', type: sql.Int, value: id }]);
        return result.recordset[0];
    }

    /**
     * Cập nhật Role và Trạng thái
     */
    static async updateRoleAndStatus(reqUser, id, { RoleName, TrangThai }) {
        const query = `
            UPDATE [System].[User]
            SET RoleName = @RoleName, TrangThai = @TrangThai
            WHERE UserID = @UserID;
            SELECT @@ROWCOUNT AS AffectedRows;
        `;
        const inputs = [
            { name: 'UserID', type: sql.Int, value: id },
            { name: 'RoleName', type: sql.NVarChar, value: RoleName },
            { name: 'TrangThai', type: sql.Int, value: TrangThai }
        ];
        const result = await DBHelper.queryWithContext(reqUser, query, inputs);
        return result.recordset[0].AffectedRows;
    }

    /**
     * Cập nhật mật khẩu băm (VARBINARY)
     */
    static async updatePassword(reqUser, id, passwordBuffer) {
        const query = `
            UPDATE [System].[User]
            SET PasswordHash = @PasswordHash
            WHERE UserID = @UserID;
        `;
        const inputs = [
            { name: 'UserID', type: sql.Int, value: id },
            { name: 'PasswordHash', type: sql.VarBinary, value: passwordBuffer }
        ];
        await DBHelper.queryWithContext(reqUser, query, inputs);
        return true;
    }
}

module.exports = UserModel;