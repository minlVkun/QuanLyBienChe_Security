const { sql } = require('../config/db');
const DBHelper = require('../utils/dbHelper');

class ChucVuModel {
    // Lấy danh sách tất cả chức vụ
    static async getAll(reqUser) {
        try {
            const query = `
                SELECT 
                    MaChucVu, 
                    TenChucVu, 
                    PhuCapChucVu 
                FROM [HR].[ChucVu]
                ORDER BY PhuCapChucVu DESC -- Sắp xếp theo phụ cấp từ cao xuống thấp
            `;
            const result = await DBHelper.queryWithContext(reqUser, query);
            return result.recordset;
        } catch (err) {
            console.error("[Model Error - ChucVuModel.getAll]:", err);
            throw err;
        }
    }

    // Lấy chi tiết 1 chức vụ theo mã
    static async getById(reqUser, maChucVu) {
        try {
            const query = `
                SELECT MaChucVu, TenChucVu, PhuCapChucVu 
                FROM [HR].[ChucVu] 
                WHERE MaChucVu = @MaChucVu
            `;
            const inputs = [{ name: 'MaChucVu', type: sql.VarChar, value: maChucVu }];
            const result = await DBHelper.queryWithContext(reqUser, query, inputs);
            return result.recordset[0];
        } catch (err) {
            throw err;
        }
    }

    // Thêm mới chức vụ
    static async create(reqUser, data) {
        try {
            const query = `
                INSERT INTO [HR].[ChucVu] (MaChucVu, TenChucVu, PhuCapChucVu)
                VALUES (@MaChucVu, @TenChucVu, @PhuCapChucVu)
            `;
            const inputs = [
                { name: 'MaChucVu', type: sql.VarChar, value: data.MaChucVu },
                { name: 'TenChucVu', type: sql.NVarChar, value: data.TenChucVu },
                { name: 'PhuCapChucVu', type: sql.Decimal(5, 2), value: data.PhuCapChucVu || 0.00 }
            ];
            await DBHelper.queryWithContext(reqUser, query, inputs);
            return true;
        } catch (err) {
            throw err;
        }
    }

    // Cập nhật chức vụ
    static async update(reqUser, maChucVu, data) {
        try {
            const query = `
                UPDATE [HR].[ChucVu]
                SET 
                    TenChucVu = @TenChucVu,
                    PhuCapChucVu = @PhuCapChucVu
                WHERE MaChucVu = @MaChucVu
            `;
            const inputs = [
                { name: 'MaChucVu', type: sql.VarChar, value: maChucVu },
                { name: 'TenChucVu', type: sql.NVarChar, value: data.TenChucVu },
                { name: 'PhuCapChucVu', type: sql.Decimal(5, 2), value: data.PhuCapChucVu || 0.00 }
            ];
            await DBHelper.queryWithContext(reqUser, query, inputs);
            return true;
        } catch (err) {
            throw err;
        }
    }

    // Xóa chức vụ
    static async delete(reqUser, maChucVu) {
        try {
            const query = `DELETE FROM [HR].[ChucVu] WHERE MaChucVu = @MaChucVu`;
            const inputs = [{ name: 'MaChucVu', type: sql.VarChar, value: maChucVu }];
            await DBHelper.queryWithContext(reqUser, query, inputs);
            return true;
        } catch (err) {
            throw err;
        }
    }
}

module.exports = ChucVuModel;