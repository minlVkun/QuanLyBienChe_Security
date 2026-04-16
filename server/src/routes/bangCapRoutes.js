const express = require('express');
const router = express.Router();

const bangCapController = require('../controllers/bangCapController');
const { authorize } = require('../middlewares/authMiddleware');
/**
 * 
 * @swagger
 * /api/degrees/{id}:
 *   get:
 *     summary: Lấy danh sách bằng cấp của nhân viên
 *     description: Nhân viên, HR và Admin đều có thể xem (RLS sẽ kiểm soát dữ liệu)
 *     tags: [Degrees]
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
 *         description: Danh sách bằng cấp
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   DegreeID:
 *                     type: integer
 *                   TenBangCap:
 *                     type: string
 *                   NoiCap:
 *                     type: string
 *                   NgayCap:
 *                     type: string
 */
/**
 * @swagger
 * /api/degrees:
 *   post:
 *     summary: Thêm bằng cấp cho nhân viên
 *     description: Chỉ Admin và HR được phép
 *     tags: [Degrees]
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
 *               TenBangCap:
 *                 type: string
 *               NoiCap:
 *                 type: string
 *               NgayCap:
 *                 type: string
 *     responses:
 *       201:
 *         description: Thêm thành công
 */
/**
 * @swagger
 * /api/degrees:
 *   post:
 *     summary: Thêm bằng cấp cho nhân viên
 *     description: Chỉ Admin và HR được phép
 *     tags: [Degrees]
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
 *               TenBangCap:
 *                 type: string
 *               NoiCap:
 *                 type: string
 *               NgayCap:
 *                 type: string
 *     responses:
 *       201:
 *         description: Thêm thành công
 */


// Nhân viên, HR, Admin đều có thể xem (RLS sẽ tự lọc nếu nhân viên xem người khác)
router.get('/:id', authorize(), bangCapController.getDegrees);

// Chỉ Admin và HR mới được thêm/xóa bằng cấp vào hồ sơ
router.post('/', authorize(['db_Admin', 'db_HR_Human']), bangCapController.addDegree);

// Chỉ Admin và HR mới được xóa bằng cấp khỏi hồ sơ
router.delete('/:id', authorize(['db_Admin', 'db_HR_Human']), bangCapController.deleteDegree);

module.exports = router;