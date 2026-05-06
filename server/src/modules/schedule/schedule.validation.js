// src/modules/schedule/schedule.validation.js
const { z } = require('zod');

const scheduleSchema = z.object({
    maNV: z.string().min(1, 'Mã nhân viên không được để trống').max(20),
    maCaLamViec: z.string().min(1, 'Mã ca làm việc không được để trống').max(10),
    ngayLam: z.string().regex(
        /^\d{4}-\d{2}-\d{2}$/,
        'Ngày làm phải theo định dạng YYYY-MM-DD'
    ),
    ghiChu: z.string().max(500).optional().nullable()
});

const bulkAssignSchema = z.object({
    maNVList: z.array(z.string().min(1)).min(1, 'Phải có ít nhất 1 nhân viên'),
    maCaLamViec: z.string().min(1, 'Mã ca làm việc không được để trống').max(10),
    // Mảng ngày làm, dạng ['2026-05-06', '2026-05-07', ...]
    ngayLamList: z.array(
        z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Ngày phải theo định dạng YYYY-MM-DD')
    ).min(1, 'Phải chọn ít nhất 1 ngày'),
    ghiChu: z.string().max(500).optional().nullable()
});

const updateScheduleSchema = z.object({
    maCaLamViec: z.string().min(1, 'Mã ca không được để trống').max(10),
    ngayLam: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Ngày làm phải theo định dạng YYYY-MM-DD'),
    ghiChu: z.string().max(500).optional().nullable()
});

const formatZodError = (error) =>
    error.errors.map(e => e.message).join(', ');

module.exports = { scheduleSchema, bulkAssignSchema, updateScheduleSchema, formatZodError };
