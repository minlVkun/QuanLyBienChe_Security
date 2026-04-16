//src/utils/dbHelper.js
const {poolPromise, sql} = require('../config/db');

class DBHelper {
    /**
     * @param {Object} reqUser - Thông tin người dùng từ token
     * @param {string} queryString - Câu lệnh SQL hoặc stored procedure cần thực thi
     * @param {Array} inputs - Mảng các tham số đầu vào cho câu lệnh SQL, mỗi phần tử có dạng { name, type, value }
     */
    static async queryWithContext(reqUser, queryString, inputs = []) {
        const pool = await poolPromise;
        const request = pool.request();
        const userName = reqUser.role.replace('db_', ''); // Lấy phần sau "db_" để làm tên người dùng
        request.input('ctx_UserName', sql.NVarChar, userName);
        request.input('ctx_UserRole', sql.NVarChar, reqUser.role);
        request.input('ctx_MaNV', sql.VarChar, reqUser.MaNV);

        inputs.forEach(param => {
            request.input(param.name, param.type, param.value);
        });

        const result = `
            EXECUTE AS USER = @ctx_UserName;
            EXEC sp_set_session_context @key = N'MaNV', @value = @ctx_MaNV, @read_only = 0;
            EXEC sp_set_session_context @key = N'UserRole', @value = @ctx_UserRole, @read_only = 0;

            ${queryString}

            REVERT;
        `;

        return await request.query(result);
    }
}

module.exports = DBHelper;