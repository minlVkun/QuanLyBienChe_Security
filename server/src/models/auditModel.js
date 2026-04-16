const { sql } = require('../config/db');
const DBHelper = require('../utils/dbHelper');

class AuditModel {
    /**
     * Lấy danh sách nhật ký (Giới hạn 500 dòng mới nhất)
     * Thêm cột RecordID để hiển thị đối tượng bị tác động (Ví dụ: Mã NV)
     */
    static async getLogs(reqUser, tableName = null) {
        try {
            let query = `
                SELECT TOP 500 
                    AuditID, 
                    TableName, 
                    Action, 
                    RecordID, -- Cột mới chúng ta vừa thêm vào DB
                    ChangedBy, 
                    ChangedDate 
                FROM [System].[Audit]
            `;
            const inputs = [];

            if (tableName) {
                query += " WHERE TableName = @TableName";
                inputs.push({ name: 'TableName', type: sql.NVarChar, value: tableName });
            }

            query += " ORDER BY ChangedDate DESC";

            const result = await DBHelper.queryWithContext(reqUser, query, inputs);
            
            return result.recordset || [];
        } catch (error) {
            console.error(`[Model Error - AuditModel.getLogs]:`, error);
            throw new Error("Lỗi khi truy xuất danh sách nhật ký hệ thống.");
        }
    }

    /**
     * Xem chi tiết sự thay đổi dữ liệu
     * Sửa tên cột OldValues -> OldData và NewValues -> NewData để khớp với Trigger
     */
    static async getDetail(reqUser, auditID) {
        try {
            const query = `
                SELECT 
                    AuditID, 
                    TableName, 
                    Action, 
                    RecordID,
                    OldData, -- Đổi tên để khớp với bảng System.Audit
                    NewData, -- Đổi tên để khớp với bảng System.Audit
                    ChangedBy, 
                    ChangedDate 
                FROM [System].[Audit] 
                WHERE AuditID = @AuditID
            `;
            const inputs = [{ name: 'AuditID', type: sql.Int, value: auditID }];

            const result = await DBHelper.queryWithContext(reqUser, query, inputs);
            
            // Xử lý dữ liệu JSON: Vì SQL lưu JSON dạng chuỗi, 
            // chúng ta nên parse thử để Frontend dễ sử dụng
            if (result.recordset && result.recordset.length > 0) {
                const log = result.recordset[0];
                try {
                    log.OldData = log.OldData ? JSON.parse(log.OldData) : null;
                    log.NewData = log.NewData ? JSON.parse(log.NewData) : null;
                } catch (e) {
                    // Nếu không parse được thì giữ nguyên dạng string
                }
                return log;
            }
            
            return null;
        } catch (error) {
            console.error(`[Model Error - AuditModel.getDetail]:`, error);
            throw new Error("Lỗi khi trích xuất chi tiết nhật ký hệ thống.");
        }
    }
}

module.exports = AuditModel;