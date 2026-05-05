const { sql } = require('../../config/db');
const DBHelper = require('../../utils/dbHelper');

class AttendanceModel {
    /**
     * Lấy thông tin chấm công hôm nay với UPDLOCK
     */
    static async getTodayAttendance(reqUser, maNV, today, transaction = null) {
        const query = `
            SELECT ChamCongID, GioVao, GioRa 
            FROM [HR].[ChamCong] WITH (UPDLOCK) 
            WHERE MaNV = @MaNV AND NgayChamCong = @Today
        `;
        const inputs = [
            { name: 'MaNV', type: sql.VarChar(20), value: maNV },
            { name: 'Today', type: sql.Date, value: today }
        ];
        const result = await DBHelper.queryWithContext(reqUser, query, inputs, null, transaction);
        return result.recordset[0] || null;
    }

    static async getById(reqUser, id) {
        const query = `SELECT * FROM [HR].[ChamCong] WHERE ChamCongID = @Id`;
        const result = await DBHelper.queryWithContext(reqUser, query, [{ name: 'Id', type: sql.Int, value: id }]);
        return result.recordset[0] || null;
    }

    /**
     * Tạo mới bản ghi chấm công (Check-in)
     */
    static async createCheckIn(reqUser, maNV, today, transaction = null) {
        const query = `
            INSERT INTO [HR].[ChamCong] (MaNV, NgayChamCong, GioVao, TrangThai)
            VALUES (@MaNV, @Today, GETDATE(), N'Chưa hoàn tất')
        `;
        const inputs = [
            { name: 'MaNV', type: sql.VarChar(20), value: maNV },
            { name: 'Today', type: sql.Date, value: today }
        ];
        return await DBHelper.queryWithContext(reqUser, query, inputs, null, transaction);
    }

    /**
     * Cập nhật bản ghi chấm công (Check-out)
     */
    static async updateCheckOut(reqUser, maNV, today, id, transaction = null) {
        const query = `
            UPDATE [HR].[ChamCong]
            SET GioRa = GETDATE()
            WHERE ChamCongID = @ID;

            -- Gọi Store Procedure tính toán đi trễ/về sớm
            EXEC [HR].[sp_TinhCongNgay] @MaNV = @MaNV, @NgayChamCong = @Today;
        `;
        const inputs = [
            { name: 'ID', type: sql.Int, value: id },
            { name: 'MaNV', type: sql.VarChar(20), value: maNV },
            { name: 'Today', type: sql.Date, value: today }
        ];
        return await DBHelper.queryWithContext(reqUser, query, inputs, null, transaction);
    }

    /**
     * Lấy danh sách chấm công toàn bộ (Dành cho Admin/HR)
     */
    static async getAll(reqUser, filters) {
        const { fromDate, toDate, maDonVi, trangThai, keyword } = filters;
        
        let query = `
            SELECT cc.*, nv.HoTen, dv.TenDonVi
            FROM [HR].[ChamCong] cc
            INNER JOIN [HR].[NhanVien] nv ON cc.MaNV = nv.MaNV
            LEFT JOIN [HR].[DonVi] dv ON nv.MaDonVi = dv.MaDonVi
            WHERE 1=1
        `;
        
        const inputs = [];

        if (fromDate) {
            query += ` AND cc.NgayChamCong >= @FromDate`;
            inputs.push({ name: 'FromDate', type: sql.Date, value: fromDate });
        }
        if (toDate) {
            query += ` AND cc.NgayChamCong <= @ToDate`;
            inputs.push({ name: 'ToDate', type: sql.Date, value: toDate });
        }
        if (maDonVi) {
            query += ` AND nv.MaDonVi = @MaDonVi`;
            inputs.push({ name: 'MaDonVi', type: sql.VarChar(20), value: maDonVi });
        }
        if (trangThai) {
            query += ` AND cc.TrangThai = @TrangThai`;
            inputs.push({ name: 'TrangThai', type: sql.NVarChar(50), value: trangThai });
        }
        if (keyword) {
            query += ` AND (cc.MaNV LIKE @Keyword OR nv.HoTen LIKE @Keyword)`;
            inputs.push({ name: 'Keyword', type: sql.NVarChar(100), value: `%${keyword}%` });
        }

        query += ` ORDER BY cc.NgayChamCong DESC, cc.GioVao DESC`;

        const result = await DBHelper.queryWithContext(reqUser, query, inputs);
        return result.recordset;
    }

    /**
     * Cập nhật thủ công (HR)
     */
    static async updateManual(reqUser, id, data, transaction = null) {
        const { gioVao, gioRa } = data;
        const query = `
            UPDATE [HR].[ChamCong]
            SET GioVao = @GioVao, GioRa = @GioRa
            WHERE ChamCongID = @Id;

            -- Lấy lại MaNV và Ngay để tính lại công
            DECLARE @MaNV VARCHAR(20), @Ngay DATE;
            SELECT @MaNV = MaNV, @Ngay = NgayChamCong FROM [HR].[ChamCong] WHERE ChamCongID = @Id;
            
            EXEC [HR].[sp_TinhCongNgay] @MaNV = @MaNV, @NgayChamCong = @Ngay;
        `;
        const inputs = [
            { name: 'Id', type: sql.Int, value: id },
            { name: 'GioVao', type: sql.DateTime2, value: gioVao },
            { name: 'GioRa', type: sql.DateTime2, value: gioRa }
        ];
        return await DBHelper.queryWithContext(reqUser, query, inputs, null, transaction);
    }

    /**
     * Lấy lịch sử chấm công của 1 nhân viên
     */
    static async getAttendanceHistory(reqUser, maNV, fromDate, toDate) {
        const query = `
            SELECT cc.*, nv.HoTen
            FROM [HR].[ChamCong] cc
            INNER JOIN [HR].[NhanVien] nv ON cc.MaNV = nv.MaNV
            WHERE cc.MaNV = @MaNV 
              AND cc.NgayChamCong BETWEEN @FromDate AND @ToDate
            ORDER BY cc.NgayChamCong DESC
        `;
        const inputs = [
            { name: 'MaNV', type: sql.VarChar(20), value: maNV },
            { name: 'FromDate', type: sql.Date, value: fromDate },
            { name: 'ToDate', type: sql.Date, value: toDate }
        ];
        const result = await DBHelper.queryWithContext(reqUser, query, inputs);
        return result.recordset;
    }
}

module.exports = AttendanceModel;
