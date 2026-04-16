//src/models/insuranceLogModel.js
const { sql } = require('../config/db');
const DBHelper = require('../utils/dbHelper');

class InsuranceLogModel {
    static async getLogs(reqUser, maNV) {
        try {
            const query = `
                SELECT * FROM [Salary].[LichSuBaoHiem]
                WHERE MaNV = @maNV
                ORDER BY TuThangYear DESC
            `;

            const inputs = [{ 
                name: 'maNV', type: sql.VarChar, value: maNV 
            }];

            const result = await DBHelper.queryWithContext(reqUser, query, inputs);
            return result.recordset;
        }
        catch (err) {
            throw err;
        }
    }
}

module.exports = InsuranceLogModel;