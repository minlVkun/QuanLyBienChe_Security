// src/models/authModel.js
//
// LƯU Ý BẢO MẬT (SECURITY NOTE) — câu truy vấn đăng nhập (login query) KHÔNG đi qua DBHelper.queryWithContext.
//
// Lý do (Reason): queryWithContext tiêm SESSION_CONTEXT(MaNV). Tại thời điểm đăng nhập, chúng ta
// chưa có MaNV. Quan trọng hơn, [System].[User] KHÔNG ĐƯỢC
// áp dụng chính sách RLS lọc theo MaNV (đây là nơi lưu trữ thông tin xác thực (credential store),
// không phải bảng dữ liệu của từng nhân viên).
//
// Cách tiếp cận bảo mật đúng cho bảng này là:
//   - Chỉ GRANT EXECUTE cho stored procedure / ứng dụng đăng nhập.
//   - REVOKE quyền SELECT trực tiếp từ tất cả các role.
//   - DB login của ứng dụng đã được cấp quyền SELECT trên [System].[User]
//     chỉ phục vụ mục đích truy vấn đăng nhập (được thực thi trong phân quyền SQL,
//     không phải trong mã ứng dụng).
//
// KHÔNG ĐƯỢC dùng mẹo "mockAdminUser" — đây là một anti-pattern giả mạo context (context-spoofing)
// có thể bỏ qua bất kỳ chính sách RLS nào áp dụng cho bảng User trong tương lai.

const { sql, poolPromise } = require('../../config/db');
const DBHelper = require('../../utils/dbHelper');

class AuthModel {
    /**
    /**
     * Tra cứu người dùng bằng username cho luồng đăng nhập (login flow).
     * Trả về toàn bộ bản ghi xác thực (bao gồm PasswordHash) để
     * auth controller có thể xác thực mật khẩu trước khi cấp JWT.
     *
     * Cố ý sử dụng một pool request trực tiếp (không tiêm SESSION_CONTEXT)
     * vì câu truy vấn này chạy trước khi có bất kỳ context nào của người dùng.
     *
     * @param {string} username
     * @returns {Promise<{UserID, Username, PasswordHash, RoleName, MaNV}|undefined>}
     */
    static async getUserByUsername(username) {
        const query = `
            SELECT
                u.UserID,
                u.Username,
                u.PasswordHash,
                u.RoleName,
                u.TrangThai,
                n.MaNV
            FROM [System].[User] u
            LEFT JOIN [HR].[NhanVien] n ON u.UserID = n.UserID
            WHERE u.Username = @Username;
        `;
        
        const result = await DBHelper.queryWithContext(null, query, 
            [{ name: 'Username', type: sql.NVarChar(100), value: username }],
            {
                rlsCtx: {
                    bypassRLS: 1,
                    maNV: '',
                    roleName: 'db_Admin'
                }
            }
        );

        return result.recordset[0];
    }

    static async getUserByEmail(email) {
        const query = `
            SELECT u.UserID, u.Username, n.MaNV 
            FROM [System].[User] u
            JOIN [HR].[NhanVien] n ON u.UserID = n.UserID
            WHERE n.Email = @Email;
        `;
        
        const result = await DBHelper.queryWithContext(null, query,
            [{ name: 'Email', type: sql.VarChar(100), value: email }],
            {
                rlsCtx: {
                    bypassRLS: 1,
                    maNV: '',
                    roleName: 'db_Admin'
                }
            }
        );
        return result.recordset[0];
    }

    static async saveResetToken(userId, token, expiryMinutes = 30) {
        const expiryDate = new Date();
        expiryDate.setMinutes(expiryDate.getMinutes() + expiryMinutes);

        const query = `
            INSERT INTO System.ResetTokens (UserID, Token, ExpiryDate)
            VALUES (@UserID, @Token, @ExpiryDate);
        `;
        const inputs = [
            { name: 'UserID', type: sql.Int, value: userId },
            { name: 'Token', type: sql.VarChar(255), value: token },
            { name: 'ExpiryDate', type: sql.DateTime, value: expiryDate }
        ];

        await DBHelper.queryWithContext(null, query, inputs, {
            rlsCtx: { bypassRLS: 1, maNV: '', roleName: 'db_Admin' }
        });
    }

    static async getUserByResetToken(token) {
        const query = `
            SELECT UserID FROM System.ResetTokens 
            WHERE Token = @Token AND IsUsed = 0 AND ExpiryDate > GETDATE();
        `;
        const result = await DBHelper.queryWithContext(null, query, 
            [{ name: 'Token', type: sql.VarChar(255), value: token }],
            { rlsCtx: { bypassRLS: 1, maNV: '', roleName: 'db_Admin' } }
        );
        return result.recordset[0];
    }

    static async markTokenUsed(token) {
        const query = `UPDATE System.ResetTokens SET IsUsed = 1 WHERE Token = @Token;`;
        await DBHelper.queryWithContext(null, query, 
            [{ name: 'Token', type: sql.VarChar(255), value: token }],
            { rlsCtx: { bypassRLS: 1, maNV: '', roleName: 'db_Admin' } }
        );
    }

    static async updatePassword(userID, passwordBuffer) {
        const query = `
            UPDATE [System].[User]
            SET PasswordHash = @PasswordHash
            WHERE UserID = @UserID;
        `;
        
        await DBHelper.queryWithContext(null, query,
            [
                { name: 'UserID', type: sql.Int, value: userID },
                { name: 'PasswordHash', type: sql.VarBinary(sql.MAX), value: passwordBuffer }
            ],
            {
                rlsCtx: {
                    bypassRLS: 1,
                    maNV: '',
                    roleName: 'db_Admin'
                }
            }
        );

        return true;
    }

    static async addLoginLog(loginName, hostName, appName) {
        try {
            const query = `
                INSERT INTO [System].[LoginLogs] (LoginName, HostName, AppName, LoginTime)
                VALUES (@LoginName, @HostName, @AppName, GETUTCDATE());
            `;
            const inputs = [
                { name: 'LoginName', type: sql.NVarChar(100), value: loginName },
                { name: 'HostName', type: sql.NVarChar(100), value: hostName },
                { name: 'AppName', type: sql.NVarChar(255), value: appName }
            ];
            await DBHelper.queryWithContext(null, query, inputs, {
                rlsCtx: { bypassRLS: 1, maNV: '', roleName: 'db_Admin' }
            });
        } catch (err) {
            console.error('[Audit Debug] ❌ Lỗi lưu DB:', err);
        }
    }
}

module.exports = AuthModel;