// src/routes/salaryRoutes.js
const express = require('express');
const router = express.Router();
const salaryController = require('./salary.controller');
const { authorize } = require('../../middlewares/authMiddleware');

/**
 * @swagger
 * tags:
 *   - name: Salary
 *     description: Module Quản lý Tiền lương & Ngạch Bậc
 */

/**
 * @swagger
 * /api/salary/scales:
 *   get:
 *     summary: Lấy danh mục ngạch bậc lương
 *     tags: [Salary]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Thành công
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 - MaNgach: "01.004"
 *                   BacLuong: 1
 *                   HeSo: 2.34
 */
router.get('/scales', authorize(['db_Admin', 'db_HR_Payroll', 'db_DeptHead', 'db_HR_Human']), salaryController.getScales);

/**
 * @swagger
 * /api/salary/history/{maNV}:
 *   get:
 *     summary: Xem lịch sử lương (có phân trang)
 *     tags: [Salary]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: maNV
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Số trang
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Số bản ghi mỗi trang
 *     responses:
 *       200:
 *         description: Thành công
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               page: 1
 *               limit: 10
 *               total: 5
 *               data:
 *                 - MaNV: "NV001"
 *                   LuongCu: 4000000
 *                   LuongMoi: 5000000
 *                   NgayApDung: "2026-01-01"
 */
router.get('/history/:maNV', authorize(['db_Admin', 'db_HR_Payroll', 'db_DeptHead', 'db_HR_Human']), salaryController.getHistory);

/**
 * @swagger
 * /api/salary/current/{maNV}:
 *   get:
 *     summary: Lấy lương hiện tại
 *     tags: [Salary]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: maNV
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Thành công
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 MaNV: "NV001"
 *                 LuongCoBan: 5000000
 *                 HeSo: 2.34
 *                 TongLuong: 11700000
 */
router.get('/current/:maNV', authorize(['db_Admin', 'db_HR_Payroll', 'db_DeptHead', 'db_HR_Human']), salaryController.getCurrentSalary);

/**
 * @swagger
 * /api/salary/payroll:
 *   get:
 *     summary: Lấy bảng lương (phân trang + tìm kiếm)
 *     tags: [Salary]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Số trang
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Số lượng mỗi trang
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Tìm kiếm theo mã NV / tên NV
 *       - in: query
 *         name: thangNam
 *         schema:
 *           type: string
 *           example: "04/2026"
 *         description: Tháng/Năm
 *       - in: query
 *         name: maDonVi
 *         schema:
 *           type: string
 *         description: Mã đơn vị
 *     responses:
 *       200:
 *         description: Thành công
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               total: 100
 *               page: 1
 *               limit: 10
 *               data:
 *                 - MaNV: "NV001"
 *                   HoTen: "Nguyen Van A"
 *                   LuongCoBan: 5000000
 *                   TongLuong: 6000000
 *                   ThangNam: "04/2026"
 *       403:
 *         description: Không có quyền truy cập
 */
router.get(
  '/payroll',
  authorize(['db_Admin', 'db_HR_Payroll', 'db_DeptHead', 'db_HR_Human']),
  salaryController.getPayroll
);

/**
 * @swagger
 * /api/salary/payroll/{maNV}:
 *   get:
 *     summary: Xem phiếu lương cá nhân
 *     tags: [Salary]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: maNV
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Thành công
 */
router.get('/payroll/:maNV', authorize([]), salaryController.getPersonalPayslips);

/**
 * @swagger
 * /api/salary/promote:
 *   post:
 *     summary: Nâng bậc lương
 *     tags: [Salary]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             maNV: "NV001"
 *             maNgach: "01.004"
 *             bacLuong: 2
 *             ngayHuong: "2026-04-16"
 *             ghiChu: "Nâng bậc định kỳ"
 *     responses:
 *       200:
 *         description: Thành công
 */
router.post(
  '/promote',
  authorize(['db_Admin', 'db_HR_Payroll']),
  salaryController.promoteSalary
);

/**
 * @swagger
 * /api/salary/monthly:
 *   post:
 *     summary: Chốt lương cá nhân (nhập tay)
 *     tags: [Salary]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             maNhanVien: "NV001"
 *             thang: 4
 *             nam: 2026
 *             heSoLuong: 2.34
 *             luongCoBan: 2340000
 *             phuCap: 500000
 *             khauTru: 0
 *     responses:
 *       200:
 *         description: Thành công
 */
router.post(
  '/monthly',
  authorize(['db_Admin', 'db_HR_Payroll']),
  salaryController.createMonthlySalary
);

router.post(
  '/preview',
  authorize(['db_Admin', 'db_HR_Payroll']),
  salaryController.calculatePreview
);

/**
 * @swagger
 * /api/salary/payroll/generate:
 *   post:
 *     summary: Chốt bảng lương tháng
 *     tags: [Salary]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             thangNam: "04/2026"
 *     responses:
 *       200:
 *         description: Thành công
 *       409:
 *         description: Đã tồn tại
 */
router.post('/payroll/generate', authorize(['db_Admin', 'db_HR_Payroll']), salaryController.generatePayroll);

/**
 * @swagger
 * /api/salary/payroll/{id}:
 *   put:
 *     summary: Cập nhật bản ghi lương (Phụ cấp, khấu trừ)
 *     tags: [Salary]
 *   delete:
 *     summary: Xóa bản ghi lương
 *     tags: [Salary]
 */
router.put('/payroll/:id', authorize(['db_Admin', 'db_HR_Payroll']), salaryController.updatePayroll);
router.delete('/payroll/:id', authorize(['db_Admin', 'db_HR_Payroll']), salaryController.deletePayroll);

// --- QUẢN LÝ NGẠCH LƯƠNG ---
router.post('/scales', authorize(['db_Admin', 'db_HR_Human']), salaryController.createScale);
router.put('/scales/:id', authorize(['db_Admin', 'db_HR_Human']), salaryController.updateScale);
router.delete('/scales/:id', authorize(['db_Admin', 'db_HR_Human']), salaryController.deleteScale);

// --- QUẢN LÝ BẬC LƯƠNG ---
router.post('/steps', authorize(['db_Admin', 'db_HR_Human']), salaryController.addStep);
router.delete('/steps/:maNgach/:bacLuong', authorize(['db_Admin', 'db_HR_Human']), salaryController.deleteStep);

module.exports = router;