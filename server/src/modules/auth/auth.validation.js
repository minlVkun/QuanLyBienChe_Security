const { z } = require('zod');

const authSchema = z.object({
    username: z.string().min(1, 'Tên đăng nhập là bắt buộc'),
    password: z.string().min(1, 'Mật khẩu là bắt buộc')
});

const changePasswordSchema = z.object({
    oldPassword: z.string().min(1, 'Mật khẩu cũ là bắt buộc'),
    newPassword: z.string()
        .min(6, 'Mật khẩu mới phải có ít nhất 6 ký tự')
        .max(128, 'Mật khẩu không được vượt quá 128 ký tự')
}).refine(data => data.oldPassword !== data.newPassword, {
    message: 'Mật khẩu mới không được trùng với mật khẩu cũ',
    path: ['newPassword']
});

const formatZodError = (error) => {
    return error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
};

module.exports = { authSchema, changePasswordSchema, formatZodError };
