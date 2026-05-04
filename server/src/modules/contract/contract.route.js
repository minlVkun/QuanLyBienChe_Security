const express = require('express');
const router = express.Router();
const contractController = require('./contract.controller');
const { authorize } = require('../../middlewares/authMiddleware');
const { rlsMiddleware } = require('../../middlewares/rlsMiddleware');
const uploadContractMiddleware = require('../../middlewares/uploadMiddleware');

// Phân quyền: Payroll chỉ được xem, Admin và HR được quản lý
const viewRoles = ['db_Admin', 'db_HR_Human', 'db_HR_Payroll'];
const manageRoles = ['db_Admin', 'db_HR_Human'];

router.get('/', authorize(viewRoles), rlsMiddleware, contractController.getAllContracts);
router.get('/generate-code', authorize(manageRoles), rlsMiddleware, contractController.generateCode);
router.get('/employee/:employeeId', authorize(viewRoles), rlsMiddleware, contractController.getContractsByEmployeeId);
router.get('/download/:filename', authorize(viewRoles), rlsMiddleware, contractController.downloadContractFile);

// Tích hợp middleware upload -> auth -> rls -> controller
router.post(
    '/', 
    authorize(manageRoles), 
    rlsMiddleware, 
    uploadContractMiddleware, 
    contractController.createContract
);

router.put(
    '/:id',
    authorize(manageRoles),
    rlsMiddleware,
    uploadContractMiddleware,
    contractController.updateContract
);

router.delete(
    '/:id',
    authorize(manageRoles),
    rlsMiddleware,
    contractController.deleteContract
);

module.exports = router;
