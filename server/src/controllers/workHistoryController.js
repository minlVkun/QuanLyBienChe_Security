const WorkHistoryModel = require('../models/workHistoryModel');

// Lấy lịch sử công tác của nhân viên
const getWorkHistory = async (req, res) => {
    try {
        const maNV = req.params.id;

        const data = await WorkHistoryModel.getByMaNV(req.user, maNV);

        return res.status(200).json({
            success: true,
            data
        });

    } catch (error) {
        console.error('Error fetching work history:', error);

        // 🔥 bắt lỗi business từ SQL
        if (error.number >= 50000) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Đã xảy ra lỗi khi lấy lịch sử công tác'
        });
    }
};

// Thêm quá trình công tác mới
const addWorkHistory = async (req, res) => {
    try {
        const result = await WorkHistoryModel.create(req.user, req.body);

        return res.status(201).json({
            success: true,
            message: 'Thêm quá trình công tác thành công',
            data: result
        });

    } catch (error) {
        console.error('Error adding work history:', error);

        // 🔥 lỗi business từ SQL
        if (error.number >= 50000) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Đã xảy ra lỗi khi thêm quá trình công tác'
        });
    }
};

module.exports = {
    getWorkHistory,
    addWorkHistory
};