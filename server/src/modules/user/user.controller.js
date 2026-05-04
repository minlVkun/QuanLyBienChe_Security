const UserService = require('./user.service');

const getUsers = async (req, res) => {
    try {
        const { page, limit, search } = req.query;
        const result = await UserService.getAllUsers(req.user, { page, limit, search });

        return res.status(200).json({
            success: true,
            ...result
        });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({ success: false, message: error.message });
    }
};

const updateUserInfo = async (req, res) => {
    try {
        const { id } = req.params;
        await UserService.updateUser(req.user, id, req.body);

        return res.status(200).json({
            success: true,
            message: "Cập nhật quyền và trạng thái thành công."
        });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({
            success: false,
            message: error.message
        });
    }
};

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
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    getUsers,
    updateUserInfo,
    resetPassword
};