const express = require('express');
const router = express.Router();
const dashboardController = require('./dashboard.controller');
const { authorize } = require('../../middlewares/authMiddleware');

// Endpoint: GET /api/system/dashboard-stats
// Middleware `authorize()` sẽ parse token và nạp `req.user`, sau đó `DBHelper` sẽ xử lý session context
router.get('/dashboard-stats', authorize(), dashboardController.getStats);

module.exports = router;
