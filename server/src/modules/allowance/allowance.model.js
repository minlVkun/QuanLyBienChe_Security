const { sql } = require('../../config/db');
const DBHelper = require('../../utils/dbHelper');

class AllowanceModel {
    static async getById(reqUser, id) {
        const query = `SELECT * FROM HR.PhuCapCoDinh WHERE ID_PhuCap = @Id`;
        const inputs = [{ name: 'Id', type: sql.Int, value: id }];
        const result = await DBHelper.queryWithContext(reqUser, query, inputs);
        return result.recordset[0] || null;
    }
    static async getByEmployeeId(reqUser, maNV) {
        const query = `SELECT ID_PhuCap as Id, TenPhuCap, SoTien, IsActive, NgayTao FROM HR.PhuCapCoDinh WHERE MaNV = @MaNV ORDER BY NgayTao DESC`;
        const inputs = [{ name: 'MaNV', type: sql.VarChar, value: maNV }];
        const result = await DBHelper.queryWithContext(reqUser, query, inputs);
        return result.recordset;
    }

    static async checkDuplicate(reqUser, maNV, tenPhuCap, excludeId = null) {
        let query = `SELECT 1 FROM HR.PhuCapCoDinh WHERE MaNV = @MaNV AND TenPhuCap = @TenPhuCap`;
        const inputs = [
            { name: 'MaNV', type: sql.VarChar, value: maNV },
            { name: 'TenPhuCap', type: sql.NVarChar, value: tenPhuCap }
        ];
        if (excludeId) {
            query += ` AND ID_PhuCap <> @Id`;
            inputs.push({ name: 'Id', type: sql.Int, value: excludeId });
        }
        const result = await DBHelper.queryWithContext(reqUser, query, inputs);
        return result.recordset.length > 0;
    }

    static async create(reqUser, data) {
        const query = `
            INSERT INTO HR.PhuCapCoDinh (MaNV, TenPhuCap, SoTien, IsActive)
            VALUES (@MaNV, @TenPhuCap, @SoTien, @IsActive)
        `;
        const inputs = [
            { name: 'MaNV', type: sql.VarChar, value: data.MaNV },
            { name: 'TenPhuCap', type: sql.NVarChar, value: data.TenPhuCap },
            { name: 'SoTien', type: sql.Decimal(18, 2), value: data.SoTien },
            { name: 'IsActive', type: sql.Bit, value: data.IsActive ?? 1 }
        ];
        await DBHelper.queryWithContext(reqUser, query, inputs);
    }

    static async update(reqUser, id, data) {
        const query = `
            UPDATE HR.PhuCapCoDinh
            SET TenPhuCap = @TenPhuCap, SoTien = @SoTien, IsActive = @IsActive
            WHERE ID_PhuCap = @Id
        `;
        const inputs = [
            { name: 'Id', type: sql.Int, value: id },
            { name: 'TenPhuCap', type: sql.NVarChar, value: data.TenPhuCap },
            { name: 'SoTien', type: sql.Decimal(18, 2), value: data.SoTien },
            { name: 'IsActive', type: sql.Bit, value: data.IsActive }
        ];
        await DBHelper.queryWithContext(reqUser, query, inputs);
    }

    static async delete(reqUser, id) {
        const query = `DELETE FROM HR.PhuCapCoDinh WHERE ID_PhuCap = @Id`;
        const inputs = [{ name: 'Id', type: sql.Int, value: id }];
        await DBHelper.queryWithContext(reqUser, query, inputs);
    }
}

module.exports = AllowanceModel;
