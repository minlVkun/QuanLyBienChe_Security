const InsuranceLogModel = require('./insuranceLog.model');
const { insuranceLogSchema, formatZodError } = require('./insuranceLog.validation');
const AppError = require('../../utils/AppError');

class InsuranceLogService {
    static async getContributionHistory(reqUser, maNV, queryParams) {
        if (!maNV) {
            throw new AppError("Mã nhân viên là bắt buộc", 400);
        }

        // Ép kiểu an toàn (Safe Casting) với fallback value
        const safeQueryParams = {
            ...queryParams,
            page: parseInt(queryParams.page) || 1,
            limit: parseInt(queryParams.limit) || 10
        };

        const validationResult = insuranceLogSchema.safeParse(safeQueryParams);
        if (!validationResult.success) {
            throw new AppError(formatZodError(validationResult.error), 400);
        }

        const logs = await InsuranceLogModel.getLogs(reqUser, maNV, validationResult.data);
        const totalRows = logs.length > 0 ? logs[0].TotalRows : 0;

        return {
            logs: logs.map(({ TotalRows, ...l }) => l),
            pagination: {
                total: totalRows,
                page: validationResult.data.page,
                limit: validationResult.data.limit
            }
        };
    }
}

module.exports = InsuranceLogService;
