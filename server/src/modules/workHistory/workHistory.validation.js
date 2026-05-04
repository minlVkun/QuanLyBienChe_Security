const { z } = require('zod');

const createWorkHistorySchema = z.object({
    MaNV: z.string().min(1, "Mã nhân viên là bắt buộc"),
    TuNgay: z.string().or(z.date()).refine(val => !isNaN(new Date(val).getTime()), { message: "Từ ngày không hợp lệ" }),
    DenNgay: z.string().or(z.date()).refine(val => !isNaN(new Date(val).getTime()), { message: "Đến ngày không hợp lệ" }).nullable().optional(),
    MaDonVi: z.string().min(1, "Mã đơn vị là bắt buộc"),
    MaChucVu: z.string().min(1, "Mã chức vụ là bắt buộc"),
    NoiDung: z.string().min(1, "Nội dung là bắt buộc")
}).refine(data => {
    if (data.DenNgay) {
        return new Date(data.DenNgay) >= new Date(data.TuNgay);
    }
    return true;
}, {
    message: "Đến ngày phải lớn hơn hoặc bằng Từ ngày",
    path: ["DenNgay"]
});

const transferSchema = z.object({
    targetMaNV: z.string().min(1, "Mã nhân viên đích là bắt buộc"),
    newMaDonVi: z.string().min(1, "Mã đơn vị mới là bắt buộc"),
    newMaChucVu: z.string().min(1, "Mã chức vụ mới là bắt buộc"),
    lyDo: z.string().min(5, "Lý do phải ít nhất 5 ký tự").max(500, "Lý do quá dài")
});

const formatZodError = (error) => {
    return error.errors.map(err => err.message).join(', ');
};

module.exports = { createWorkHistorySchema, transferSchema, formatZodError };
