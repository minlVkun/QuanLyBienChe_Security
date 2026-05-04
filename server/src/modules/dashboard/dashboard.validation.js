const { z } = require('zod');

const dateRangeSchema = z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional()
});

const formatZodError = (error) => {
    return error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
};

module.exports = { dateRangeSchema, formatZodError };
