const { z } = require('zod');

// Schema chung cho tạo mới và cập nhật
const contractSchema = z.object({
    MaHopDong: z.string().min(1, "Mã hợp đồng là bắt buộc").max(50, "Mã hợp đồng quá dài"),
    MaNV: z.string().min(1, "Mã nhân viên là bắt buộc").max(20, "Mã nhân viên không hợp lệ"),
    LoaiHopDong: z.string().min(1, "Loại hợp đồng là bắt buộc").max(100, "Loại hợp đồng quá dài"),
    NgayKy: z.string().refine(date => {
        // [Logic] Ngày ký không được lớn hơn ngày hiện tại
        const selectedDate = new Date(date);
        selectedDate.setHours(0, 0, 0, 0);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return selectedDate <= today;
    }, { message: "Ngày ký không được lớn hơn ngày hiện tại" }),
    NgayCoHieuLuc: z.string().min(1, "Ngày có hiệu lực là bắt buộc"),
    NgayHetHan: z.string().optional().nullable(),
    TrangThai: z.string().optional()
}).superRefine((data, ctx) => {
    const dKy = new Date(data.NgayKy);
    const dHieuLuc = new Date(data.NgayCoHieuLuc);
    
    // [Logic] Ngày có hiệu lực phải >= Ngày ký
    if (dHieuLuc < dKy) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Ngày có hiệu lực phải lớn hơn hoặc bằng Ngày ký",
            path: ["NgayCoHieuLuc"]
        });
    }

    // [Logic] Nếu có ngày hết hạn, nó phải > Ngày có hiệu lực
    if (data.NgayHetHan) {
        const dHetHan = new Date(data.NgayHetHan);
        if (dHetHan <= dHieuLuc) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Ngày hết hạn phải sau Ngày có hiệu lực",
                path: ["NgayHetHan"]
            });
        }
    }
});

const formatZodError = (error) => {
    return error.errors.map(err => err.message).join(', ');
};

module.exports = { contractSchema, formatZodError };
