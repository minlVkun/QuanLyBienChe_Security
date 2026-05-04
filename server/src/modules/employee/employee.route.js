//src/routes/employeeRoutes.js
const express = require('express');
const router = express.Router();

const employeeController = require('./employee.controller');
const { authorize } = require('../../middlewares/authMiddleware');
const { rlsMiddleware } = require('../../middlewares/rlsMiddleware');

/**
 * @swagger
 * /api/employees:
 *   get:
 *     summary: Lấy danh sách nhân viên
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách nhân viên
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   MaNV:
 *                     type: integer
 *                   HoTen:
 *                     type: string
 *                   Email:
 *                     type: string
 *                   Role:
 *                     type: string
 */
/**
 * @swagger
 * /api/employees/{id}:
 *   get:
 *     summary: Lấy thông tin nhân viên theo ID
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Thông tin nhân viên
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 MaNV:
 *                   type: integer
 *                 HoTen:
 *                   type: string
 *                 Email:
 *                   type: string
 */
/**
 * @swagger
 * /api/employees:
 *   post:
 *     summary: Thêm nhân viên
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               HoTen:
 *                 type: string
 *               Email:
 *                 type: string
 *               Password:
 *                 type: string
 *               Role:
 *                 type: string
 *     responses:
 *       201:
 *         description: Tạo nhân viên thành công
 */
/**
 * @swagger
 * /api/employees/{id}:
 *   put:
 *     summary: Cập nhật nhân viên
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               HoTen:
 *                 type: string
 *               Email:
 *                 type: string
 *               Role:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 */
/**
 * @swagger
 * /api/employees/{id}:
 *   delete:
 *     summary: Xóa nhân viên
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Xóa nhân viên thành công
 *       403:
 *         description: Không có quyền truy cập
 *       404:
 *         description: Không tìm thấy nhân viên
 */
// Các route cho nhân viên
// authorize() → xác thực JWT + nạp req.user từ DB
// rlsMiddleware → tính RLS flags và gắn vào req.user.rlsContext
// controller → nhận req với req.user đầy đủ (bao gồm rlsContext)
router.get('/', authorize(), rlsMiddleware, employeeController.getAllEmployees);
router.get('/:id', authorize(), rlsMiddleware, employeeController.getEmployeeById);
router.post('/', authorize(['db_Admin', 'db_HR_Human']), rlsMiddleware, employeeController.addEmployee);
router.put('/:id', authorize(['db_Admin', 'db_HR_Human']), rlsMiddleware, employeeController.updateEmployee);
router.delete('/:id', authorize(['db_Admin', 'db_HR_Human']), rlsMiddleware, employeeController.deleteEmployee);

module.exports = router;