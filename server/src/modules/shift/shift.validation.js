const { z } = require('zod');

/**
 * Schema cho Ca làm việc
 */
const shiftSchema = z.object({
    maCa: z.string().min(1, "Mã ca không được để trống").max(10, "Mã ca tối đa 10 ký tự")
        .regex(/^[A-Z0-9_]+$/i, "Mã ca chỉ được chứa chữ, số và dấu gạch dưới"),
    tenCa: z.string().min(1, "Tên ca không được để trống").max(100, "Tên ca tối đa 100 ký tự"),
    gioBatDau: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/, "Giờ bắt đầu phải theo định dạng HH:mm:ss"),
    gioKetThuc: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/, "Giờ kết thúc phải theo định dạng HH:mm:ss"),
    phutChoPhepTre: z.number().min(0, "Phút cho phép trễ không được nhỏ hơn 0").max(120, "Phút trễ tối đa 120 phút").optional().default(0)
}).refine(data => {
    // Logic: Giờ kết thúc phải > Giờ bắt đầu
    // Vì định dạng là HH:mm:ss nên so sánh string là đủ chính xác
    if (data.gioBatDau && data.gioKetThuc) {
        return data.gioKetThuc > data.gioBatDau;
    }
    return true;
}, {
    message: "Giờ kết thúc phải sau giờ bắt đầu (Ví dụ: 08:00:00 < 17:00:00)",
    path: ["gioKetThuc"]
});

const formatZodError = (error) => {
    return error.errors.map(err => err.message).join(', ');
};

module.exports = {
    shiftSchema,
    formatZodError
};
