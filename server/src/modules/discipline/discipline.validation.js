const { z } = require('zod');

const disciplineSchema = z.object({
    MaNV: z.string().min(1, "Mã nhân viên là bắt buộc"),
    Loai: z.string().min(1, "Loại là bắt buộc"),
    HinhThuc: z.string().min(1, "Hình thức là bắt buộc"),
    NgayQuyetDinh: z.string().min(1, "Ngày quyết định là bắt buộc"),
    SoQuyetDinh: z.string().optional().nullable(),
    NoiDung: z.string().optional().nullable()
});

const formatZodError = (error) => {
    if (!error || !Array.isArray(error.errors)) {
        return "Lỗi xác thực dữ liệu không xác định.";
    }
    return error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
};

module.exports = { disciplineSchema, formatZodError };
