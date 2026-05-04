const express = require('express');
const router = express.Router();
const insuranceLogController = require('./insuranceLog.controller');
const { authorize } = require('../../middlewares/authMiddleware');

router.get('/:id', authorize(['db_Admin', 'db_HR_Human', 'db_HR_Payroll']), insuranceLogController.getContributionHistory);

module.exports = router;
