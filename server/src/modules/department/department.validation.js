const { z } = require('zod');

const changeDeptHeadSchema = z.object({
    maDonVi: z.string().min(1, "Mã đơn vị không được để trống"),
    maTruongPhong: z.string().nullable().optional()
});

const formatZodError = (error) => {
    return error.errors.map(err => err.message).join(', ');
};

module.exports = {
    changeDeptHeadSchema,
    formatZodError
};
