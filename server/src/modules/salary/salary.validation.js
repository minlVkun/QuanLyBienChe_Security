const { z } = require('zod');

const salarySchema = z.object({
    maNhanVien: z.string().min(1, "Mã nhân viên là bắt buộc"),
    thang: z.number().int().min(1, "Tháng tối thiểu là 1").max(12, "Tháng tối đa là 12"),
    nam: z.number().int().min(new Date().getFullYear(), "Năm phải là năm hiện tại hoặc tương lai"),
    heSoLuong: z.number().positive("Hệ số lương phải lớn hơn 0"),
    luongCoBan: z.number().positive("Lương cơ bản phải là số dương"),
    phuCap: z.number().min(0, "Phụ cấp không được âm").default(0),
    khauTru: z.number().min(0, "Khấu trừ không được âm").default(0)
});

const formatZodError = (error) => {
    return error.errors.map(err => err.message).join(', ');
};

module.exports = {
    salarySchema,
    formatZodError
};
