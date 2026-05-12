//src/models/salaryModel.js
const { sql } = require('../../config/db');
const DBHelper = require('../../utils/dbHelper');

class SalaryModel {
    static async countActiveEmployees(reqUser) {
        const query = `SELECT COUNT(*) AS ActiveCount FROM Salary.DienBienLuong WHERE IsCurrent = 1;`;
        const result = await DBHelper.queryWithContext(reqUser, query);
        return result.recordset[0].ActiveCount;
    }

    static async findScale(reqUser, maNgach, bacLuong) {
        const query = `
            SELECT HeSoLuong 
            FROM Salary.ChiTietNgachLuong 
            WHERE MaNgach = @MaNgach AND BacLuong = @BacLuong;
        `;
        const inputs = [
            { name: 'MaNgach', type: sql.VarChar, value: maNgach },
            { name: 'BacLuong', type: sql.Int, value: bacLuong }
        ];
        const result = await DBHelper.queryWithContext(reqUser, query, inputs);
        return result.recordset[0];
    }

    static async findScaleByMa(reqUser, maNgach) {
        const query = `SELECT MaNgach FROM Salary.NgachLuong WHERE MaNgach = @MaNgach;`;
        const result = await DBHelper.queryWithContext(reqUser, query, [{ name: 'MaNgach', type: sql.VarChar, value: maNgach }]);
        return result.recordset[0];
    }

    // 1. Lấy danh mục ngạch
    static async getScales(reqUser) {
        const query = `
            SELECT n.NhomNgach, n.TenNgach, c.MaNgach, c.BacLuong, c.HeSoLuong
            FROM Salary.ChiTietNgachLuong c
            JOIN Salary.NgachLuong n ON c.MaNgach = n.MaNgach
            ORDER BY n.NhomNgach, c.MaNgach, c.BacLuong;
        `;
        const result = await DBHelper.queryWithContext(reqUser, query);
        return result.recordset;
    }

    // 2. Lấy lịch sử lương
    static async getHistory(reqUser, maNV) {
        const query = `
            SELECT dbl.ID_Luong, dbl.MaNgach, nl.TenNgach, dbl.BacLuong, dbl.HeSoLuong, 
                   dbl.NgayHuong, dbl.NgayXetNangBacTiepTheo, dbl.IsCurrent, dbl.GhiChu
            FROM Salary.DienBienLuong dbl
            JOIN Salary.NgachLuong nl ON dbl.MaNgach = nl.MaNgach
            WHERE dbl.MaNV = @MaNV 
            ORDER BY dbl.NgayHuong DESC;
        `;
        const inputs = [{ name: 'MaNV', type: sql.VarChar, value: maNV }];
        const result = await DBHelper.queryWithContext(reqUser, query, inputs);
        return result.recordset;
    }

