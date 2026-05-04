const express = require('express');
const router = express.Router();
const insuranceController = require('./insurance.controller');
const { authorize } = require('../../middlewares/authMiddleware');

router.get('/:id', authorize(['db_Admin', 'db_HR_Human', 'db_HR_Payroll']), insuranceController.getInsuranceDetail);
router.put('/:id', authorize(['db_Admin', 'db_HR_Payroll']), insuranceController.updateInsuranceInfo);

module.exports = router;
