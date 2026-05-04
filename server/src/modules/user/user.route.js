const express = require('express');
const router = express.Router();
const { getUsers, updateUserInfo, resetPassword } = require('./user.controller');
const { authorize } = require('../../middlewares/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Quản lý tài khoản người dùng (Admin only)
 */

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Lấy danh sách tài khoản (có phân trang + tìm kiếm)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           example: 1
 *         description: Số trang
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 10
 *         description: Số lượng mỗi trang
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *           example: admin
 *         description: Tìm kiếm theo username/email
 *     responses:
 *       200:
 *         description: Thành công
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data: [
 *                 {
 *                   UserID: 1,
 *                   Username: "admin",
 *                   Role: "db_Admin",
 *                   TrangThai: 1
 *                 }
 *               ]
 *       403:
 *         description: Không có quyền truy cập
 */

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Cập nhật Role và Trạng thái user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID của user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             Role: "db_HR_Human"
 *             TrangThai: 1
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Cập nhật thành công"
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       403:
 *         description: Không có quyền
 */

/**
 * @swagger
 * /api/users/{id}/reset-password:
 *   post:
 *     summary: Đặt lại mật khẩu user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID của user
 *     responses:
 *       200:
 *         description: Reset mật khẩu thành công
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Reset mật khẩu thành công"
 *       403:
 *         description: Không có quyền
 */
// 1. Lấy danh sách tài khoản (Chỉ Admin)
router.get('/', authorize(['db_Admin']), getUsers);

// 2. Cập nhật quyền và trạng thái
router.put('/:id', authorize(['db_Admin']), updateUserInfo);

// 3. Reset mật khẩu
router.post('/:id/reset-password', authorize(['db_Admin']), resetPassword);

module.exports = router;