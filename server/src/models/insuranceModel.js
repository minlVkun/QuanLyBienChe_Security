//src/models/insuranceLogModel.js
const { sql } = require('../config/db');
const DBHelper = require('../utils/dbHelper');

class InsuranceModel {
    static async getInsurance(reqUser, maNV) {
        try {
            const query = `
                SELECT * FROM [Salary].[BaoHiem]
                WHERE MaNV = @maNV
            `;

            const inputs = [{ 
                name: 'maNV', type: sql.VarChar, value: maNV 
            }];

            const result = await DBHelper.queryWithContext(reqUser, query, inputs);
            return result.recordset[0];
        }
        catch (err) {
            throw err;
        }
    }

    static async updateInsurance(reqUser, maNV, data) {
        try {
            const query = `
                UPDATE [Salary].[BaoHiem]
                SET MaSoBHYT = @MaSoBHYT, NoiDANGKY_KCB = @NoiDANGKY_KCB
                WHERE MaNV = @MaNV
            `;

            const inputs = [
                { name: 'MaSoBHYT', type: sql.VarChar, value: data.MaSoBHYT },
                { name: 'NoiDANGKY_KCB', type: sql.NVarChar, value: data.NoiDANGKY_KCB },
                { name: 'MaNV', type: sql.VarChar, value: maNV }
            ];
            const result = await DBHelper.queryWithContext(reqUser, query, inputs);
            return result;
        }
        catch (err) {
            throw err;
        }
    }
}

module.exports = InsuranceModel;