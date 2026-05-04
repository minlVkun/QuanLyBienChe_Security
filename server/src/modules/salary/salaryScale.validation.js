const { z } = require('zod');

// Schema cho Ngạch lương (NgachLuong)
const salaryScaleSchema = z.object({
    MaNgach: z.string()
        .min(1, "Mã ngạch không được để trống")
        .max(20, "Mã ngạch tối đa 20 ký tự"),
    TenNgach: z.string()
        .min(1, "Tên ngạch không được để trống")
        .max(100, "Tên ngạch tối đa 100 ký tự"),
    NhomNgach: z.string()
        .min(1, "Nhóm ngạch không được để trống")
        .max(10, "Nhóm ngạch tối đa 10 ký tự")
});

// Schema cho Bậc lương (ChiTietNgachLuong)
const salaryStepSchema = z.object({
    MaNgach: z.string().min(1, "Mã ngạch không được để trống"),
    BacLuong: z.number().int().min(1, "Bậc lương phải từ 1 trở lên"),
    HeSoLuong: z.number().min(0, "Hệ số lương không được âm")
});

const formatZodError = (error) => {
    return error.errors.map(err => err.message).join(", ");
};

module.exports = {
    salaryScaleSchema,
    salaryStepSchema,
    formatZodError
};
