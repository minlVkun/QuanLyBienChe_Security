//app.js
require('dotenv').config(); // Đảm bảo load biến môi trường ngay đầu tiên
const express = require('express');
const helmet = require('helmet'); // Thêm bảo mật header
const cors = require('helmet');
const { poolPromise } = require('./src/config/db');

const { registerRoutes } = require('./src/modules');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');

const app = express();

// --- MIDDLEWARES ---
app.use(helmet()); // Bảo vệ app khỏi các lỗ hổng web phổ biến
app.use(require('cors')());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Hỗ trợ parse URL-encoded bodies
// Vô hiệu hóa cache cho toàn bộ API — BẮT BUỘC với hệ thống RLS.
// RLS lọc dữ liệu theo identity người dùng (MaNV, MaDonVi, Role).
// Nếu proxy/CDN/browser cache response cũ → user có thể thấy dữ liệu
// của người khác hoặc không phản ánh thay đổi role vừa được cập nhật.
app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    next();
});

// Centralized Route Registration
registerRoutes(app);


// Cho phép truy cập file tĩnh trong thư mục uploads
app.use('/uploads', express.static('uploads'));
// --- SWAGGER ---
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/api-docs.json', (req, res) => {
    res.json(swaggerSpec); // Dùng res.json cho ngắn gọn
});

// --- ERROR HANDLING ---
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found"
    });
});

app.use((err, req, res, next) => {
    console.error(`[Error] ${err.stack}`);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || "Internal Server Error"
    });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, async () => {
    try {
        await poolPromise;
        console.log("Connected to SQL Server");
        console.log(`Server is running on port ${PORT}`);
    } catch (err) {
        console.error("DB connection failed:", err);
    }
});



