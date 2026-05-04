const AuthModel = require('./auth.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { authSchema, changePasswordSchema, formatZodError } = require('./auth.validation');
const mailHelper = require('../../utils/mailHelper');

class AuthService {
    static async login(username, password) {
        const validationResult = authSchema.safeParse({ username, password });
        if (!validationResult.success) {
            const err = new Error(formatZodError(validationResult.error));
            err.statusCode = 400;
            throw err;
        }

        const user = await AuthModel.getUserByUsername(validationResult.data.username);
        if (!user) {
            const err = new Error('Tên đăng nhập hoặc mật khẩu không đúng');
            err.statusCode = 401;
            throw err;
        }

        if (user.TrangThai === -1) {
            const err = new Error('Tài khoản đã bị khóa');
            err.statusCode = 403;
            throw err;
        }

        const dbHash = user.PasswordHash.toString('utf-8').replace(/\0/g, '').trim();
        const isMatch = await bcrypt.compare(password, dbHash);

        if (!isMatch) {
            const err = new Error('Tên đăng nhập hoặc mật khẩu không đúng');
            err.statusCode = 401;
            throw err;
        }

        const payload = {
            UserID: user.UserID,
            jti: crypto.randomUUID()
        };

        const token = jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

        return {
            token,
            user: {
                username: user.Username,
                role: user.RoleName,
                MaNV: user.MaNV
            }
        };
    }

    static async reauth(username, password) {
        if (!username) {
            const err = new Error('Thiếu tên đăng nhập');
            err.statusCode = 400;
            throw err;
        }
        
        const user = await AuthModel.getUserByUsername(username);
        if (!user) {
            const err = new Error('Người dùng không tồn tại');
            err.statusCode = 401;
            throw err;
        }

        const dbHash = user.PasswordHash.toString('utf-8').replace(/\0/g, '').trim();
        const isMatch = await bcrypt.compare(password, dbHash);

        if (!isMatch) {
            const err = new Error('Mật khẩu không đúng');
            err.statusCode = 401;
            throw err;
        }

        const payload = {
            UserID: user.UserID,
            jti: crypto.randomUUID(),
            isReveal: true
        };

        const revealToken = jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '5m' }
        );

        return revealToken;
    }

    /**
     * Đổi mật khẩu (Change Password).
     * Yêu cầu: req.user phải được set bởi authorize() middleware trước khi gọi.
     *
     * Flow bảo mật:
     *   1. Validate input (Zod) — phát hiện sớm lỗi payload
     *   2. Fetch user hiện tại từ DB (không dùng cache)
     *   3. bcrypt.compare oldPassword vs stored hash (chống brute-force)
     *   4. bcrypt.hash newPassword với salt=12
     *   5. Lưu vào DB qua AuthModel.updatePassword (Atomic Batch + SystemAuth)
     *
     * @param {number} userID - Lấy từ req.user.UserID (server-side, không từ client)
     * @param {string} oldPassword
     * @param {string} newPassword
     */
    static async changePassword(userID, oldPassword, newPassword) {
        // Bước 1: Validate input
        const validationResult = changePasswordSchema.safeParse({ oldPassword, newPassword });
        if (!validationResult.success) {
            const err = new Error(formatZodError(validationResult.error));
            err.statusCode = 400;
            throw err;
        }

        // Bước 2: Fetch current user từ DB (username từ req.user.UserID)
        // AuthModel.getUserByUsername cần username — ta JOIN ngược từ UserID
        const pool = (await require('../../config/db').poolPromise);
        const result = await pool.request()
            .input('UserID', require('../../config/db').sql.Int, userID)
            .query(`
                EXEC sp_set_session_context @key = N'SystemAuth', @value = 1, @read_only = 0;
                SELECT UserID, PasswordHash, TrangThai FROM [System].[User] WHERE UserID = @UserID;
                EXEC sp_set_session_context @key = N'SystemAuth', @value = 0, @read_only = 0;
            `);

        const user = result.recordset[0];
        if (!user) {
            const err = new Error('Người dùng không tồn tại');
            err.statusCode = 404;
            throw err;
        }

        // Bước 3: So sánh mật khẩu cũ
        const dbHash = user.PasswordHash.toString('utf-8').replace(/\0/g, '').trim();
        const isMatch = await bcrypt.compare(oldPassword, dbHash);
        if (!isMatch) {
            const err = new Error('Mật khẩu cũ không chính xác');
            err.statusCode = 400;
            throw err;
        }

        // Bước 4 & 5: Hash mật khẩu mới và lưu
        const salt = await bcrypt.genSalt(12);
        const hashedNew = await bcrypt.hash(newPassword, salt);
        const passwordBuffer = Buffer.from(hashedNew, 'utf-8');

        await AuthModel.updatePassword(userID, passwordBuffer);
    }

    static async forgotPassword(email) {
        if (!email) throw new Error("Vui lòng nhập email!");
        
        const user = await AuthModel.getUserByEmail(email);
        if (!user) {
            return { success: true, message: "Nếu email tồn tại trong hệ thống, bạn sẽ nhận được liên kết đặt lại mật khẩu." };
        }

        const rawToken = crypto.randomBytes(32).toString('hex');
        // Hash token trước khi lưu vào DB (Security Warning Fix)
        const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
        
        await AuthModel.saveResetToken(user.UserID, hashedToken);
        
        // Gửi email với rawToken
        await mailHelper.sendResetPasswordEmail(email, rawToken);

        return { success: true, message: "Nếu email tồn tại trong hệ thống, bạn sẽ nhận được liên kết đặt lại mật khẩu." };
    }

    static async resetPassword(rawToken, newPassword) {
        if (!rawToken || !newPassword) throw new Error("Thông tin không hợp lệ!");

        // Hash rawToken để so khớp với DB
        const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

        const resetData = await AuthModel.getUserByResetToken(hashedToken);
        if (!resetData) {
            const err = new Error("Token không hợp lệ hoặc đã hết hạn!");
            err.statusCode = 400; throw err;
        }

        const salt = await bcrypt.genSalt(12);
        const hashedNew = await bcrypt.hash(newPassword, salt);
        const passwordBuffer = Buffer.from(hashedNew, 'utf-8');

        await AuthModel.updatePassword(resetData.UserID, passwordBuffer);
        await AuthModel.markTokenUsed(hashedToken);

        return { success: true, message: "Đặt lại mật khẩu thành công!" };
    }
    static async logLogin(loginName, hostName, appName) {
        // Chạy bất đồng bộ (Fire-and-forget), không đợi kết quả trả về
        AuthModel.addLoginLog(loginName, hostName, appName);
    }
}

module.exports = AuthService;
