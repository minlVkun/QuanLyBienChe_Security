const express = require('express');
const router = express.Router();
const ConfigController = require('./config.controller');
const { authorize } = require('../../middlewares/authMiddleware');
const { rlsMiddleware } = require('../../middlewares/rlsMiddleware');

/**
 * @route GET /api/configs
 * @desc Lấy danh sách cấu hình (Công khai cho người dùng đã đăng nhập)
 */
router.get('/', authorize(), rlsMiddleware, ConfigController.getAllConfigs);

/**
 * @route POST /api/configs
 * @desc Tạo mới cấu hình (Chỉ dành cho Admin)
 */
router.post('/', authorize(['db_Admin']), rlsMiddleware, ConfigController.createConfig);

/**
 * @route PUT /api/configs/:key
 * @desc Cập nhật giá trị cấu hình (Chỉ dành cho Admin)
 */
router.put('/:key', authorize(['db_Admin']), rlsMiddleware, ConfigController.updateConfig);

/**
 * @route DELETE /api/configs/:key
 * @desc Xóa cấu hình (Chỉ dành cho Admin)
 */
router.delete('/:key', authorize(['db_Admin']), rlsMiddleware, ConfigController.deleteConfig);

module.exports = router;