    /**
     * Nghiệp vụ tính lương hàng loạt (Tích hợp Chấm công thực tế)
     * Quy tắc: Lương = (Hệ số * Lương cơ sở / 26) * Ngày công thực tế + Phụ cấp - Khấu trừ bảo hiểm - Phạt đi trễ
     */
    static async generatePayroll(reqUser, thangNam, luongCoSo, phuCapChung, tyLeKhauTru, ngayCongChuan = 26.0, phatDiTre = 1000, transaction = null) {
        const query = `
            -- BƯỚC 1: Xóa dữ liệu cũ (Idempotency)
            DELETE FROM Salary.BangLuong WHERE ThangNam = @ThangNam;

            -- BƯỚC 2: Tính toán và Chốt lương
            INSERT INTO Salary.BangLuong (MaNV, ThangNam, HeSoLuong, LuongCoSo, PhuCap, TienKhauTruBH, ThucLanh, GhiChu, DaThanhToan)
            SELECT 
                dbl.MaNV, 
                @ThangNam, 
                dbl.HeSoLuong, 
                @LuongCoSo, 
                (CASE WHEN ISNULL(att.NgayCong, 0) > 0 THEN (@PhuCapChung + ISNULL(pc.TongPhuCap, 0)) ELSE 0 END) AS TongPhuCap, 
                (CASE WHEN ISNULL(att.NgayCong, 0) >= 14 THEN (dbl.HeSoLuong * @LuongCoSo * @TyLeKhauTru) ELSE 0 END) AS TienBH,
                -- CÔNG THỨC TÍNH LƯƠNG CHÍNH XÁC VÀ AN TOÀN:
                (CASE 
                    WHEN ROUND(
                            ((dbl.HeSoLuong * @LuongCoSo / @NgayCongChuan) * ISNULL(att.NgayCong, 0)) -- Lương theo ngày công
                            + (CASE WHEN ISNULL(att.NgayCong, 0) > 0 THEN (@PhuCapChung + ISNULL(pc.TongPhuCap, 0)) ELSE 0 END) -- Cộng phụ cấp
                            - (CASE WHEN ISNULL(att.NgayCong, 0) >= 14 THEN (dbl.HeSoLuong * @LuongCoSo * @TyLeKhauTru) ELSE 0 END) -- Trừ bảo hiểm
                            - (ISNULL(att.TongPhutTre, 0) * @PhatDiTre) -- Phạt đi trễ
                        , 0) < 0 THEN 0
                    ELSE ROUND(
                            ((dbl.HeSoLuong * @LuongCoSo / @NgayCongChuan) * ISNULL(att.NgayCong, 0)) 
                            + (CASE WHEN ISNULL(att.NgayCong, 0) > 0 THEN (@PhuCapChung + ISNULL(pc.TongPhuCap, 0)) ELSE 0 END) 
                            - (CASE WHEN ISNULL(att.NgayCong, 0) >= 14 THEN (dbl.HeSoLuong * @LuongCoSo * @TyLeKhauTru) ELSE 0 END) 
                            - (ISNULL(att.TongPhutTre, 0) * @PhatDiTre) 
                        , 0)
                END) AS ThucLanh,
                N'Chốt lương tự động (Ngày công: ' + CAST(ISNULL(att.NgayCong, 0) AS NVARCHAR) + N')',
                0 -- DaThanhToan mặc định là chưa thanh toán
            FROM Salary.DienBienLuong dbl
            -- Join lấy Phụ cấp cố định
            LEFT JOIN (
                SELECT MaNV, SUM(SoTien) as TongPhuCap
                FROM HR.PhuCapCoDinh
                WHERE IsActive = 1
                GROUP BY MaNV
            ) pc ON dbl.MaNV = pc.MaNV
            -- Join lấy Chấm công thực tế
            LEFT JOIN (
                SELECT 
                    MaNV, 
                    SUM(CASE WHEN TrangThai NOT IN (N'Quên checkout', N'Chưa hoàn tất') THEN 1 ELSE 0 END) as NgayCong, 
                    SUM(CASE WHEN TrangThai NOT IN (N'Quên checkout', N'Chưa hoàn tất') THEN (ISNULL(SoPhutDiTre, 0) + ISNULL(SoPhutVeSom, 0)) ELSE 0 END) as TongPhutTre
                FROM HR.ChamCong
                WHERE FORMAT(NgayChamCong, 'MM/yyyy') = @ThangNam
                GROUP BY MaNV
            ) att ON dbl.MaNV = att.MaNV
            WHERE dbl.IsCurrent = 1;
            
            SELECT @@ROWCOUNT AS RowsInserted;
        `;
        const inputs = [
            { name: 'ThangNam', type: sql.VarChar, value: thangNam },
            { name: 'LuongCoSo', type: sql.Decimal(18,2), value: luongCoSo },
            { name: 'PhuCapChung', type: sql.Decimal(18,2), value: phuCapChung },
            { name: 'TyLeKhauTru', type: sql.Decimal(5,3), value: tyLeKhauTru },
            { name: 'NgayCongChuan', type: sql.Decimal(5,2), value: ngayCongChuan },
            { name: 'PhatDiTre', type: sql.Decimal(18,2), value: phatDiTre }
        ];
        
        const result = await DBHelper.queryWithContext(reqUser, query, inputs, { timeout: 120000 }, transaction);
        return result.recordset ? result.recordset[0] : { RowsInserted: 0 };
    }

