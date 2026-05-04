const { z } = require('zod');

const createDegreeSchema = z.object({
    MaNV: z.string().min(1, "Mã nhân viên là bắt buộc"),
    LoaiBang: z.string().min(1, "Loại bằng là bắt buộc"),
    ChuyenNganh: z.string().min(1, "Chuyên ngành là bắt buộc"),
    NoiDaoTao: z.string().min(1, "Nơi đào tạo là bắt buộc"),
    NamTotNghiep: z.number().int().min(1900, "Năm tốt nghiệp không hợp lệ")
});

const formatZodError = (error) => {
    return error.errors.map(err => err.message).join(', ');
};

module.exports = { createDegreeSchema, formatZodError };
