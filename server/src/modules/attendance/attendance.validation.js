const { z } = require('zod');

/**
 * Hiện tại check-in không nhận body. 
 * Tuy nhiên ta có thể validate query params cho lịch sử chấm công.
 */
const getHistorySchema = z.object({
    fromDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Định dạng ngày phải là YYYY-MM-DD").optional(),
    toDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Định dạng ngày phải là YYYY-MM-DD").optional()
});

const formatZodError = (error) => {
    return error.errors.map(err => err.message).join(', ');
};

module.exports = {
    getHistorySchema,
    formatZodError
};
