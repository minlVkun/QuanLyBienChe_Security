const { z } = require('zod');

// Schema tạo nhân viên mới
const createEmployeeSchema = z.object({
    HoTen: z.string().trim().min(1, "Họ tên không được để trống").max(100, "Họ tên không được vượt quá 100 ký tự").regex(/^[a-zA-ZÀ-ỹ\s\-']+$/u, "Họ tên không được chứa ký tự đặc biệt"),
    NgaySinh: z.string().trim().or(z.date()).refine(val => val ? !isNaN(new Date(val).getTime()) : true, { message: "Ngày sinh không hợp lệ" }).optional(),
    GioiTinh: z.union([z.boolean(), z.number()]).optional(),
    SoCCCD: z.string().trim().min(9, "Số CCCD/CMND phải có ít nhất 9 ký tự").max(12, "Số CCCD không được vượt quá 12 ký tự").regex(/^\d+$/, "Số CCCD chỉ được chứa chữ số"),
    Email: z.string().trim().email("Email không đúng định dạng").toLowerCase(),
    SoDienThoai: z.string().trim().regex(/^(0|\+84)[3|5|7|8|9][0-9]{8}$/, "Số điện thoại không đúng định dạng Việt Nam").optional().or(z.literal('')),
    QueQuan: z.string().trim().min(1, "Quê quán không được để trống").optional().or(z.literal('')),
    MaDonVi: z.string().trim().min(1, "Mã đơn vị không được để trống"),
    MaChucVu: z.string().trim().min(1, "Mã chức vụ không được để trống"),
    NgayVaoBienChe: z.string().trim().or(z.date()).refine(val => val ? !isNaN(new Date(val).getTime()) : true, { message: "Ngày vào biên chế không hợp lệ" }).optional(),
});

// Schema cập nhật thông tin nhân viên (cho phép truyền thiếu trường)
const updateEmployeeSchema = z.object({
    HoTen: z.string().trim().min(1, "Họ tên không được để trống").max(100, "Họ tên không được vượt quá 100 ký tự").regex(/^[a-zA-ZÀ-ỹ\s\-']+$/u, "Họ tên không được chứa ký tự đặc biệt").optional(),
    NgaySinh: z.string().trim().or(z.date()).refine(val => val ? !isNaN(new Date(val).getTime()) : true, { message: "Ngày sinh không hợp lệ" }).optional(),
    GioiTinh: z.union([z.boolean(), z.number()]).optional(),
    Email: z.string().trim().email("Email không đúng định dạng").toLowerCase().optional(),
    SoDienThoai: z.string().trim().regex(/^(0|\+84)[3|5|7|8|9][0-9]{8}$/, "Số điện thoại không hợp lệ").optional().or(z.literal('')),
    QueQuan: z.string().trim().min(1, "Quê quán không được để trống").optional().or(z.literal('')),
    MaDonVi: z.string().trim().min(1, "Mã đơn vị không được để trống").optional(),
    MaChucVu: z.string().trim().min(1, "Mã chức vụ không được để trống").optional(),
    NgayVaoBienChe: z.string().trim().or(z.date()).refine(val => val ? !isNaN(new Date(val).getTime()) : true, { message: "Ngày vào biên chế không hợp lệ" }).optional(),
});

// Helper để format lỗi Zod thành thông báo ngắn gọn dễ đọc cho frontend
const formatZodError = (error) => {
    const errorList = error?.issues?.map(err => err.message) || error?.errors?.map(err => err.message) || [];
    return errorList.length > 0 ? errorList.join(', ') : 'Dữ liệu không hợp lệ';
};

module.exports = {
    createEmployeeSchema,
    updateEmployeeSchema,
    formatZodError
};
