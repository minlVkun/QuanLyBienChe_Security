const { sql } = require('../../config/db');
const DBHelper = require('../../utils/dbHelper');

class ShiftModel {
    static async getAll(reqUser) {
        const query = `SELECT * FROM [HR].[CaLamViec] ORDER BY MaCa`;
        const result = await DBHelper.queryWithContext(reqUser, query);
        return result.recordset;
    }

    static async getById(reqUser, maCa) {
        const query = `SELECT * FROM [HR].[CaLamViec] WHERE MaCa = @MaCa`;
        const inputs = [{ name: 'MaCa', type: sql.VarChar(20), value: maCa }];
        const result = await DBHelper.queryWithContext(reqUser, query, inputs);
        return result.recordset[0];
    }

    static async create(reqUser, data) {
        const query = `
            INSERT INTO [HR].[CaLamViec] (MaCa, TenCa, GioBatDau, GioKetThuc, PhutChoPhepTre)
            VALUES (@MaCa, @TenCa, @GioBatDau, @GioKetThuc, @PhutChoPhepTre)
        `;
        const inputs = [
            { name: 'MaCa', type: sql.VarChar(20), value: data.maCa },
            { name: 'TenCa', type: sql.NVarChar(100), value: data.tenCa },
            { name: 'GioBatDau', type: sql.Time, value: data.gioBatDau },
            { name: 'GioKetThuc', type: sql.Time, value: data.gioKetThuc },
            { name: 'PhutChoPhepTre', type: sql.Int, value: data.phutChoPhepTre || 0 }
        ];
        return await DBHelper.queryWithContext(reqUser, query, inputs);
    }

    static async update(reqUser, maCa, data) {
        const query = `
            UPDATE [HR].[CaLamViec]
            SET TenCa = @TenCa,
                GioBatDau = @GioBatDau,
                GioKetThuc = @GioKetThuc,
                PhutChoPhepTre = @PhutChoPhepTre
            WHERE MaCa = @MaCa
        `;
        const inputs = [
            { name: 'MaCa', type: sql.VarChar(20), value: maCa },
            { name: 'TenCa', type: sql.NVarChar(100), value: data.tenCa },
            { name: 'GioBatDau', type: sql.Time, value: data.gioBatDau },
            { name: 'GioKetThuc', type: sql.Time, value: data.gioKetThuc },
            { name: 'PhutChoPhepTre', type: sql.Int, value: data.phutChoPhepTre || 0 }
        ];
        return await DBHelper.queryWithContext(reqUser, query, inputs);
    }

    static async delete(reqUser, maCa) {
        const query = `DELETE FROM [HR].[CaLamViec] WHERE MaCa = @MaCa`;
        const inputs = [{ name: 'MaCa', type: sql.VarChar(20), value: maCa }];
        return await DBHelper.queryWithContext(reqUser, query, inputs);
    }
}

module.exports = ShiftModel;
