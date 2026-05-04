const { sql} = require('../../config/db');
const DBHelper = require('../../utils/dbHelper');

class WorkHistory {
    static async getByMaNV(reqUser, maNV) {
        const query = `
            SELECT 
                ct.*, 
                dv.TenDonVi, 
                cv.TenChucVu 
            FROM [HR].[QuaTrinhCongTac] ct
            LEFT JOIN [HR].[DonVi] dv ON ct.MaDonVi = dv.MaDonVi
            LEFT JOIN [HR].[ChucVu] cv ON ct.MaChucVu = cv.MaChucVu
            WHERE ct.MaNV = @MaNV
            ORDER BY ct.TuNgay DESC, ct.ID_CT DESC;
        `;
        const inputs = [{ name: 'MaNV', type: sql.VarChar, value: maNV }];
        const result = await DBHelper.queryWithContext(reqUser, query, inputs);
        return result.recordset;
    }   

    static async create(reqUser, data) {
        const query = `
            INSERT INTO [HR].[QuaTrinhCongTac] 
            (MaNV, TuNgay, DenNgay, MaDonVi, MaChucVu, NoiDung)
            VALUES 
            (@MaNV, @TuNgay, @DenNgay, @MaDonVi, @MaChucVu, @NoiDung);

            SELECT SCOPE_IDENTITY() AS InsertedId;
        `;  
        const inputs = [
            { name: 'MaNV', type: sql.VarChar, value: data.MaNV },
            { name: 'TuNgay', type: sql.Date, value: data.TuNgay },
            { name: 'DenNgay', type: sql.Date, value: data.DenNgay || null },
            { name: 'MaDonVi', type: sql.VarChar, value: data.MaDonVi },
            { name: 'MaChucVu', type: sql.VarChar, value: data.MaChucVu },
            { name: 'NoiDung', type: sql.NVarChar, value: data.NoiDung }
        ];
        const result = await DBHelper.queryWithContext(reqUser, query, inputs);
        return result.recordset[0];
    }

    /**
     * Chốt lịch sử công tác hiện tại (set DenNgay = ngày hiện tại)
     * Dùng trong Transaction
     */
    /**
     * Chốt lịch sử công tác hiện tại (set DenNgay = ngày hiện tại)
     * Dùng trong Transaction
     * BẢO MẬT: Sử dụng DBHelper.queryWithContext để đảm bảo RLS context được set.
     */
    static async updateActiveHistory(transaction, reqUser, maNV, denNgay) {
        const query = `
            UPDATE [HR].[QuaTrinhCongTac]
            SET DenNgay = @DenNgay
            WHERE MaNV = @MaNV AND (DenNgay IS NULL OR DenNgay > @DenNgay);
        `;
        const inputs = [
            { name: 'MaNV', type: sql.VarChar, value: maNV },
            { name: 'DenNgay', type: sql.Date, value: denNgay }
        ];
        return await DBHelper.queryWithContext(reqUser, query, inputs, null, transaction);
    }

    /**
     * Tạo lịch sử công tác mới trong Transaction
     */
    /**
     * Tạo lịch sử công tác mới trong Transaction
     * BẢO MẬT: Sử dụng DBHelper.queryWithContext để đảm bảo RLS context được set.
     */
    static async createWithTransaction(transaction, reqUser, data) {
        const query = `
            INSERT INTO [HR].[QuaTrinhCongTac] 
            (MaNV, TuNgay, DenNgay, MaDonVi, MaChucVu, NoiDung)
            VALUES 
            (@MaNV, @TuNgay, @DenNgay, @MaDonVi, @MaChucVu, @NoiDung);
        `;
        const inputs = [
            { name: 'MaNV', type: sql.VarChar, value: data.MaNV },
            { name: 'TuNgay', type: sql.Date, value: data.TuNgay },
            { name: 'DenNgay', type: sql.Date, value: data.DenNgay || null },
            { name: 'MaDonVi', type: sql.VarChar, value: data.MaDonVi },
            { name: 'MaChucVu', type: sql.VarChar, value: data.MaChucVu },
            { name: 'NoiDung', type: sql.NVarChar, value: data.NoiDung }
        ];
        return await DBHelper.queryWithContext(reqUser, query, inputs, null, transaction);
    }
}

module.exports = WorkHistory;