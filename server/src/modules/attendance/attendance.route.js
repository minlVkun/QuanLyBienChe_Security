const express = require('express');
const router = express.Router();
const attendanceController = require('./attendance.controller');
const { authorize } = require('../../middlewares/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Attendance
 *   description: Module Quản lý Chấm công
 */

// 1. Employee self-service (Mọi nhân viên đã đăng nhập)
router.post('/check', authorize(), attendanceController.checkInOut);
router.get('/history/:maNV', authorize(), attendanceController.getHistory);

// 2. Admin & HR Management
// Lấy danh sách chấm công toàn hệ thống (có filter)
router.get('/', authorize(['db_Admin', 'db_HR_Human', 'db_HR_Payroll', 'db_DeptHead']), attendanceController.getAll);

// Sửa dữ liệu chấm công (Chỉ Admin và HR Human)
router.put('/:id', authorize(['db_Admin', 'db_HR_Human']), attendanceController.updateManual);

// Xuất Excel
router.post('/export', authorize(['db_Admin', 'db_HR_Human', 'db_HR_Payroll']), attendanceController.exportExcel);

module.exports = router;
