const { sql } = require('../config/db');
const DBHelper = require('../utils/dbHelper');

class SalaryModel {
    /**
     * Lấy danh sách lương và mức đóng bảo hiểm mới nhất của nhân viên
     */
    static async getCurrentSalaries(reqUser) {
        const query = `
            SELECT 
                nv.MaNV, nv.HoTen, nv.MaDonVi,
                dv.TenDonVi,  
                dbl.MaNgach, dbl.BacLuong, dbl.HeSoLuong, dbl.NgayHuong,
                bh.MucLuongDong, bh.TuThangYear -- Thêm cột này nếu bạn muốn hiển thị tháng đóng gần nhất
            FROM HR.NhanVien nv
            LEFT JOIN HR.DonVi dv ON nv.MaDonVi = dv.MaDonVi
            LEFT JOIN Salary.DienBienLuong dbl 
                ON nv.MaNV = dbl.MaNV AND dbl.IsCurrent = 1
            OUTER APPLY (
                SELECT TOP 1 MucLuongDong, TuThangYear
                FROM Salary.LichSuDongBaoHiem
                WHERE MaNV = nv.MaNV
                -- SỬA TẠI ĐÂY: Sử dụng TuThangYear để lấy bản ghi mới nhất
                ORDER BY TuThangYear DESC 
            ) bh
        `;
        try {
            const result = await DBHelper.queryWithContext(reqUser, query, []);
            return result.recordset;
        } catch (error) {
            console.error(`[Model Error - getCurrentSalaries]: ${error.message}`);
            throw error;
        }
    }

    /**
     * Lấy từ điển Thang bảng lương (Dùng cho Dropdown)
     */
    static async getSalaryScales(reqUser) {
        const query = `
            SELECT 
                n.TenNgach, n.NhomNgach,
                c.MaNgach, c.BacLuong, c.HeSoLuong
            FROM Salary.ChiTietNgachLuong c
            INNER JOIN Salary.NgachLuong n ON c.MaNgach = n.MaNgach
            ORDER BY n.NhomNgach, c.MaNgach, c.BacLuong
        `;
        const result = await DBHelper.queryWithContext(reqUser, query, []);
        return result.recordset;
    }

    /**
     * Giao dịch thăng bậc lương (Bảo mật: Tự động tra cứu hệ số chuẩn)
     */
    static async promoteSalary(reqUser, data) {
        const query = `
            SET XACT_ABORT ON;
            BEGIN TRY
                BEGIN TRAN;

                -- 1. Tự động tra cứu hệ số lương chuẩn từ danh mục (Chống Hacker sửa Payload)
                DECLARE @HeSoLuongChuan DECIMAL(10,2);
                SELECT @HeSoLuongChuan = HeSoLuong 
                FROM Salary.ChiTietNgachLuong 
                WHERE MaNgach = @MaNgach AND BacLuong = @BacLuong;

                IF @HeSoLuongChuan IS NULL 
                    THROW 50005, N'Ngạch lương hoặc Bậc lương không hợp lệ trong danh mục hệ thống.', 1;

                -- 2. Cập nhật diễn biến lương cũ thành IsCurrent = 0
                UPDATE Salary.DienBienLuong 
                SET IsCurrent = 0 
                WHERE MaNV = @MaNV AND IsCurrent = 1;

                -- 3. Thêm mới diễn biến lương (Hệ thống tự tính Ngày xét = Ngày hưởng + 3 năm)
                INSERT INTO Salary.DienBienLuong 
                    (MaNV, MaNgach, BacLuong, HeSoLuong, NgayHuong, NgayXetNangBacTiepTheo, GhiChu, IsCurrent)
                VALUES 
                    (@MaNV, @MaNgach, @BacLuong, @HeSoLuongChuan, @NgayHuong, DATEADD(YEAR, 3, @NgayHuong), @GhiChu, 1);

                COMMIT TRAN;
                SELECT 1 AS Success;
            END TRY
            BEGIN CATCH
                IF @@TRANCOUNT > 0 ROLLBACK TRAN;
                THROW;
            END CATCH;
        `;

        const inputs = [
            { name: 'MaNV', type: sql.VarChar, value: data.MaNV },
            { name: 'MaNgach', type: sql.VarChar, value: data.MaNgach },
            { name: 'BacLuong', type: sql.Int, value: data.BacLuong },
            { name: 'NgayHuong', type: sql.Date, value: data.NgayHuong },
            { name: 'GhiChu', type: sql.NVarChar, value: data.GhiChu || null }
        ];

        return await DBHelper.queryWithContext(reqUser, query, inputs);
    }
}

module.exports = SalaryModel;