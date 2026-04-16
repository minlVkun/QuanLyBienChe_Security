const SalaryService = require('../services/salaryService');

const getCurrentSalaries = async (req, res) => {
    try {
        const data = await SalaryService.fetchCurrentSalaries(req.user);
        return res.status(200).json({
            success: true,
            count: data.length,
            data: data
        });
    } catch (error) {
        console.error("[SalaryController.getCurrentSalaries] Error:", error);
        return res.status(500).json({
            success: false,
            message: "Lỗi máy chủ: Không thể lấy danh sách lương hiện tại."
        });
    }
};

const getSalaryScales = async (req, res) => {
    try {
        const data = await SalaryService.getScales(req.user);
        return res.status(200).json({
            success: true,
            count: data.length,
            data: data
        });
    } catch (error) {
        console.error("[SalaryController.getSalaryScales] Error:", error);
        return res.status(500).json({
            success: false,
            message: "Lỗi máy chủ: Không thể tải danh mục thang bảng lương."
        });
    }
};

const promoteSalary = async (req, res) => {
    try {
        const result = await SalaryService.processPromotion(req.user, req.body);
        return res.status(200).json({
            success: true,
            message: result.message
        });
    } catch (error) {
        // Tách biệt HTTP Code: 400 (Client nhập sai) vs 500 (Lỗi server)
        if (error.message.includes("VALIDATION_ERROR")) {
            return res.status(400).json({
                success: false,
                message: error.message.replace("VALIDATION_ERROR: ", "")
            });
        }

        return res.status(500).json({
            success: false,
            message: error.message.replace("TRANSACTION_ERROR: ", "") || "Lỗi cập nhật diễn biến lương."
        });
    }
};

// Xuất thẳng các hàm để file Route import bằng destructuring (vd: const { promoteSalary } = require(...))
module.exports = {
    getCurrentSalaries,
    getSalaryScales,
    promoteSalary
};