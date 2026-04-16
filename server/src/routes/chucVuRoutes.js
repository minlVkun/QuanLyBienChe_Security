const express = require('express');
const router = express.Router();
const chucVuController = require('../controllers/chucVuController');
// CHỈ IMPORT HÀM authorize TỪ MIDDLEWARE CỦA BẠN
const { authorize } = require('../middlewares/authMiddleware');

// 1. Xem danh sách và chi tiết 
// Truyền mảng rỗng [] hoặc không truyền gì để chỉ yêu cầu đăng nhập (không check role)
router.get('/', authorize(), chucVuController.getAllChucVu);
router.get('/:id', authorize(), chucVuController.getChucVuById);

// 2. Thêm, sửa, xóa 
// Truyền mảng chứa các role được phép vào hàm authorize
router.post('/', authorize(['db_Admin', 'db_HR']), chucVuController.createChucVu);
router.put('/:id', authorize(['db_Admin', 'db_HR']), chucVuController.updateChucVu);
router.delete('/:id', authorize(['db_Admin', 'db_HR']), chucVuController.deleteChucVu);

module.exports = router;