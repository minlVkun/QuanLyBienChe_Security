const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');
const { authorize } = require('../../middlewares/authMiddleware');
const { loginLimiter, forgotPasswordLimiter } = require('../../middlewares/rateLimitMiddleware');

// Đăng nhập (Chống Brute-force)
router.post('/login', loginLimiter, authController.login);

// Xác thực lại để lấy Reveal Token (Giải quyết Deadlock khi token hết hạn)
router.post('/reauth', authController.reauth);

// Đổi mật khẩu (Protected - Yêu cầu đăng nhập)
router.post('/change-password', authorize(), authController.changePassword);

// Quên & Đặt lại mật khẩu (Chống Spam Email)
router.post('/forgot-password', forgotPasswordLimiter, authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

module.exports = router;