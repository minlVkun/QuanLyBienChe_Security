//src/models/insuranceLogModel.js
const { sql } = require('../../config/db');
const DBHelper = require('../../utils/dbHelper');
const AppError = require('../../utils/AppError');

class InsuranceLogModel {
    static async getLogs(reqUser, maNV, { page = 1, limit = 10 } = {}) {
        try {
            const offset = (page - 1) * limit;
            const query = `
                SELECT *, COUNT(*) OVER() as TotalRows 
                FROM [Salary].[LichSuDongBaoHiem]
                WHERE MaNV = @maNV
                ORDER BY TuThangYear DESC
                OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
            `;

            const inputs = [
                { name: 'maNV', type: sql.VarChar, value: maNV },
                { name: 'offset', type: sql.Int, value: offset },
                { name: 'limit', type: sql.Int, value: limit }
            ];

            const result = await DBHelper.queryWithContext(reqUser, query, inputs);
            return result.recordset;
        } catch (err) {
            console.error("Database Error (InsuranceLogModel.getLogs):", err);
            throw new AppError('Có lỗi xảy ra khi truy vấn dữ liệu bảo hiểm', 500);
        }
    }
}

module.exports = InsuranceLogModel;