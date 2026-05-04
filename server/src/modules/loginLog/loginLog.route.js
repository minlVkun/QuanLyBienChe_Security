const express = require('express');
const router = express.Router();
const LoginLogController = require('./loginLog.controller');
const { authorize } = require('../../middlewares/authMiddleware');
const { rlsMiddleware } = require('../../middlewares/rlsMiddleware');

// Chỉ cho phép Admin xem log đăng nhập
router.get('/', authorize(['db_Admin']), rlsMiddleware, LoginLogController.getLogs);

module.exports = router;
