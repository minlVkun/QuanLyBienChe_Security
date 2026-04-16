const AuditModel = require('../models/auditModel');

const getAllLogs = async (req, res) => {
    try {
        const { table } = req.query; 
        const logs = await AuditModel.getLogs(req.user, table);
        
        return res.status(200).json({
            success: true,
            count: logs.length, 
            data: logs
        });
    } catch (err) {
        console.error(`[Controller Error - getAllLogs]:`, err);
        return res.status(500).json({ 
            success: false, 
            message: "Đã xảy ra lỗi khi lấy danh sách nhật ký." 
        });
    }
};

const getLogDetail = async (req, res) => {
    try {
        const { id } = req.params;
        const log = await AuditModel.getDetail(req.user, id);

        if (!log) {
            return res.status(404).json({ 
                success: false, 
                message: "Không tìm thấy chi tiết nhật ký" 
            });
        }

        /**
         * Hàm parse an toàn để xử lý dữ liệu từ SQL Server.
         * Lưu ý: Nếu ở Model bạn đã dùng JSON.parse rồi thì ở đây không cần nữa.
         * Tuy nhiên, để chắc chắn bảo vệ API khỏi crash, việc kiểm tra lại là cần thiết.
         */
        const safeParseJSON = (data) => {
            if (!data) return null;
            if (typeof data === 'object') return data; // Nếu Model đã parse rồi thì trả về luôn
            try {
                return JSON.parse(data);
            } catch (e) {
                console.warn(`[Warning] Dữ liệu không phải chuẩn JSON tại AuditID ${id}:`, data);
                return data; 
            }
        };

        // Đồng bộ hóa tên cột theo đúng Database: OldData và NewData
        const responseData = {
            ...log,
            OldData: safeParseJSON(log.OldData),
            NewData: safeParseJSON(log.NewData)
        };

        return res.status(200).json({
            success: true,
            data: responseData
        });
    } catch (err) {
        console.error(`[Controller Error - getLogDetail]:`, err);
        return res.status(500).json({ 
            success: false, 
            message: "Đã xảy ra lỗi khi lấy chi tiết nhật ký." 
        });
    }
};

module.exports = { getAllLogs, getLogDetail };