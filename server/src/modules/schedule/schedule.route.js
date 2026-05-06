// src/modules/schedule/schedule.route.js
const express = require('express');
const router = express.Router();
const scheduleController = require('./schedule.controller');
const { authorize } = require('../../middlewares/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Schedule
 *   description: Module Quản lý Lịch làm việc (Phân ca)
 */

// Đọc danh sách — Admin, HR, Trưởng phòng đều được xem
router.get(
    '/',
    authorize(['db_Admin', 'db_HR_Human', 'db_HR_Payroll', 'db_DeptHead']),
    scheduleController.getAll
);

// Đọc chi tiết 1 lịch
router.get(
    '/:id',
    authorize(['db_Admin', 'db_HR_Human', 'db_HR_Payroll', 'db_DeptHead']),
    scheduleController.getById
);

// Tạo lịch đơn lẻ
router.post(
    '/',
    authorize(['db_Admin', 'db_HR_Human']),
    scheduleController.create
);

// Phân ca hàng loạt
router.post(
    '/bulk',
    authorize(['db_Admin', 'db_HR_Human']),
    scheduleController.bulkAssign
);

// Cập nhật lịch
router.put(
    '/:id',
    authorize(['db_Admin', 'db_HR_Human']),
    scheduleController.update
);

// Xóa lịch
router.delete(
    '/:id',
    authorize(['db_Admin', 'db_HR_Human']),
    scheduleController.delete
);

module.exports = router;