    // 3.1. Lưu kết quả lương đã tính toán từ Service (Dùng UPSERT)
    static async insertOrUpdateMonthlySalary(reqUser, data) {
        const query = `
            IF EXISTS (SELECT 1 FROM Salary.BangLuong WHERE MaNV = @MaNV AND ThangNam = @ThangNam)
            BEGIN
                UPDATE Salary.BangLuong
                SET HeSoLuong = @HeSoLuong, 
                    LuongCoSo = @LuongCoBan, 
                    PhuCap = @PhuCap, 
                    TienKhauTruBH = @KhauTru, 
                    ThucLanh = @TongLuong, 
                    NgayChot = GETDATE(), -- Gán ngày chốt khi cập nhật
                    GhiChu = N'Cập nhật kết quả từ Service'
                WHERE MaNV = @MaNV AND ThangNam = @ThangNam
            END
            ELSE
            BEGIN
                INSERT INTO Salary.BangLuong (MaNV, ThangNam, HeSoLuong, LuongCoSo, PhuCap, TienKhauTruBH, ThucLanh, NgayChot, GhiChu, DaThanhToan)
                VALUES (@MaNV, @ThangNam, @HeSoLuong, @LuongCoBan, @PhuCap, @KhauTru, @TongLuong, GETDATE(), N'Lưu kết quả tính toán từ Service', 0)
            END
        `;
        const inputs = [
            { name: 'MaNV', type: sql.VarChar, value: data.maNhanVien },
            { name: 'ThangNam', type: sql.VarChar, value: `${String(data.thang).padStart(2, '0')}/${data.nam}` },
            { name: 'HeSoLuong', type: sql.Decimal(5,2), value: data.heSoLuong },
            { name: 'LuongCoBan', type: sql.Decimal(18,2), value: data.luongCoBan },
            { name: 'PhuCap', type: sql.Decimal(18,2), value: data.phuCap },
            { name: 'KhauTru', type: sql.Decimal(18,2), value: data.khauTru },
            { name: 'TongLuong', type: sql.Decimal(18,2), value: data.tongLuong }
        ];
        
        await DBHelper.queryWithContext(reqUser, query, inputs);
    }

    // 3.2. Cập nhật quyết định nâng lương (Promote Salary)
    static async promoteSalary(reqUser, data) {
        const query = `
            SET XACT_ABORT ON;
            BEGIN TRAN;
                -- Cập nhật bản ghi cũ thành IsCurrent = 0
                UPDATE Salary.DienBienLuong 
                SET IsCurrent = 0 
                WHERE MaNV = @MaNV AND IsCurrent = 1;

                -- Thêm bản ghi diễn biến lương mới
                INSERT INTO Salary.DienBienLuong (MaNV, MaNgach, BacLuong, HeSoLuong, NgayHuong, GhiChu, IsCurrent)
                VALUES (@MaNV, @MaNgach, @BacLuong, @HeSoLuong, @NgayHuong, @GhiChu, 1);
            COMMIT TRAN;
        `;
        const inputs = [
            { name: 'MaNV', type: sql.VarChar, value: data.MaNV },
            { name: 'MaNgach', type: sql.VarChar, value: data.MaNgach },
            { name: 'BacLuong', type: sql.Int, value: data.BacLuong },
            { name: 'HeSoLuong', type: sql.Decimal(5,2), value: data.HeSoLuong },
            { name: 'NgayHuong', type: sql.Date, value: data.NgayHuong },
            { name: 'GhiChu', type: sql.NVarChar, value: data.GhiChu || '' }
        ];
        await DBHelper.queryWithContext(reqUser, query, inputs);
    }

