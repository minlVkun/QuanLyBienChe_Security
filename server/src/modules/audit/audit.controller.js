const AuditService = require('./audit.service');

const getAllLogs = async (req, res) => {
    try {
        const result = await AuditService.getAllLogs(req.user, req.query);
        
        return res.status(200).json({
            success: true,
            data: result.logs,
            pagination: {
                total: result.totalRows,
                page: result.page,
                limit: result.limit
            }
        });
    } catch (err) {
        console.error(`[Controller Error - getAllLogs]:`, err);
        return res.status(err.statusCode || 500).json({ 
            success: false, 
            message: err.message || "Đã xảy ra lỗi khi lấy danh sách nhật ký." 
        });
    }
};

const getLogDetail = async (req, res) => {
    try {
        const { id } = req.params;
        const responseData = await AuditService.getLogDetail(req.user, id);

        return res.status(200).json({
            success: true,
            data: responseData
        });
    } catch (err) {
        console.error(`[Controller Error - getLogDetail]:`, err);
        return res.status(err.statusCode || 500).json({ 
            success: false, 
            message: err.message || "Đã xảy ra lỗi khi lấy chi tiết nhật ký." 
        });
    }
};

module.exports = { getAllLogs, getLogDetail };