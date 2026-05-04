const { sql } = require('../../config/db');
const DBHelper = require('../../utils/dbHelper');

class DashboardModel {
    static async getStats(reqUser) {
        // KHÔNG CẦN WHERE MaDonVi = ... 
        // Vì RLS trong DBHelper queryWithContext đã tự động filter theo Session Context của user!
        const query = `
            SELECT 
                (SELECT ISNULL(COUNT(MaNV), 0) FROM HR.NhanVien WHERE TrangThai = 1) AS TotalEmployees,
                (SELECT ISNULL(SUM(ThucLanh), 0) 
                 FROM Salary.BangLuong 
                 -- Dùng FORMAT để tạo ra chuỗi 'MM/yyyy' khớp với cột ThangNam
                 WHERE ThangNam = FORMAT(GETDATE(), 'MM/yyyy')) AS TotalPayroll,
                (SELECT ISNULL(COUNT(MaNV), 0) FROM HR.NhanVien 
                 WHERE TrangThai = 1 
                 AND MONTH(NgayVaoBienChe) = MONTH(GETDATE()) 
                 AND YEAR(NgayVaoBienChe) = YEAR(GETDATE())) AS NewHires
        `;
        const result = await DBHelper.queryWithContext(reqUser, query);
        return result.recordset[0] || { TotalEmployees: 0, TotalPayroll: 0, NewHires: 0 };
    }

    static async getChartData(reqUser) {
        const queryDept = `
            SELECT dv.TenDonVi AS dept, ISNULL(SUM(bl.ThucLanh), 0) AS cost
            FROM HR.DonVi dv
            LEFT JOIN HR.NhanVien nv ON dv.MaDonVi = nv.MaDonVi AND nv.TrangThai = 1
            LEFT JOIN Salary.BangLuong bl ON nv.MaNV = bl.MaNV 
                -- Khớp với cột ThangNam
                AND bl.ThangNam = FORMAT(GETDATE(), 'MM/yyyy')
            GROUP BY dv.TenDonVi
        `;
        const resultDept = await DBHelper.queryWithContext(reqUser, queryDept);

        const queryGrowth = `
            WITH Last6Months AS (
                SELECT FORMAT(DATEADD(MONTH, -n, GETDATE()), 'MM/yyyy') AS monthKey,
                       MONTH(DATEADD(MONTH, -n, GETDATE())) AS m,
                       YEAR(DATEADD(MONTH, -n, GETDATE())) AS y
                FROM (VALUES (5), (4), (3), (2), (1), (0)) v(n)
            )
            SELECT 
                l.monthKey as month,
                (SELECT COUNT(MaNV) FROM HR.NhanVien WHERE NgayVaoBienChe <= EOMONTH(DATEFROMPARTS(l.y, l.m, 1)) AND TrangThai = 1) AS employees,
                (SELECT COUNT(MaNV) FROM HR.NhanVien WHERE MONTH(NgayVaoBienChe) = l.m AND YEAR(NgayVaoBienChe) = l.y AND TrangThai = 1) AS newHires
            FROM Last6Months l
            ORDER BY l.y, l.m
        `;
        const resultGrowth = await DBHelper.queryWithContext(reqUser, queryGrowth);

        return {
            salaryByDept: resultDept.recordset,
            employeeGrowth: resultGrowth.recordset
        };
    }

    static async getPersonalStats(reqUser) {
        // SECURITY: Use only reqUser.MaNV — set by authMiddleware from the DB,
        // never from the JWT payload or any client-supplied field.
        // reqUser.MaNV || reqUser.username was removed: `username` is NOT a safe
        // fallback because it could collide with another employee's MaNV.
        const query = `
            SELECT 
                (SELECT ISNULL(ThucLanh, 0) 
                 FROM Salary.BangLuong 
                 WHERE MaNV = @MaNV AND ThangNam = FORMAT(GETDATE(), 'MM/yyyy')) AS currentSalary,
                12 AS leaveDaysRemaining, 
                (SELECT ISNULL(COUNT(*), 0) FROM HR.KhenThuongKyLuat WHERE MaNV = @MaNV AND Loai = N'Khen thưởng') AS achievements
        `;
        const inputs = [{ name: 'MaNV', type: sql.VarChar, value: reqUser.MaNV }];
        const result = await DBHelper.queryWithContext(reqUser, query, inputs);
        return result.recordset[0] || { currentSalary: 0, leaveDaysRemaining: 12, achievements: 0 };
    }

    static async getPersonalSalaryHistory(reqUser) {
        const query = `
            SELECT TOP 6 
                ThangNam AS month,
                ThucLanh AS amount
            FROM Salary.BangLuong
            WHERE MaNV = @MaNV
            -- Sắp xếp chuỗi 'MM/YYYY' bằng cách cắt Năm ra xếp trước, Tháng xếp sau
            ORDER BY RIGHT(ThangNam, 4) DESC, LEFT(ThangNam, 2) DESC
        `;
        // SECURITY: Same as getPersonalStats — MaNV must come from the DB-authoritative req.user.
        const inputs = [{ name: 'MaNV', type: sql.VarChar, value: reqUser.MaNV }];
        const result = await DBHelper.queryWithContext(reqUser, query, inputs);

        // Reverse ở JS để mảng trả về là từ [Cũ nhất -> Mới nhất], thuận lợi cho Frontend vẽ Chart (cột x đi từ trái sang phải)
        return result.recordset.reverse();
    }
}

module.exports = DashboardModel;