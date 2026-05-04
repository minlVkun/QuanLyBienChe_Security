const LoginLogService = require('./loginLog.service');

class LoginLogController {
    static async getLogs(req, res) {
        try {
            const result = await LoginLogService.getLogs(req.user, req.query);
            res.json({
                success: true,
                ...result
            });
        } catch (error) {
            console.error('[LoginLogController] Error:', error);
            res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Lỗi hệ thống khi lấy log đăng nhập"
            });
        }
    }
}

module.exports = LoginLogController;
