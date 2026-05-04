const express = require('express');
const router = express.Router();

const departmentController = require('./department.controller');
const { authorize } = require('../../middlewares/authMiddleware');

/**
 * @swagger
 * /api/departments:
 *   get:
 *     summary: Lấy sơ đồ tổ chức
 *     description: Admin, HR và Trưởng phòng có thể xem
 *     tags: [Departments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách đơn vị (có thể dạng cây)
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   MaDonVi:
 *                     type: integer
 *                   TenDonVi:
 *                     type: string
 *                   MaDonViCha:
 *                     type: integer
 *                     nullable: true
 *                   TruongPhong:
 *                     type: string
 */
/**
 * @swagger
 * /api/departments/{id}/head:
 *   put:
 *     summary: Cập nhật trưởng phòng
 *     description: Chỉ Admin và HR được phép
 *     tags: [Departments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Mã đơn vị
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               MaTruongPhong:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 */

// Xem sơ đồ tổ chức: Cho phép Admin, HR và Trưởng phòng xem để biết cấu trúc
router.get('/', authorize(), departmentController.getOrgChart);

// Quản lý đơn vị: CHỈ Admin tối cao hoặc HR chuyên trách mới được thực hiện
router.post('/', authorize(['db_Admin', 'db_HR_Human']), departmentController.create);
router.put('/:id', authorize(['db_Admin', 'db_HR_Human']), departmentController.update);
router.delete('/:id', authorize(['db_Admin', 'db_HR_Human']), departmentController.delete);

// Cập nhật trưởng phòng
router.get('/:id/head', authorize(), departmentController.getDeptHead);
router.put('/:id/head', authorize(['db_Admin', 'db_HR_Human']), departmentController.changeDeptHead);

module.exports = router;