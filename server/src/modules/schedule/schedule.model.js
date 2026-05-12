// src/modules/schedule/schedule.model.js
const { sql } = require('../../config/db');
const DBHelper = require('../../utils/dbHelper');

class ScheduleModel {
    /**
     * Lấy danh sách lịch làm việc (có phân trang + lọc theo tuần/nhân viên/đơn vị)
     */
    static async getAll(reqUser, filters = {}) {
        const { fromDate, toDate, maNV, maDonVi, page = 1, limit = 50 } = filters;
        const offset = (page - 1) * limit;

        let query = `
            SELECT
                l.LichID,
                l.MaNV,
                nv.HoTen,
                dv.TenDonVi,
                l.MaCaLamViec,
                ca.TenCa,
                ca.GioBatDau,
                ca.GioKetThuc,
                l.Ngay AS NgayLam,
                l.GhiChu,
                COUNT(*) OVER() AS TotalRows
            FROM [HR].[LichLamViec] l
            INNER JOIN [HR].[NhanVien] nv ON l.MaNV = nv.MaNV
            INNER JOIN [HR].[CaLamViec] ca ON l.MaCaLamViec = ca.MaCaLamViec
            LEFT  JOIN [HR].[DonVi] dv ON nv.MaDonVi = dv.MaDonVi
            WHERE 1=1
        `;

        const inputs = [
            { name: 'Offset', type: sql.Int, value: offset },
            { name: 'Limit',  type: sql.Int, value: limit  }
        ];

        if (fromDate) {
            query += ` AND l.Ngay >= @FromDate`;
            inputs.push({ name: 'FromDate', type: sql.Date, value: fromDate });
        }
        if (toDate) {
            query += ` AND l.Ngay <= @ToDate`;
            inputs.push({ name: 'ToDate', type: sql.Date, value: toDate });
        }
        if (maNV) {
            query += ` AND l.MaNV = @MaNV`;
            inputs.push({ name: 'MaNV', type: sql.VarChar(20), value: maNV });
        }
        if (maDonVi) {
            query += ` AND nv.MaDonVi = @MaDonVi`;
            inputs.push({ name: 'MaDonVi', type: sql.VarChar(20), value: maDonVi });
        }

        query += `
            ORDER BY l.Ngay ASC, nv.HoTen ASC
            OFFSET @Offset ROWS FETCH NEXT @Limit ROWS ONLY
        `;

        const result = await DBHelper.queryWithContext(reqUser, query, inputs);
        return result.recordset;
    }

    /**
     * Lấy 1 bản ghi theo ID
     */
    static async getById(reqUser, id, transaction = null) {
        const query = `
            SELECT l.*, nv.HoTen, ca.TenCa, ca.GioBatDau, ca.GioKetThuc
            FROM [HR].[LichLamViec] l
            INNER JOIN [HR].[NhanVien] nv ON l.MaNV = nv.MaNV
            INNER JOIN [HR].[CaLamViec] ca ON l.MaCaLamViec = ca.MaCaLamViec
            WHERE l.LichID = @LichID
        `;
        const inputs = [{ name: 'LichID', type: sql.Int, value: id }];
        const result = await DBHelper.queryWithContext(reqUser, query, inputs, {}, transaction);
        return result.recordset[0] || null;
    }

    /**
     * Kiểm tra xem nhân viên đã có lịch trong ngày đó chưa (phát hiện trùng lịch)
     */
    static async checkConflict(reqUser, maNV, ngayLam, excludeId = null, transaction = null) {
        let query = `
            SELECT COUNT(*) AS ConflictCount
            FROM [HR].[LichLamViec]
            WHERE MaNV = @MaNV AND Ngay = @NgayLam
        `;
        const inputs = [
            { name: 'MaNV',   type: sql.VarChar(20), value: maNV   },
            { name: 'NgayLam', type: sql.Date,        value: ngayLam }
        ];
        if (excludeId) {
            query += ` AND LichID <> @ExcludeId`;
            inputs.push({ name: 'ExcludeId', type: sql.Int, value: excludeId });
        }
        const result = await DBHelper.queryWithContext(reqUser, query, inputs, {}, transaction);
        return result.recordset[0].ConflictCount > 0;
    }

