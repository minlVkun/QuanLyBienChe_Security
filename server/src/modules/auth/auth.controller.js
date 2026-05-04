const AuthService = require('./auth.service');

const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const result = await AuthService.login(username, password);

        res.json({
            success: true,
            data: result,
            message: "Đăng nhập thành công"
        }); 
    } catch (error) {
        console.error('Error during login:', error);
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || 'Có lỗi xảy ra trong quá trình đăng nhập'
        });
    }
};

const reauth = async (req, res) => {
    try {
        const { username, password } = req.body;
        const revealToken = await AuthService.reauth(username, password);

        res.json({
            success: true,
            message: 'Xác thực thành công',
            revealToken
        });
    } catch (error) {
        console.error('Error during reauth:', error);
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || 'Có lỗi xảy ra trong quá trình xác thực'
        });
    }
};

/**
 * POST /api/auth/change-password
 * Yêu cầu: Token hợp lệ (authorize() middleware gắn req.user)
 * UserID lấy từ req.user — không tin client tự khai.
 */
const changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        await AuthService.changePassword(req.user.UserID, oldPassword, newPassword);

        res.json({
            success: true,
            message: 'Password changed successfully'
        });
    } catch (error) {
        console.error('Error during changePassword:', error);
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || 'Có lỗi xảy ra khi đổi mật khẩu'
        });
    }
};

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const result = await AuthService.forgotPassword(email);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        const result = await AuthService.resetPassword(token, newPassword);
        res.json(result);
    } catch (error) {
        const code = error.statusCode || 500;
        res.status(code).json({ success: false, message: error.message });
    }
};

module.exports = { login, reauth, changePassword, forgotPassword, resetPassword };