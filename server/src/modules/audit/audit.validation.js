const { z } = require('zod');

const getLogsSchema = z.object({
    page: z.string().optional().transform(val => parseInt(val) || 1),
    limit: z.string().optional().transform(val => parseInt(val) || 10),
    search: z.string().optional(),
    action: z.string().optional(),
    user: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional()
});

const formatZodError = (error) => {
    return error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
};

module.exports = { getLogsSchema, formatZodError };
