const { sql } = require('../../config/db');
const DBHelper = require('../../utils/dbHelper');

class ContractModel {
    static async getAll(reqUser) {
        const query = `
            SELECT h.*, n.HoTen, n.MaDonVi
            FROM [Salary].[HopDong] h
            INNER JOIN [HR].[NhanVien] n ON h.MaNV = n.MaNV
            ORDER BY h.NgayKy DESC
        `;
        const result = await DBHelper.queryWithContext(reqUser, query);
        return result.recordset;
    }

    static async getByEmployeeId(reqUser, employeeId) {
        const query = `
            SELECT h.*, n.HoTen
            FROM [Salary].[HopDong] h
            INNER JOIN [HR].[NhanVien] n ON h.MaNV = n.MaNV
            WHERE h.MaNV = @MaNV
            ORDER BY h.NgayKy DESC
        `;
        const inputs = [{ name: 'MaNV', type: sql.VarChar, value: employeeId }];
        const result = await DBHelper.queryWithContext(reqUser, query, inputs);
        return result.recordset;
    }

    static async getById(reqUser, maHopDong) {
        const query = `
            SELECT h.*, n.HoTen
            FROM [Salary].[HopDong] h
            INNER JOIN [HR].[NhanVien] n ON h.MaNV = n.MaNV
            WHERE h.MaHopDong = @MaHopDong
        `;
        const inputs = [{ name: 'MaHopDong', type: sql.VarChar, value: maHopDong }];
        const result = await DBHelper.queryWithContext(reqUser, query, inputs);
        return result.recordset[0] || null;
    }

    static async create(reqUser, data) {
        const query = `
            INSERT INTO [Salary].[HopDong] 
            (MaHopDong, MaNV, LoaiHopDong, NgayKy, NgayCoHieuLuc, NgayHetHan, TrangThai, TepDinhKem)
            VALUES 
            (@MaHopDong, @MaNV, @LoaiHopDong, @NgayKy, @NgayCoHieuLuc, @NgayHetHan, @TrangThai, @TepDinhKem);
        `;
        const inputs = [
            { name: 'MaHopDong', type: sql.VarChar, value: data.MaHopDong },
            { name: 'MaNV', type: sql.VarChar, value: data.MaNV },
            { name: 'LoaiHopDong', type: sql.NVarChar, value: data.LoaiHopDong },
            { name: 'NgayKy', type: sql.Date, value: data.NgayKy },
            { name: 'NgayCoHieuLuc', type: sql.Date, value: data.NgayCoHieuLuc },
            { name: 'NgayHetHan', type: sql.Date, value: data.NgayHetHan || null },
            { name: 'TrangThai', type: sql.NVarChar, value: data.TrangThai || 'Đang hiệu lực' },
            { name: 'TepDinhKem', type: sql.NVarChar, value: data.TepDinhKem || null }
        ];
        await DBHelper.queryWithContext(reqUser, query, inputs);
    }

    static async getMaxMaHopDong(reqUser, year) {
        const query = `
            SELECT MAX(CAST(SUBSTRING(MaHopDong, 9, 4) AS INT)) as MaxSeq
            FROM [Salary].[HopDong]
            WHERE MaHopDong LIKE 'HD-' + @Year + '-%'
        `;
        const inputs = [{ name: 'Year', type: sql.VarChar, value: year.toString() }];
        const result = await DBHelper.queryWithContext(reqUser, query, inputs);
        return result.recordset[0].MaxSeq || 0;
    }

    static async update(reqUser, maHopDong, data) {
        const query = `
            UPDATE [Salary].[HopDong] 
            SET LoaiHopDong = @LoaiHopDong, 
                NgayKy = @NgayKy, 
                NgayCoHieuLuc = @NgayCoHieuLuc, 
                NgayHetHan = @NgayHetHan, 
                TrangThai = @TrangThai, 
                TepDinhKem = ISNULL(@TepDinhKem, TepDinhKem)
            WHERE MaHopDong = @MaHopDong;
        `;
        const inputs = [
            { name: 'MaHopDong', type: sql.VarChar, value: maHopDong },
            { name: 'LoaiHopDong', type: sql.NVarChar, value: data.LoaiHopDong },
            { name: 'NgayKy', type: sql.Date, value: data.NgayKy },
            { name: 'NgayCoHieuLuc', type: sql.Date, value: data.NgayCoHieuLuc },
            { name: 'NgayHetHan', type: sql.Date, value: data.NgayHetHan || null },
            { name: 'TrangThai', type: sql.NVarChar, value: data.TrangThai },
            { name: 'TepDinhKem', type: sql.NVarChar, value: data.TepDinhKem || null }
        ];
        await DBHelper.queryWithContext(reqUser, query, inputs);
    }

    static async delete(reqUser, maHopDong) {
        const query = `DELETE FROM [Salary].[HopDong] WHERE MaHopDong = @MaHopDong`;
        const inputs = [{ name: 'MaHopDong', type: sql.VarChar, value: maHopDong }];
        await DBHelper.queryWithContext(reqUser, query, inputs);
    }
}

module.exports = ContractModel;
