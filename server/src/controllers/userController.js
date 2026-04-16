const UserService = require('../services/userService');

/**
 * GET /api/users
 */
const getUsers = async (req, res) => {
    try {
        // Kiểm tra quyền Admin (sử dụng req.user.role theo token của bạn)
        if (req.user.role !== 'db_Admin') {
            return res.status(403).json({ success: false, message: "Quyền truy cập bị từ chối." });
        }

        const { page, limit, search } = req.query;
        const result = await UserService.getAllUsers(req.user, { page, limit, search });

        return res.status(200).json({
            success: true,
            ...result
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * PUT /api/users/:id
 */
const updateUserInfo = async (req, res) => {
    try {
        const { id } = req.params;
        await UserService.updateUser(req.user, id, req.body);

        return res.status(200).json({
            success: true,
            message: "Cập nhật quyền và trạng thái thành công."
        });
    } catch (error) {
        const isNotFound = error.message.includes("không tồn tại");
        return res.status(isNotFound ? 404 : 400).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * POST /api/users/:id/reset-password
 */
const resetPassword = async (req, res) => {
    try {
        const { id } = req.params;
        const { newPassword } = req.body;

        await UserService.resetUserPassword(req.user, id, newPassword);

        return res.status(200).json({
            success: true,
            message: "Đặt lại mật khẩu thành công."
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Xuất các hàm để Router có thể dùng destructuring
module.exports = {
    getUsers,
    updateUserInfo,
    resetPassword
};