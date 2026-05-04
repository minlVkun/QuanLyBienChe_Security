const express = require('express');
const router = express.Router();
const auditController = require('./audit.controller');
const { authorize } = require('../../middlewares/authMiddleware');

/**
 * @swagger
 * /api/audit:
 *   get:
 *     summary: Lấy toàn bộ nhật ký hệ thống
 *     description: Chỉ Admin được phép truy cập
 *     tags: [Audit]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách log hệ thống
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   LogID:
 *                     type: integer
 *                   Action:
 *                     type: string
 *                   UserID:
 *                     type: integer
 *                   Timestamp:
 *                     type: string
 */
/**
 * @swagger
 * /api/audit/{id}:
 *   get:
 *     summary: Lấy chi tiết log
 *     description: Chỉ Admin được phép truy cập
 *     tags: [Audit]
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
 *         description: Chi tiết log
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 LogID:
 *                   type: integer
 *                 Action:
 *                   type: string
 *                 Description:
 *                   type: string
 *                 Timestamp:
 *                   type: string
 */

// Chỉ cho phép Admin tối cao truy cập để giám sát hệ thống
router.get('/', authorize(['db_Admin']), auditController.getAllLogs);
router.get('/:id', authorize(['db_Admin']), auditController.getLogDetail);

module.exports = router;