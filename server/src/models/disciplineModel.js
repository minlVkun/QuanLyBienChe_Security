const { sql } = require('../config/db');
const DBHelper = require('../utils/dbHelper');

class DisciplineModel {
    // Lấy danh sách khen thưởng/kỷ luật của một nhân viên
    static async getByMaNV(reqUser, maNV) {
        const query = `
            SELECT 
                MaNV, Loai, HinhThuc, NgayQuyetDinh, SoQuyetDinh, NoiDung
            FROM [HR].[KhenThuongKyLuat] 
            WHERE MaNV = @MaNV 
            ORDER BY NgayQuyetDinh DESC
        `;
        const inputs = [{ name: 'MaNV', type: sql.VarChar, value: maNV }];
        
        try {
            const result = await DBHelper.queryWithContext(reqUser, query, inputs);
            return result.recordset || [];
        } catch (error) {
            throw error; // Quăng lỗi lên Service xử lý
        }
    }

    // Thêm quyết định khen thưởng hoặc kỷ luật mới
    static async create(reqUser, data) {
        const query = `
            INSERT INTO [HR].[KhenThuongKyLuat] 
            (MaNV, Loai, HinhThuc, NgayQuyetDinh, SoQuyetDinh, NoiDung)
            VALUES (@MaNV, @Loai, @HinhThuc, @NgayQuyetDinh, @SoQuyetDinh, @NoiDung);

            SELECT @@ROWCOUNT AS AffectedRows;
        `;
        const inputs = [
            { name: 'MaNV', type: sql.VarChar, value: data.MaNV },
            { name: 'Loai', type: sql.NVarChar, value: data.Loai },
            { name: 'HinhThuc', type: sql.NVarChar, value: data.HinhThuc },
            { name: 'NgayQuyetDinh', type: sql.Date, value: data.NgayQuyetDinh },
            { name: 'SoQuyetDinh', type: sql.VarChar, value: data.SoQuyetDinh || null },
            { name: 'NoiDung', type: sql.NVarChar, value: data.NoiDung || '' }
        ];
        
        try {
            const result = await DBHelper.queryWithContext(reqUser, query, inputs);
            return result.recordset[0].AffectedRows;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = DisciplineModel;