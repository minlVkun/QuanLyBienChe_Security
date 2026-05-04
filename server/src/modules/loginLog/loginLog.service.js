const LoginLogModel = require('./loginLog.model');
const { z } = require('zod');

const querySchema = z.object({
    loginName: z.string().optional(),
    fromDate: z.string().optional().refine(val => !val || !isNaN(Date.parse(val)), { message: "Ngày bắt đầu không hợp lệ" }),
    toDate: z.string().optional().refine(val => !val || !isNaN(Date.parse(val)), { message: "Ngày kết thúc không hợp lệ" }),
    hostName: z.string().optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().default(10)
});

class LoginLogService {
    static async getLogs(reqUser, queryParams) {
        const validation = querySchema.safeParse(queryParams);
        if (!validation.success) {
            const errorMessages = validation.error.issues.map(i => i.message).join(', ');
            const err = new Error(errorMessages);
            err.statusCode = 400;
            throw err;
        }

        const logs = await LoginLogModel.getLogs(reqUser, validation.data);
        const totalRows = logs.length > 0 ? logs[0].TotalRows : 0;

        return {
            logs: logs.map(({ TotalRows, ...log }) => log),
            totalRows,
            page: validation.data.page,
            limit: validation.data.limit
        };
    }
}

module.exports = LoginLogService;