    // 4. Lấy thông tin lương hiện tại của 1 nhân viên
    static async getCurrentSalaryByMaNV(reqUser, maNV) {
        const query = `
            SELECT TOP 1 dbl.*, nl.TenNgach, nl.NhomNgach
            FROM Salary.DienBienLuong dbl
            JOIN Salary.NgachLuong nl ON dbl.MaNgach = nl.MaNgach
            WHERE dbl.MaNV = @MaNV AND dbl.IsCurrent = 1;
        `;
        const inputs = [{ name: 'MaNV', type: sql.VarChar, value: maNV }];
        const result = await DBHelper.queryWithContext(reqUser, query, inputs);
        
        if (result.recordset.length === 0) {
            return {
                MaNV: maNV,
                HeSoLuong: 0,
                MaNgach: 'N/A',
                TenNgach: 'Chưa thiết lập',
                BacLuong: 0,
                IsCurrent: 1
            };
        }

        return result.recordset[0];
    }

    // 5. Lấy danh sách bảng lương tổng hợp (Có lọc theo tháng và đơn vị)
    static async getPayslipHistory(reqUser, maNV) {
        // Dùng vw_BangLuong (Secure View) — kế thừa masking tầng DB
        const query = `
            SELECT v.*
            FROM Salary.vw_BangLuong v
            WHERE v.MaNV = @MaNV
            ORDER BY RIGHT(v.ThangNam, 4) DESC, LEFT(v.ThangNam, 2) DESC;
        `;
        const inputs = [{ name: 'MaNV', type: sql.VarChar, value: maNV }];
        const result = await DBHelper.queryWithContext(reqUser, query, inputs);
        return result.recordset;
    }
    // 6. Lấy danh sách bảng lương tổng hợp (Kèm bộ lọc)
    // Dùng Salary.vw_BangLuong (Secure View) để tự động áp dụng masking theo role
    static async getPayrollList(reqUser, filters) {
        let query = `
            SELECT 
                v.ID_BangLuong,
                v.MaNV,
                v.HoTen,
                v.TenDonVi,
                v.ThangNam,
                v.HeSoLuong,     -- NULL nếu DeptHead xem người khác
                v.LuongCoSo,     -- NULL nếu DeptHead xem người khác
                v.PhuCap,        -- NULL nếu DeptHead xem người khác
                v.TienKhauTruBH, -- NULL nếu DeptHead xem người khác
                v.ThucLanh,      -- DeptHead LUÔN thấy (quản lý ngân sách)
                v.NgayChot,
                v.DaThanhToan,
                v.GhiChu
            FROM Salary.vw_BangLuong v
            WHERE 1=1
        `;

        const inputs = [];

        // Lọc theo Tháng/Năm nếu có
        if (filters.thangNam) {
            query += ` AND v.ThangNam = @ThangNam`;
            inputs.push({ name: 'ThangNam', type: sql.VarChar, value: filters.thangNam });
        }

        // Lọc theo Mã đơn vị nếu có
        if (filters.maDonVi) {
            query += ` AND v.MaDonVi = @MaDonVi`;
            inputs.push({ name: 'MaDonVi', type: sql.VarChar, value: filters.maDonVi });
        }

        // Sắp xếp mặc định theo Đơn vị rồi đến Tên nhân viên
        query += ` ORDER BY v.TenDonVi ASC, v.HoTen ASC;`;

        const result = await DBHelper.queryWithContext(reqUser, query, inputs);
        return result.recordset;
    }