    /**
     * Tạo mới 1 lịch làm việc
     */
    static async create(reqUser, data, transaction = null) {
        const query = `
            INSERT INTO [HR].[LichLamViec] (MaNV, MaCaLamViec, Ngay, GhiChu)
            OUTPUT INSERTED.LichID
            VALUES (@MaNV, @MaCa, @NgayLam, @GhiChu)
        `;
        const inputs = [
            { name: 'MaNV',   type: sql.VarChar(20),   value: data.maNV        },
            { name: 'MaCa',   type: sql.VarChar(10),   value: data.maCaLamViec },
            { name: 'NgayLam', type: sql.Date,          value: data.ngayLam     },
            { name: 'GhiChu', type: sql.NVarChar(500), value: data.ghiChu || null }
        ];
        const result = await DBHelper.queryWithContext(reqUser, query, inputs, {}, transaction);
        return result.recordset[0];
    }

    /**
     * Cập nhật ca hoặc ghi chú của 1 lịch
     */
    static async update(reqUser, id, data, transaction = null) {
        const query = `
            UPDATE [HR].[LichLamViec]
            SET MaCaLamViec = @MaCa,
                Ngay        = @NgayLam,
                GhiChu      = @GhiChu
            WHERE LichID = @LichID
        `;
        const inputs = [
            { name: 'LichID',  type: sql.Int,          value: id               },
            { name: 'MaCa',    type: sql.VarChar(10),  value: data.maCaLamViec },
            { name: 'NgayLam', type: sql.Date,         value: data.ngayLam     },
            { name: 'GhiChu',  type: sql.NVarChar(500), value: data.ghiChu || null }
        ];
        return await DBHelper.queryWithContext(reqUser, query, inputs, {}, transaction);
    }

    /**
     * Xóa 1 lịch làm việc
     */
    static async delete(reqUser, id, transaction = null) {
        const query = `DELETE FROM [HR].[LichLamViec] WHERE LichID = @LichID`;
        const inputs = [{ name: 'LichID', type: sql.Int, value: id }];
        return await DBHelper.queryWithContext(reqUser, query, inputs, {}, transaction);
    }

    static async bulkAssign(reqUser, records, transaction = null) {
        // MẶC DÙ ĐÂY LÀ N+1 QUERY, NHƯNG BẮT BUỘC PHẢI DÙNG VÒNG LẶP DO ALWAYS ENCRYPTED!
        // Nếu dùng OPENJSON, SQL Server không thể tự mã hóa MaNV để JOIN với cột MaNV đã mã hóa.
        // Bắt buộc phải truyền @MaNV dưới dạng parameter để thư viện mssql ở Node.js mã hóa trước khi gửi đi.
        const query = `
            MERGE [HR].[LichLamViec] AS target
            USING (SELECT @MaNV AS MaNV, @MaCa AS MaCaLamViec, @NgayLam AS NgayLam) AS src
            ON (target.MaNV = src.MaNV AND target.Ngay = src.NgayLam)
            WHEN NOT MATCHED THEN
                INSERT (MaNV, MaCaLamViec, Ngay, GhiChu)
                VALUES (src.MaNV, src.MaCaLamViec, src.NgayLam, @GhiChu);
        `;

        let inserted = 0;
        for (const rec of records) {
            const inputs = [
                { name: 'MaNV',   type: sql.VarChar(20),   value: rec.maNV        },
                { name: 'MaCa',   type: sql.VarChar(10),   value: rec.maCaLamViec },
                { name: 'NgayLam', type: sql.Date,          value: rec.ngayLam     },
                { name: 'GhiChu', type: sql.NVarChar(500), value: rec.ghiChu || null }
            ];
            await DBHelper.queryWithContext(reqUser, query, inputs, {}, transaction);
            inserted++;
        }
        return { inserted };
    }
}

module.exports = ScheduleModel;
