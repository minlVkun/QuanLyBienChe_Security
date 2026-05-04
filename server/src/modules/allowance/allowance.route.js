const express = require('express');
const router = express.Router();
const allowanceController = require('./allowance.controller');
const { authorize } = require('../../middlewares/authMiddleware');

// Các quyền có thể quản lý phụ cấp: Admin, HR
const manageRoles = ['db_Admin', 'db_HR_Human'];

router.get('/employees/:id/allowances', authorize([...manageRoles, 'db_DeptHead']), allowanceController.getByEmployeeId);
router.post('/employees/:id/allowances', authorize(manageRoles), allowanceController.create);
router.put('/allowances/:id', authorize(manageRoles), allowanceController.update);
router.delete('/allowances/:id', authorize(manageRoles), allowanceController.delete);

module.exports = router;