    // 7. Khởi tạo bản ghi lương mặc định (Dùng trong Transaction khi tạo nhân viên)
    static async initSalaryRecord(transaction, reqUser, maNV, thangNam) {
        const query = `
            INSERT INTO Salary.BangLuong 
            (MaNV, ThangNam, HeSoLuong, LuongCoSo, PhuCap, TienKhauTruBH, ThucLanh, GhiChu)
            VALUES 
            (@MaNV, @ThangNam, 0, 0, 0, 0, 0, N'Chưa thiết lập');
        `;
        const inputs = [
            { name: 'MaNV', type: sql.VarChar, value: maNV },
            { name: 'ThangNam', type: sql.VarChar, value: thangNam }
        ];
        
        await DBHelper.queryWithContext(reqUser, query, inputs, null, transaction);
    }
    // 8. Cập nhật bản ghi lương (Update)
    static async updatePayroll(reqUser, id, data) {
        const query = `
            UPDATE Salary.BangLuong
            SET PhuCap          = @PhuCap,
                TienKhauTruBH   = @KhauTru,
                GhiChu          = @GhiChu,
                DaThanhToan     = @DaThanhToan,
                -- Công thức: Giữ nguyên phần lương theo ngày công (= ThucLanh cũ + PhuCap cũ + KhauTru cũ)
                -- sau đó cộng/trừ với giá trị PhụCấp/KhấuTrừ mới
                ThucLanh = CASE
                    WHEN (ThucLanh + TienKhauTruBH - PhuCap + @PhuCap - @KhauTru) < 0
                    THEN 0
                    ELSE (ThucLanh + TienKhauTruBH - PhuCap + @PhuCap - @KhauTru)
                END
            WHERE ID_BangLuong = @ID
        `;
        const inputs = [
            { name: 'ID',      type: sql.Int,            value: id },
            { name: 'PhuCap',      type: sql.Decimal(18,2),  value: data.phuCap  || 0 },
            { name: 'KhauTru',     type: sql.Decimal(18,2),  value: data.khauTru || 0 },
            { name: 'GhiChu',      type: sql.NVarChar,       value: data.ghiChu  || '' },
            { name: 'DaThanhToan', type: sql.Int,            value: data.daThanhToan ? 1 : 0 }
        ];
        await DBHelper.queryWithContext(reqUser, query, inputs);
    }

    // 9. Xóa bản ghi lương (Delete)
    static async deletePayroll(reqUser, id) {
        const query = `DELETE FROM Salary.BangLuong WHERE ID_BangLuong = @ID`;
        const inputs = [{ name: 'ID', type: sql.Int, value: id }];
        await DBHelper.queryWithContext(reqUser, query, inputs);
    }

    // --- QUẢN LÝ DANH MỤC NGẠCH LƯƠNG ---
    
    static async createScale(reqUser, data) {
        const query = `
            INSERT INTO Salary.NgachLuong (MaNgach, TenNgach, NhomNgach)
            VALUES (@MaNgach, @TenNgach, @NhomNgach)
        `;
        const inputs = [
            { name: 'MaNgach', type: sql.VarChar, value: data.MaNgach },
            { name: 'TenNgach', type: sql.NVarChar, value: data.TenNgach },
            { name: 'NhomNgach', type: sql.VarChar, value: data.NhomNgach }
        ];
        await DBHelper.queryWithContext(reqUser, query, inputs);
    }

    static async updateScale(reqUser, maNgach, data) {
        const query = `
            UPDATE Salary.NgachLuong
            SET TenNgach = @TenNgach, NhomNgach = @NhomNgach
            WHERE MaNgach = @MaNgach
        `;
        const inputs = [
            { name: 'MaNgach', type: sql.VarChar, value: maNgach },
            { name: 'TenNgach', type: sql.NVarChar, value: data.TenNgach },
            { name: 'NhomNgach', type: sql.VarChar, value: data.NhomNgach }
        ];
        await DBHelper.queryWithContext(reqUser, query, inputs);
    }

