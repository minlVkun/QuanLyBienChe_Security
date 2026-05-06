const AuditModel = require('./audit.model');
const { getLogsSchema, formatZodError } = require('./audit.validation');

class AuditService {
    static async getAllLogs(reqUser, queryParams) {
        const validationResult = getLogsSchema.safeParse(queryParams);
        if (!validationResult.success) {
            const err = new Error(formatZodError(validationResult.error));
            err.statusCode = 400;
            throw err;
        }

        const logs = await AuditModel.getLogs(reqUser, validationResult.data);
        const totalRows = logs.length > 0 ? logs[0].TotalRows : 0;
        
        return {
            logs: logs.map(({ TotalRows, ...l }) => l),
            totalRows,
            page: validationResult.data.page,
            limit: validationResult.data.limit
        };
    }

    static async getLogDetail(reqUser, id) {
        const log = await AuditModel.getDetail(reqUser, id);
        if (!log) {
            const err = new Error("Không tìm thấy chi tiết nhật ký");
            err.statusCode = 404;
            throw err;
        }

        const safeParseJSON = (data) => {
            if (!data) return null;
            if (typeof data === 'object') return data;
            try {
                return JSON.parse(data);
            } catch (e) {
                console.warn(`[Warning] Dữ liệu không phải chuẩn JSON tại AuditID ${id}:`, data);
                return data; 
            }
        };

        return {
            ...log,
            OldData: safeParseJSON(log.OldData),
            NewData: safeParseJSON(log.NewData)
        };
    }
    /**
     * Ghi log thủ công (Hỗ trợ Read Audit)
     */
    static async logAction(reqUser, data, transaction = null) {
        return await AuditModel.logManualAction(reqUser, data, transaction);
    }
}

module.exports = AuditService;
