const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Đảm bảo thư mục upload tồn tại
const uploadDir = path.join(__dirname, '../../uploads/contracts');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Cấu hình lưu trữ
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // [Security] Chống Path Traversal và trùng tên
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        // Sanitize original name: chỉ giữ lại chữ, số, dấu chấm, dấu gạch ngang
        const safeName = file.originalname.replace(/[^a-zA-Z0-9.\-]/g, '_');
        cb(null, `contract-${uniqueSuffix}-${safeName}`);
    }
});

// Kiểm tra loại file (Chỉ cho phép PDF)
const fileFilter = (req, file, cb) => {
    // [Security] Validate Mime Type khắt khe
    if (file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('INVALID_FILE_TYPE'), false);
    }
};

const upload = multer({
    storage: storage,
    limits: { 
        fileSize: 5 * 1024 * 1024 // [Security] Max 5MB để chống DoS
    },
    fileFilter: fileFilter
});

// Middleware bọc ngoài để handle lỗi của Multer trả về JSON chuẩn
const uploadContractMiddleware = (req, res, next) => {
    const uploadSingle = upload.single('contractFile');

    uploadSingle(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ success: false, message: 'Dung lượng file vượt quá giới hạn 5MB.' });
            }
            return res.status(400).json({ success: false, message: `Lỗi upload: ${err.message}` });
        } else if (err) {
            if (err.message === 'INVALID_FILE_TYPE') {
                return res.status(400).json({ success: false, message: 'Chỉ cho phép upload file PDF.' });
            }
            return res.status(500).json({ success: false, message: 'Lỗi hệ thống khi tải file lên.' });
        }
        next();
    });
};

module.exports = uploadContractMiddleware;
