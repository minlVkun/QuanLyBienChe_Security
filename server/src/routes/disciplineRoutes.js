const express = require('express');
const router = express.Router();

const disciplineController = require('../controllers/disciplineController');
const { authorize } = require('../middlewares/authMiddleware');

/**
 * @swagger
 * /api/discipline/{id}:
 *   get:
 *     summary: Lấy danh sách khen thưởng/kỷ luật của nhân viên
 *     description: Mọi role có thể truy cập (RLS sẽ tự lọc dữ liệu)
 *     tags: [Discipline]
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
 *         description: Danh sách quyết định
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   RecordID:
 *                     type: integer
 *                   Loai:
 *                     type: string
 *                     description: Khen thưởng hoặc Kỷ luật
 *                   NoiDung:
 *                     type: string
 *                   NgayQuyetDinh:
 *                     type: string
 *                     format: date
 */
/**
 * @swagger
 * /api/discipline:
 *   post:
 *     summary: Thêm quyết định khen thưởng/kỷ luật
 *     description: Chỉ Admin và HR_Human được phép
 *     tags: [Discipline]
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
 *               Loai:
 *                 type: string
 *                 example: Khen thưởng
 *               NoiDung:
 *                 type: string
 *               NgayQuyetDinh:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Thêm thành công
 */

// Xem danh sách KTKL: Cho phép mọi role (nhưng RLS sẽ lọc dòng dựa trên MaNV/Phòng ban)
router.get('/:id', authorize(), disciplineController.getDisciplineRecords);

// Thêm quyết định mới: Chỉ Admin và HR_Human mới có quyền thực hiện
router.post('/', authorize(['db_Admin', 'db_HR_Human']), disciplineController.addDisciplineRecord);

module.exports = router;