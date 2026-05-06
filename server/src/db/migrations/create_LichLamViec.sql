-- =============================================================
-- Script tạo bảng HR.LichLamViec (Lịch làm việc / Phân ca)
-- Chạy một lần trong SQL Server Management Studio
-- =============================================================

IF NOT EXISTS (
    SELECT 1 FROM sys.objects
    WHERE object_id = OBJECT_ID(N'[HR].[LichLamViec]') AND type = N'U'
)
BEGIN
    CREATE TABLE [HR].[LichLamViec] (
        LichID          INT             IDENTITY(1,1)   NOT NULL,
        MaNV            VARCHAR(20)     NOT NULL,
        MaCaLamViec     VARCHAR(10)     NOT NULL,
        NgayLam         DATE            NOT NULL,
        GhiChu          NVARCHAR(500)   NULL,
        NgayTao         DATETIME2       NOT NULL DEFAULT GETDATE(),

        CONSTRAINT PK_LichLamViec PRIMARY KEY (LichID),

        -- Ràng buộc: 1 NV chỉ có 1 ca trong 1 ngày
        CONSTRAINT UQ_LichLamViec_NV_Ngay UNIQUE (MaNV, NgayLam),

        CONSTRAINT FK_LichLamViec_NhanVien
            FOREIGN KEY (MaNV) REFERENCES [HR].[NhanVien](MaNV)
            ON DELETE CASCADE,

        CONSTRAINT FK_LichLamViec_CaLamViec
            FOREIGN KEY (MaCaLamViec) REFERENCES [HR].[CaLamViec](MaCaLamViec)
            ON DELETE CASCADE
    );

    -- Index tối ưu truy vấn theo khoảng ngày (dùng khi xem lịch tuần)
    CREATE INDEX IX_LichLamViec_NgayLam
        ON [HR].[LichLamViec] (NgayLam ASC)
        INCLUDE (MaNV, MaCaLamViec);

    -- Index tối ưu truy vấn theo NV
    CREATE INDEX IX_LichLamViec_MaNV
        ON [HR].[LichLamViec] (MaNV ASC, NgayLam ASC);

    PRINT N'✅ Bảng HR.LichLamViec đã được tạo thành công.';
END
ELSE
BEGIN
    PRINT N'ℹ️  Bảng HR.LichLamViec đã tồn tại, bỏ qua.';
END
