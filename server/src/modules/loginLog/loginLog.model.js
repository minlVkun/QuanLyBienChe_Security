const { sql } = require('../../config/db');
const DBHelper = require('../../utils/dbHelper');

class LoginLogModel {
    static async getLogs(reqUser, filters) {
        const { loginName, fromDate, toDate, hostName, page = 1, limit = 10 } = filters;
        const offset = (page - 1) * limit;

        let whereClause = 'WHERE 1=1';
        const inputs = [
            { name: 'Offset', type: sql.Int, value: offset },
            { name: 'Limit', type: sql.Int, value: limit }
        ];

        if (loginName) {
            whereClause += ' AND LoginName LIKE @LoginName';
            inputs.push({ name: 'LoginName', type: sql.NVarChar, value: `%${loginName}%` });
        }

        if (fromDate) {
            whereClause += ' AND LoginTime >= @FromDate';
            inputs.push({ name: 'FromDate', type: sql.DateTime, value: fromDate });
        }

        if (toDate) {
            whereClause += ' AND LoginTime <= @ToDate';
            inputs.push({ name: 'ToDate', type: sql.DateTime, value: toDate });
        }

        if (hostName) {
            whereClause += ' AND HostName LIKE @HostName';
            inputs.push({ name: 'HostName', type: sql.NVarChar, value: `%${hostName}%` });
        }

        const query = `
            SELECT 
                LogID,
                LoginName,
                LoginTime,
                HostName,
                AppName,
                COUNT(*) OVER() as TotalRows
            FROM System.LoginLogs
            ${whereClause}
            ORDER BY LoginTime DESC
            OFFSET @Offset ROWS
            FETCH NEXT @Limit ROWS ONLY
        `;

        try {
            const result = await DBHelper.queryWithContext(reqUser, query, inputs);
            return result.recordset;
        } catch (error) {
            throw new Error("Lỗi khi lấy danh sách log đăng nhập: " + error.message);
        }
    }
}

module.exports = LoginLogModel;
