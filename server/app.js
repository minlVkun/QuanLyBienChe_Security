//app.js
require('dotenv').config(); // Đảm bảo load biến môi trường ngay đầu tiên
const express = require('express');
const helmet = require('helmet'); // Thêm bảo mật header
const cors = require('helmet');
const { poolPromise } = require('./src/config/db');

// Import Routes
const nhanVienRoutes = require('./src/routes/nhanVienRoutes');
const authRoutes = require('./src/routes/authRoutes');
const bangCapRoutes = require('./src/routes/bangCapRoutes');
const salaryRoutes = require('./src/routes/salaryRoutes');
const workHistoryRoutes = require('./src/routes/workHistoryRoutes');
const disciplineRoutes = require('./src/routes/disciplineRoutes');
const auditRoutes = require('./src/routes/auditRoutes');
const donViRoutes = require('./src/routes/donViRoutes');
const chucVuRoutes = require('./src/routes/chucVuRoutes');
const userRouter = require('./src/routes/userRoutes');

const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');

const app = express();

// --- MIDDLEWARES ---
app.use(helmet()); // Bảo vệ app khỏi các lỗ hổng web phổ biến
app.use(require('cors')());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Hỗ trợ parse URL-encoded bodies

// Trong file app.js
app.use('/api/employees', nhanVienRoutes); // Các route liên quan đến nhân viên
app.use('/api/auth', authRoutes);   // Các route liên quan đến xác thực (đăng nhập, đăng ký, refresh token)
app.use('/api/degrees', bangCapRoutes);  // Các route liên quan đến bằng cấp (thêm, xóa, xem bằng cấp của nhân viên)
app.use('/api/salary', salaryRoutes); // Các route liên quan đến lương và bảo hiểm (xem lương, nâng lương, thông tin bảo hiểm, lịch sử đóng bảo hiểm)
app.use('/api/work-history', workHistoryRoutes); // Các route liên quan đến quá trình công tác
app.use('/api/discipline', disciplineRoutes); // Các route liên quan đến khen thưởng/kỷ luật
app.use('/api/audit', auditRoutes); // Các route liên quan đến lịch sử truy cập và thay đổi dữ liệu
app.use('/api/departments', donViRoutes); // Các route liên quan đến đơn vị và sơ đồ tổ chức
app.use('/api/positions', chucVuRoutes); // Các route liên quan đến chức vụ
app.use('/api/users', userRouter); // Các route liên quan đến user


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

