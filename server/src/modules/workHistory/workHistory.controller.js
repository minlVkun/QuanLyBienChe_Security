const WorkHistoryService = require('./workHistory.service');

// Lấy lịch sử công tác của nhân viên
const getWorkHistory = async (req, res) => {
    try {
        const maNV = req.params.id;
        const data = await WorkHistoryService.getWorkHistory(req.user, maNV);
        return res.status(200).json({ success: true, data });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({ success: false, message: error.message || 'Đã xảy ra lỗi khi lấy lịch sử công tác' });
    }
};

// Thêm quá trình công tác mới
const addWorkHistory = async (req, res) => {
    try {
        const result = await WorkHistoryService.create(req.user, req.body);
        return res.status(201).json({ success: true, message: 'Thêm quá trình công tác thành công', data: result });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({ success: false, message: error.message || 'Đã xảy ra lỗi khi thêm quá trình công tác' });
    }
};

/**
 * Controller cho nghiệp vụ Điều động / Bổ nhiệm
 */
const transferEmployee = async (req, res) => {
    try {
        // req.user được nạp từ authMiddleware
        // req.body chứa: targetMaNV, newMaDonVi, newMaChucVu, lyDo
        const result = await WorkHistoryService.transfer(req.user, req.body);
        return res.status(200).json(result);
    } catch (error) {
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({ 
            success: false, 
            message: error.message || 'Lỗi hệ thống khi thực hiện điều động' 
        });
    }
};

module.exports = {
    getWorkHistory,
    addWorkHistory,
    transferEmployee
};