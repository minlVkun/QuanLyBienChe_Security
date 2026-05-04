const rateLimit = require('express-rate-limit');
const AuditService = require('../modules/audit/audit.service');

const logBruteForce = async (req, action) => {
    try {
        await AuditService.logAction(
            { MaNV: 'SYSTEM' },
            {
                tableName: 'System.LoginLogs', // Hoặc System.AccessAudit
                action: action,
                recordID: req.ip,
                newData: {
                    ip: req.ip,
                    userAgent: req.headers['user-agent'],
                    body: req.body
                }
            }
        );
    } catch (err) {
        console.error('[RateLimit] Failed to log brute force attempt:', err);
    }
};

/**
 * Giới hạn Brute-force Login: tối đa 5 lần thử trong 15 phút cho mỗi IP
 */
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, 
    message: {
        success: false,
        message: "Bạn đã thử đăng nhập quá nhiều lần không thành công. Vui lòng đợi 15 phút trước khi thử lại."
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    handler: async (req, res, next, options) => {
        await logBruteForce(req, 'BRUTE_FORCE_LOGIN_ATTEMPT');
        res.status(options.statusCode).json(options.message);
    }
});

/**
 * Giới hạn Spam Quên mật khẩu: tối đa 3 lần trong 15 phút cho mỗi IP
 */
const forgotPasswordLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 3,
    message: {
        success: false,
        message: "Yêu cầu đặt lại mật khẩu quá dày đặc. Vui lòng kiểm tra email của bạn hoặc đợi 15 phút."
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: async (req, res, next, options) => {
        await logBruteForce(req, 'BRUTE_FORCE_FORGOT_PWD_ATTEMPT');
        res.status(options.statusCode).json(options.message);
    }
});

module.exports = {
    loginLimiter,
    forgotPasswordLimiter
};
