const { sql} = require('../config/db');
const DBHelper = require('../utils/dbHelper');
class AuthModel {
    static async getUserByUsername(username) {
        const query = `
            SELECT u.UserID, u.Username, u.PasswordHash, u.RoleName, n.MaNV AS MaNV
            FROM [System].[User] u
            LEFT JOIN [HR].[NhanVien] n ON u.UserID = n.UserID
            WHERE u.Username = @Username
        `;

        const inputs = [{ name: 'Username', type: sql.NVarChar, value: username }];

        // Tự tạo một "thẻ bài" ảo có quyền Admin để vượt RLS
        const mockAdminUser = { role: 'db_Admin', MaNV: '' };

        // Ném qua dbHelper, nó sẽ tự động dọn dẹp và nạp Context an toàn
        const result = await DBHelper.queryWithContext(mockAdminUser, query, inputs);
        
        return result.recordset[0];
    }
}

module.exports = AuthModel;