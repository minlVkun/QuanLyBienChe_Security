const express = require('express');
const router = express.Router();

const workHistoryController = require('../controllers/workHistoryController');
const { authorize } = require('../middlewares/authMiddleware');

/**
 * @swagger
 * /api/work-history/{id}:
 *   get:
 *     summary: Lấy lịch sử công tác của nhân viên
 *     description: Mọi role có thể xem (RLS tự lọc dữ liệu)
 *     tags: [WorkHistory]
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
 *         description: Danh sách quá trình công tác
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   TuNgay:
 *                     type: string
 *                     format: date
 *                   DenNgay:
 *                     type: string
 *                     format: date
 *                     nullable: true
 *                   TenDonVi:
 *                     type: string
 *                   TenChucVu:
 *                     type: string
 *                   NoiDung:
 *                     type: string
 */
/**
 * @swagger
 * /api/work-history:
 *   post:
 *     summary: Thêm quá trình công tác
 *     description: Chỉ Admin và HR_Human được phép
 *     tags: [WorkHistory]
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
 *               TuNgay:
 *                 type: string
 *                 format: date
 *               DenNgay:
 *                 type: string
 *                 format: date
 *               MaDonVi:
 *                 type: integer
 *               MaChucVu:
 *                 type: integer
 *               NoiDung:
 *                 type: string
 *     responses:
 *       201:
 *         description: Thêm thành công
 */

// GET: Xem lịch sử (Mọi role, nhưng bị lọc bởi RLS)
router.get('/:id', authorize(), workHistoryController.getWorkHistory);

// POST: Thêm mới (Chỉ Admin và HR_Human)
router.post('/', authorize(['db_Admin', 'db_HR_Human']), workHistoryController.addWorkHistory);

module.exports = router;