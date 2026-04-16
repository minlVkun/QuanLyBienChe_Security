const UserModel = require('../models/userModel');
const bcrypt = require('bcryptjs');

class UserService {
    static async getAllUsers(reqUser, params) {
        const users = await UserModel.findAll(reqUser, params);
        const totalRows = users.length > 0 ? users[0].TotalRows : 0;
        
        return {
            users: users.map(({ TotalRows, ...u }) => u), // Loại bỏ cột TotalRows khỏi từng object
            pagination: {
                total: totalRows,
                page: parseInt(params.page),
                limit: parseInt(params.limit)
            }
        };
    }

    static async updateUser(reqUser, id, updateData) {
        const { RoleName, TrangThai } = updateData;
        
        // Kiểm tra user có tồn tại không
        const user = await UserModel.findById(reqUser, id);
        if (!user) throw new Error("Người dùng không tồn tại.");

        const affectedRows = await UserModel.updateRoleAndStatus(reqUser, id, { RoleName, TrangThai });
        return affectedRows > 0;
    }

    static async resetUserPassword(reqUser, id, newPassword) {
        if (!newPassword || newPassword.length < 6) {
            throw new Error("Mật khẩu mới phải có ít nhất 6 ký tự.");
        }

        const user = await UserModel.findById(reqUser, id);
        if (!user) throw new Error("Người dùng không tồn tại.");

        // Băm mật khẩu
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        
        // Chuyển chuỗi hash thành Buffer để lưu vào VARBINARY
        const passwordBuffer = Buffer.from(hashedPassword, 'utf-8');

        return await UserModel.updatePassword(reqUser, id, passwordBuffer);
    }
}

module.exports = UserService;