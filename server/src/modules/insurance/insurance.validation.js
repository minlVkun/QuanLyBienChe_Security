const { z } = require('zod');

const updateInsuranceSchema = z.object({
    MaSoBHYT: z.string().min(1, "Mã số BHYT là bắt buộc"),
    NoiDANGKY_KCB: z.string().min(1, "Nơi đăng ký KCB là bắt buộc")
});

const formatZodError = (error) => {
    return error.errors.map(err => err.message).join(', ');
};

module.exports = { updateInsuranceSchema, formatZodError };
