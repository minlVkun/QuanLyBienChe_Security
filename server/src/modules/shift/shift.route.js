const express = require('express');
const router = express.Router();
const shiftController = require('./shift.controller');
const { authorize } = require('../../middlewares/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Shift
 *   description: Module Quản lý Ca làm việc (CaLamViec)
 */

router.get('/', authorize(['db_Admin', 'db_HR_Human', 'db_HR_Payroll', 'db_DeptHead']), shiftController.getAll);
router.get('/:id', authorize(['db_Admin', 'db_HR_Human', 'db_HR_Payroll']), shiftController.getById);

router.post('/', authorize(['db_Admin', 'db_HR_Human']), shiftController.create);
router.put('/:id', authorize(['db_Admin', 'db_HR_Human']), shiftController.update);
router.delete('/:id', authorize(['db_Admin', 'db_HR_Human']), shiftController.delete);

module.exports = router;
