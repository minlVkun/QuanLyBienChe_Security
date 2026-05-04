const express = require('express');
const router = express.Router();

const authController = require('./auth.controller');
const { authorize } = require('../../middlewares/authMiddleware');
const rateLimit = require('express-rate-limit');

// Rate limit cho chức năng quên mật khẩu (chống spam mail)
const forgotPasswordLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 phút
    max: 5, // 5 lần thử
    message: { success: false, message: "Quá nhiều yêu cầu, vui lòng thử lại sau 15 phút." }
});

// Đăng nhập (Public — không cần token)
router.post('/login', authController.login);

// Xác thực lại để lấy Reveal Token (Public — giải quyết Deadlock khi token hết hạn)
router.post('/reauth', authController.reauth);

// Đổi mật khẩu (Protected — authorize() không truyền roles = mọi user đã đăng nhập)
// UserID được lấy từ req.user do server gán — không tin client tự khai
router.post('/change-password', authorize(), authController.changePassword);

// Quên & Đặt lại mật khẩu (Public)
router.post('/forgot-password', forgotPasswordLimiter, authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

module.exports = router;