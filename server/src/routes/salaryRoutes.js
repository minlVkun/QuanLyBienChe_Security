const express = require('express');
const router = express.Router();

const { authorize } = require('../middlewares/authMiddleware');
const salaryController = require('../controllers/salaryController');
const insuranceController = require('../controllers/insuranceController');
const insuranceLogController = require('../controllers/insuranceLogController');

/**
 * @swagger
 * /api/payroll/current/{id}:
 *   get:
 *     summary: Lấy lương hiện tại của nhân viên
 *     description: Mọi role có thể xem (RLS tự lọc)
 *     tags: [Payroll]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Mã nhân viên
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Thông tin lương hiện tại
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 MaNV:
 *                   type: integer
 *                 LuongCoBan:
 *                   type: number
 *                 HeSo:
 *                   type: number
 *                 TongLuong:
 *                   type: number
 *                 NgayApDung:
 *                   type: string
 *                   format: date
 */
/**
 * @swagger
 * /api/payroll/promote:
 *   post:
 *     summary: Tăng lương nhân viên
 *     description: Chỉ Admin và HR_Payroll
 *     tags: [Payroll]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               MaNV:
 *                 type: integer
 *               LuongMoi:
 *                 type: number
 *               NgayApDung:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Tăng lương thành công
 */
/**
 * @swagger
 * /api/payroll/insurance/{id}:
 *   get:
 *     summary: Lấy thông tin bảo hiểm
 *     tags: [Insurance]
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
 *         description: Thông tin bảo hiểm
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 MaNV:
 *                   type: integer
 *                 SoBHXH:
 *                   type: string
 *                 NoiCap:
 *                   type: string
 *                 NgayCap:
 *                   type: string
 *                   format: date
 */
/**
 * @swagger
 * /api/payroll/insurance/{id}:
 *   put:
 *     summary: Cập nhật thông tin bảo hiểm
 *     tags: [Insurance]
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
 *               SoBHXH:
 *                 type: string
 *               NoiCap:
 *                 type: string
 *               NgayCap:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 */
/**
 * @swagger
 * /api/payroll/insurance-logs/{id}:
 *   get:
 *     summary: Lịch sử đóng bảo hiểm
 *     tags: [Insurance]
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
 *         description: Danh sách lịch sử đóng bảo hiểm
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   Thang:
 *                     type: string
 *                   SoTienDong:
 *                     type: number
 *                   TrangThai:
 *                     type: string
 */
/**
 * @swagger
 * /api/payroll/scales:
 *   get:
 *     summary: Lấy danh sách thang lương
 *     description: Chỉ Admin và HR_Payroll
 *     tags: [Payroll]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách thang lương
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   BacLuong:
 *                     type: integer
 *                   LuongCoBan:
 *                     type: number
 *                   HeSo:
 *                     type: number
 *       403:
 *         description: Không có quyền truy cập
 */
// Xem lương: Mọi role (RLS tự lọc), Nâng lương: Chỉ Admin/Payroll 
router.get('/current', authorize(), salaryController.getCurrentSalaries);
router.post('/promote', authorize(['db_Admin', 'db_HR_Payroll']), salaryController.promoteSalary);
// Route lấy danh mục ngạch lương
router.get('/scales', authorize(), salaryController.getSalaryScales);

// Thông tin bảo hiểm của nhân viên: Mọi role (RLS tự lọc), Cập nhật thông tin bảo hiểm: Chỉ Admin/Payroll
router.get('/insurance/:id', authorize(), insuranceController.getInsuranceDetail);
router.put('/insurance/:id', authorize(['db_Admin', 'db_HR_Payroll']), insuranceController.updateInsuranceInfo);

// Lịch sử đóng bảo hiểm 
router.get('/insurance-logs/:id', authorize(), insuranceLogController.getContributionHistory);

module.exports = router;
