const { sql } = require('../../config/db');
const DBHelper = require('../../utils/dbHelper');

class AuditModel {
    /**
     * Lấy danh sách nhật ký (Giới hạn 500 dòng mới nhất)
     * Thêm cột RecordID để hiển thị đối tượng bị tác động (Ví dụ: Mã NV)
     */
    static async getLogs(reqUser, { page = 1, limit = 10, search = '', action = '', user = '', startDate = '', endDate = '' } = {}) {
        try {
            const offset = (page - 1) * limit;
            let queryConditions = "1=1";
            const inputs = [
                { name: 'offset', type: sql.Int, value: offset },
                { name: 'limit', type: sql.Int, value: limit }
            ];

            if (search) {
                queryConditions += " AND (TableName LIKE @search OR RecordID LIKE @search)";
                inputs.push({ name: 'search', type: sql.NVarChar, value: `%${search}%` });
            }
            if (action && action !== 'All') {
                queryConditions += " AND Action = @action";
                inputs.push({ name: 'action', type: sql.NVarChar, value: action });
            }
            if (user) {
                queryConditions += " AND ChangedBy LIKE @user";
                inputs.push({ name: 'user', type: sql.NVarChar, value: `%${user}%` });
            }
            if (startDate) {
                queryConditions += " AND ChangedDate >= @startDate";
                inputs.push({ name: 'startDate', type: sql.DateTime, value: startDate });
            }
            if (endDate) {
                // Thêm 1 ngày trừ 1 giây để bao gồm toàn bộ ngày endDate
                queryConditions += " AND ChangedDate <= @endDate";
                inputs.push({ name: 'endDate', type: sql.DateTime, value: endDate + ' 23:59:59' });
            }

            let query = `
                SELECT 
                    AuditID, 
                    TableName, 
                    Action, 
                    RecordID,
                    ChangedBy, 
                    ChangedDate,
                    COUNT(*) OVER() as TotalRows
                FROM [System].[Audit]
                WHERE ${queryConditions}
                ORDER BY ChangedDate DESC
                OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
            `;

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
            
            if (result.recordset && result.recordset.length > 0) {
                return result.recordset[0];
            }
            
            return null;
        } catch (error) {
            console.error(`[Model Error - AuditModel.getDetail]:`, error);
            throw new Error("Lỗi khi trích xuất chi tiết nhật ký hệ thống.");
        }
    }
    /**
     * Ghi nhật ký thủ công cho các hành động không phải DML (ví dụ: Reveal, Export)
     */
    static async logManualAction(reqUser, data, transaction = null) {
        try {
            const tableName = data.tableName || data.TableName;
            const action = data.action || data.Action;
            const recordID = data.recordID || data.RecordID || null;
            const oldData = data.oldData || data.OldData || null;
            const newData = data.newData || data.NewData || null;

            const query = `
                INSERT INTO [System].[Audit] (TableName, Action, RecordID, OldData, NewData, ChangedBy, ChangedDate)
                VALUES (@tableName, @action, @recordID, @oldData, @newData, @changedBy, GETUTCDATE())
            `;
            const inputs = [
                { name: 'tableName', type: sql.NVarChar(100), value: tableName },
                { name: 'action',    type: sql.NVarChar(20), value: action },
                { name: 'recordID',  type: sql.NVarChar(50), value: recordID ? String(recordID) : null },
                { name: 'oldData',   type: sql.NVarChar(sql.MAX), value: oldData ? (typeof oldData === 'string' ? oldData : JSON.stringify(oldData)) : null },
                { name: 'newData',   type: sql.NVarChar(sql.MAX), value: newData ? (typeof newData === 'string' ? newData : JSON.stringify(newData)) : null },
                { name: 'changedBy', type: sql.VarChar(50), value: reqUser.MaNV }
            ];

            await DBHelper.queryWithContext(reqUser, query, inputs, null, transaction);
            return true;
        } catch (error) {
            console.error(`[Model Error - AuditModel.logManualAction]:`, error);
            // THROW lỗi để caller có thể ROLLBACK nếu đang trong transaction
            throw error;
        }
    }
}

module.exports = AuditModel;