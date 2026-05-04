const { z } = require('zod');

const createPositionSchema = z.object({
    MaChucVu: z.string().min(1, "Vui lòng nhập Mã chức vụ"),
    TenChucVu: z.string().min(1, "Vui lòng nhập Tên chức vụ"),
    PhuCapChucVu: z.number().optional().default(0)
});

const updatePositionSchema = z.object({
    TenChucVu: z.string().min(1, "Vui lòng nhập Tên chức vụ"),
    PhuCapChucVu: z.number().optional().default(0)
});

const formatZodError = (error) => {
    return error.errors.map(err => err.message).join(', ');
};

module.exports = { createPositionSchema, updatePositionSchema, formatZodError };
