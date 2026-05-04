const { z } = require('zod');

const updateUserSchema = z.object({
    RoleName: z.string().min(1, "RoleName là bắt buộc"),
    TrangThai: z.number().int(),
    Reason: z.string().max(500, "Lý do không được quá 500 ký tự").optional().default('')
});

const resetPasswordSchema = z.object({
    newPassword: z.string().min(6, "Mật khẩu mới phải có ít nhất 6 ký tự")
});

const formatZodError = (error) => {
    return error.errors.map(err => err.message).join(', ');
};

module.exports = { updateUserSchema, resetPasswordSchema, formatZodError };
