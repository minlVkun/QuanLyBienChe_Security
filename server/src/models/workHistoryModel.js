const { sql} = require('../config/db');
const DBHelper = require('../utils/dbHelper');

class WorkHistory {
    static async getByMaNV(reqUser, maNV) {

        const query = `
            SET XACT_ABORT ON;

            BEGIN TRY

                -- Check tồn tại
                IF NOT EXISTS (
                    SELECT 1 FROM HR.NhanVien WHERE MaNV = @MaNV
                )
                    THROW 50001, N'Nhân viên không tồn tại', 1;

                SELECT 
                    ct.*, 
                    dv.TenDonVi, 
                    cv.TenChucVu 
                FROM [HR].[QuaTrinhCongTac] ct
                LEFT JOIN [HR].[DonVi] dv ON ct.MaDonVi = dv.MaDonVi
                LEFT JOIN [HR].[ChucVu] cv ON ct.MaChucVu = cv.MaChucVu
                WHERE ct.MaNV = @MaNV
                ORDER BY ct.TuNgay DESC;

            END TRY
            BEGIN CATCH
                THROW;
            END CATCH
        `;

        const inputs = [{ name: 'MaNV', type: sql.VarChar, value: maNV }];
        const result = await DBHelper.queryWithContext(reqUser, query, inputs);
        return result.recordset;
    }   

    static async create(reqUser, data) {

        const query = `
            SET XACT_ABORT ON;

            BEGIN TRY
                BEGIN TRAN;

                -- ❗ Check nhân viên tồn tại
                IF NOT EXISTS (
                    SELECT 1 FROM HR.NhanVien WHERE MaNV = @MaNV
                )
                    THROW 50001, N'Nhân viên không tồn tại', 1;

                -- ❗ Check ngày hợp lệ
                IF @DenNgay IS NOT NULL AND @DenNgay < @TuNgay
                    THROW 50002, N'Đến ngày phải lớn hơn hoặc bằng Từ ngày', 1;

                INSERT INTO [HR].[QuaTrinhCongTac] 
                (MaNV, TuNgay, DenNgay, MaDonVi, MaChucVu, NoiDung)
                VALUES 
                (@MaNV, @TuNgay, @DenNgay, @MaDonVi, @MaChucVu, @NoiDung);

                COMMIT TRAN;

                SELECT SCOPE_IDENTITY() AS InsertedId;

            END TRY
            BEGIN CATCH
                IF @@TRANCOUNT > 0
                    ROLLBACK TRAN;

                THROW;
            END CATCH
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

}

module.exports = WorkHistory;