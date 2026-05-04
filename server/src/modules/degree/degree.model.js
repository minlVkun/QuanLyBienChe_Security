//src/models/degreeModel.js
const { sql } = require('../../config/db');
const DBHelper = require('../../utils/dbHelper');

class DegreeModel {
    static async getById(reqUser, idBang) {
        const query = 'SELECT * FROM [HR].[BangCap] WHERE ID_Bang = @ID_Bang';
        const inputs = [{ name: 'ID_Bang', type: sql.Int, value: idBang }];
        const result = await DBHelper.queryWithContext(reqUser, query, inputs);
        return result.recordset[0] || null;
    }
    // Lấy danh sách bằng cấp của một nhân viên cụ thể
    static async getByMaNV(reqUser, maNV) {
        const query = 'SELECT * FROM [HR].[BangCap] WHERE MaNV = @MaNV';
        const inputs = [{ name: 'MaNV', type: sql.VarChar, value: maNV }];
        const result = await DBHelper.queryWithContext(reqUser, query, inputs);
        return result.recordset;
    }

    // Thêm bằng cấp mới
    static async create(reqUser, data) {
        const query = `
            INSERT INTO [HR].[BangCap] (MaNV, LoaiBang, ChuyenNganh, NoiDaoTao, NamTotNghiep)
            VALUES (@MaNV, @LoaiBang, @ChuyenNganh, @NoiDaoTao, @NamTotNghiep)
        `;
        const inputs = [
            { name: 'MaNV', type: sql.VarChar, value: data.MaNV },
            { name: 'LoaiBang', type: sql.NVarChar, value: data.LoaiBang },
            { name: 'ChuyenNganh', type: sql.NVarChar, value: data.ChuyenNganh },
            { name: 'NoiDaoTao', type: sql.NVarChar, value: data.NoiDaoTao },
            { name: 'NamTotNghiep', type: sql.Int, value: data.NamTotNghiep }
        ];
        const result = await DBHelper.queryWithContext(reqUser, query, inputs);
        return result.rowsAffected[0];
    }

    // Xóa bằng cấp (Xóa vật lý vì đây là dữ liệu bổ trợ, có Audit Log bảo vệ)
    static async delete(reqUser, idBang) {
        const query = 'DELETE FROM [HR].[BangCap] WHERE ID_Bang = @ID_Bang';
        const inputs = [{ name: 'ID_Bang', type: sql.Int, value: idBang }];
        const result = await DBHelper.queryWithContext(reqUser, query, inputs);
        return result.rowsAffected[0];
    }
}

module.exports = DegreeModel;