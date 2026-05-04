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
        const pool = await poolPromise;

        // BẢO MẬT: Dùng Atomic Batch với SystemAuth=1 để bypass RLS khi JOIN HR.NhanVien.
        // Nếu không có SystemAuth=1, RLS policy trên HR.NhanVien sẽ lọc bỏ dòng nhân viên
        // (vì SESSION_CONTEXT(N'MaNV') chưa được gán tại thời điểm login) → MaNV = NULL.
        // SystemAuth được đặt lại về 0 ngay sau SELECT trên CÙNG connection (Atomic Batch).
        const result = await pool.request()
            .input('Username', sql.NVarChar(100), username)
            .query(`
                EXEC sp_set_session_context @key = N'SystemAuth', @value = 1, @read_only = 0;

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

                EXEC sp_set_session_context @key = N'SystemAuth', @value = 0, @read_only = 0;
            `);

        // sp_set_session_context không trả về recordset, nên SELECT là recordset đầu tiên
        return result.recordset[0];
    }

    static async getUserByEmail(email) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('Email', sql.VarChar(100), email)
            .query(`
                EXEC sp_set_session_context @key = N'SystemAuth', @value = 1, @read_only = 0;
                SELECT u.UserID, u.Username, n.MaNV 
                FROM [System].[User] u
                JOIN [HR].[NhanVien] n ON u.UserID = n.UserID
                WHERE n.Email = @Email;
                EXEC sp_set_session_context @key = N'SystemAuth', @value = 0, @read_only = 0;
            `);
        return result.recordset[0];
    }

    static async saveResetToken(userId, token, expiryMinutes = 30) {
        const pool = await poolPromise;
        const expiryDate = new Date();
        expiryDate.setMinutes(expiryDate.getMinutes() + expiryMinutes);

        await pool.request()
            .input('UserID', sql.Int, userId)
            .input('Token', sql.VarChar(255), token)
            .input('ExpiryDate', sql.DateTime, expiryDate)
            .query(`
                INSERT INTO System.ResetTokens (UserID, Token, ExpiryDate)
                VALUES (@UserID, @Token, @ExpiryDate);
            `);
    }

    static async getUserByResetToken(token) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('Token', sql.VarChar(255), token)
            .query(`
                SELECT UserID FROM System.ResetTokens 
                WHERE Token = @Token AND IsUsed = 0 AND ExpiryDate > GETDATE();
            `);
        return result.recordset[0];
    }

    static async markTokenUsed(token) {
        const pool = await poolPromise;
        await pool.request()
            .input('Token', sql.VarChar(255), token)
            .query(`UPDATE System.ResetTokens SET IsUsed = 1 WHERE Token = @Token;`);
    }

    /**
     * Cập nhật mật khẩu của người dùng theo UserID.
     * Sử dụng Atomic Batch + SystemAuth để bypass RLS khi UPDATE [System].[User].
     *
     * @param {number} userID
     * @param {Buffer} passwordBuffer - bcrypt hash được encode thành Buffer UTF-8
     */
    static async updatePassword(userID, passwordBuffer) {
        const pool = await poolPromise;

        await pool.request()
            .input('UserID', sql.Int, userID)
            .input('PasswordHash', sql.VarBinary(sql.MAX), passwordBuffer)
            .query(`
                EXEC sp_set_session_context @key = N'SystemAuth', @value = 1, @read_only = 0;

                UPDATE [System].[User]
                SET PasswordHash = @PasswordHash
                WHERE UserID = @UserID;

                EXEC sp_set_session_context @key = N'SystemAuth', @value = 0, @read_only = 0;
            `);

        return true;
    }
}

module.exports = AuthModel;