//src/routes/nhanVienRoutes.js
const express = require('express');
const router = express.Router();

const nhanVienController = require('../controllers/nhanVienController');
const { authorize } = require('../middlewares/authMiddleware');
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
 */// Các route cho nhân viên
router.get('/', authorize(), nhanVienController.getAllEmployees); // Cho phép tất cả các role đã xác thực truy cập
router.get('/:id', authorize(), nhanVienController.getEmployeeById); // Cho phép tất cả các role đã xác thực truy cập
router.post('/', authorize(['db_Admin', 'db_HR_Human']), nhanVienController.addEmployee); // Chỉ cho phép Admin và HR_Human tạo mới nhân viên
router.put('/:id', authorize(['db_Admin', 'db_HR_Human']), nhanVienController.updateEmployee); // Chỉ cho phép Admin và HR_Human cập nhật thông tin nhân viên
router.delete('/:id', authorize(['db_Admin', 'db_HR_Human']), nhanVienController.deleteEmployee); // Chỉ cho phép Admin và HR_Human xóa nhân viên


module.exports = router;