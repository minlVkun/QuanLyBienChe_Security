const UserModel = require('./user.model');
const AuditService = require('../audit/audit.service');
const bcrypt = require('bcryptjs');
const { updateUserSchema, resetPasswordSchema, formatZodError } = require('./user.validation');

class UserService {
    static async getAllUsers(reqUser, params) {
        if (reqUser.RoleName !== 'db_Admin') {
            const err = new Error("Quyền truy cập bị từ chối.");
            err.statusCode = 403; throw err;
        }

        const users = await UserModel.findAll(reqUser, params);
        const totalRows = users.length > 0 ? users[0].TotalRows : 0;
        
        return {
            users: users.map(({ TotalRows, ...u }) => u), // Loại bỏ cột TotalRows khỏi từng object
            pagination: {
                total: totalRows,
                page: parseInt(params.page) || 1,
                limit: parseInt(params.limit) || 100
            }
        };
    }

    static async updateUser(reqUser, id, updateData) {
        const validationResult = updateUserSchema.safeParse(updateData);
        if (!validationResult.success) {
            const err = new Error(formatZodError(validationResult.error));
            err.statusCode = 400; throw err;
        }
        
        // Kiểm tra user có tồn tại không
        const user = await UserModel.findById(reqUser, id);
        if (!user) {
            const err = new Error("Người dùng không tồn tại.");
            err.statusCode = 404; throw err;
        }

        const affectedRows = await UserModel.updateRoleAndStatus(reqUser, id, validationResult.data);
        
        if (affectedRows > 0) {
            await AuditService.logAction(reqUser, {
                TableName: 'System.User',
                Action: 'UPDATE',
                RecordID: id,
                OldData: user,
                NewData: validationResult.data
            });
        }

        return affectedRows > 0;
    }

    static async resetUserPassword(reqUser, id, newPassword) {
        const validationResult = resetPasswordSchema.safeParse({ newPassword });
        if (!validationResult.success) {
            const err = new Error(formatZodError(validationResult.error));
            err.statusCode = 400; throw err;
        }

        const user = await UserModel.findById(reqUser, id);
        if (!user) {
            const err = new Error("Người dùng không tồn tại.");
            err.statusCode = 404; throw err;
        }

        // Băm mật khẩu
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        
        // Chuyển chuỗi hash thành Buffer để lưu vào VARBINARY
        const passwordBuffer = Buffer.from(hashedPassword, 'utf-8');

        const success = await UserModel.updatePassword(reqUser, id, passwordBuffer);
        
        if (success) {
            await AuditService.logAction(reqUser, {
                TableName: 'System.User',
                Action: 'RESET_PASSWORD',
                RecordID: id,
                OldData: { UserID: id, Username: user.Username },
                NewData: { PasswordReset: true }
            });
        }

        return success;
    }
}

module.exports = UserService;