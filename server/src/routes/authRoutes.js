const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Đăng nhập hệ thống
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: admin
 *               password:
 *                 type: string
 *                 example: 123456
 *     responses:
 *       200:
 *         description: Đăng nhập thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 user:
 *                   type: object
 *                   properties:
 *                     UserID:
 *                       type: integer
 *                     Username:
 *                       type: string
 *                     HoTen:
 *                       type: string
 *                     role:
 *                       type: string
 *       401:
 *         description: Sai tài khoản hoặc mật khẩu
 */
// Đăng nhập
router.post('/login', authController.login);

module.exports = router;