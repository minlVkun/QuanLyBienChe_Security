const { z } = require('zod');

const insuranceLogSchema = z.object({
    page: z.number().int().positive().optional(),
    limit: z.number().int().positive().optional()
});

const formatZodError = (error) => {
    return (error.issues || error.errors || []).map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
};

module.exports = { insuranceLogSchema, formatZodError };