    static async deleteScale(reqUser, maNgach) {
        // Kiểm tra xem có diễn biến lương nào dùng ngạch này không (Kiểm tra chặt chẽ)
        const checkQuery = `SELECT COUNT(*) as Count FROM Salary.DienBienLuong WHERE MaNgach = @MaNgach`;
        const check = await DBHelper.queryWithContext(reqUser, checkQuery, [{ name: 'MaNgach', type: sql.VarChar, value: maNgach }]);
        
        if (check.recordset[0].Count > 0) {
            const err = new Error("Không thể xóa. Ngạch lương này đang được áp dụng cho hồ sơ nhân sự!");
            err.statusCode = 422; throw err;
        }

        const query = `
            BEGIN TRY
                BEGIN TRAN;
                    DELETE FROM Salary.ChiTietNgachLuong WHERE MaNgach = @MaNgach;
                    DELETE FROM Salary.NgachLuong WHERE MaNgach = @MaNgach;
                COMMIT TRAN;
            END TRY
            BEGIN CATCH
                IF @@TRANCOUNT > 0 ROLLBACK TRAN;
                THROW;
            END CATCH;
        `;
        await DBHelper.queryWithContext(reqUser, query, [{ name: 'MaNgach', type: sql.VarChar, value: maNgach }]);
    }

    // --- QUẢN LÝ BẬC LƯƠNG CHI TIẾT ---

    static async checkStepExists(reqUser, maNgach, bacLuong) {
        const query = `SELECT 1 FROM Salary.ChiTietNgachLuong WHERE MaNgach = @MaNgach AND BacLuong = @BacLuong`;
        const res = await DBHelper.queryWithContext(reqUser, query, [
            { name: 'MaNgach', type: sql.VarChar, value: maNgach },
            { name: 'BacLuong', type: sql.Int, value: bacLuong }
        ]);
        return res.recordset.length > 0;
    }

    static async addStep(reqUser, data) {
        const query = `
            INSERT INTO Salary.ChiTietNgachLuong (MaNgach, BacLuong, HeSoLuong)
            VALUES (@MaNgach, @BacLuong, @HeSoLuong)
        `;
        const inputs = [
            { name: 'MaNgach', type: sql.VarChar, value: data.MaNgach },
            { name: 'BacLuong', type: sql.Int, value: data.BacLuong },
            { name: 'HeSoLuong', type: sql.Decimal(5,2), value: data.HeSoLuong }
        ];
        await DBHelper.queryWithContext(reqUser, query, inputs);
    }

    static async deleteStep(reqUser, maNgach, bacLuong) {
        const query = `DELETE FROM Salary.ChiTietNgachLuong WHERE MaNgach = @MaNgach AND BacLuong = @BacLuong`;
        const inputs = [
            { name: 'MaNgach', type: sql.VarChar, value: maNgach },
            { name: 'BacLuong', type: sql.Int, value: bacLuong }
        ];
        await DBHelper.queryWithContext(reqUser, query, inputs);
    }

    static async getPayrollById(reqUser, id) {
        const query = `SELECT * FROM Salary.BangLuong WHERE ID_BangLuong = @ID`;
        const result = await DBHelper.queryWithContext(reqUser, query, [{ name: 'ID', type: sql.Int, value: id }]);
        return result.recordset[0] || null;
    }

    static async getScaleByMa(reqUser, maNgach) {
        const query = `SELECT * FROM Salary.NgachLuong WHERE MaNgach = @MaNgach`;
        const result = await DBHelper.queryWithContext(reqUser, query, [{ name: 'MaNgach', type: sql.VarChar, value: maNgach }]);
        return result.recordset[0] || null;
    }

    static async getStep(reqUser, maNgach, bacLuong) {
        const query = `SELECT * FROM Salary.ChiTietNgachLuong WHERE MaNgach = @MaNgach AND BacLuong = @BacLuong`;
        const result = await DBHelper.queryWithContext(reqUser, query, [
            { name: 'MaNgach', type: sql.VarChar, value: maNgach },
            { name: 'BacLuong', type: sql.Int, value: bacLuong }
        ]);
        return result.recordset[0] || null;
    }
}
module.exports = SalaryModel;