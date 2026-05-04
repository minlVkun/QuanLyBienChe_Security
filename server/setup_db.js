const { sql, poolPromise } = require('./src/config/db');

const setup = async () => {
    try {
        const pool = await poolPromise;
        console.log('Connected to DB for Hardening Setup...');

        // 1. Tạo bảng AccessAudit (Read Audit)
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'AccessAudit' AND schema_id = SCHEMA_ID('System'))
            BEGIN
                CREATE TABLE [System].[AccessAudit] (
                    LogID INT IDENTITY(1,1) PRIMARY KEY,
                    UserID INT,
                    MaNV VARCHAR(20),
                    Action VARCHAR(50),      -- e.g. 'READ_SENSITIVE'
                    Resource VARCHAR(100),   -- e.g. 'Salary', 'CCCD'
                    TargetMaNV VARCHAR(20),  -- MaNV của người bị xem dữ liệu
                    ActionDate DATETIME DEFAULT GETUTCDATE(),
                    ClientIP VARCHAR(50),
                    AppName NVARCHAR(128)
                );
            END
        `);

        // 1.1 Tạo Schema HR nếu chưa có
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = 'HR')
            BEGIN
                EXEC('CREATE SCHEMA [HR]');
            END
        `);

        // 1.2 Tạo bảng PhuCapCoDinh (Phụ cấp cố định cho nhân viên)
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'PhuCapCoDinh' AND schema_id = SCHEMA_ID('HR'))
            BEGIN
                CREATE TABLE [HR].[PhuCapCoDinh] (
                    ID_PhuCap INT IDENTITY(1,1) PRIMARY KEY,
                    MaNV VARCHAR(20) NOT NULL,
                    TenPhuCap NVARCHAR(100),
                    SoTien DECIMAL(18,2) DEFAULT 0,
                    IsActive BIT DEFAULT 1,
                    NgayTao DATETIME DEFAULT GETUTCDATE()
                );
                PRINT 'Table [HR].[PhuCapCoDinh] created successfully.';
            END
        `);

        // 2. Tạo Indexes cho các bảng Log (Performance)
        // Chỉ tạo index nếu bảng tương ứng đã tồn tại để tránh crash script
        await pool.request().query(`
            IF EXISTS (SELECT * FROM sys.tables WHERE name = 'LoginLogs' AND schema_id = SCHEMA_ID('System'))
            BEGIN
                IF NOT EXISTS (SELECT name FROM sys.indexes WHERE name = 'IX_LoginLogs_Date')
                    CREATE INDEX IX_LoginLogs_Date ON [System].[LoginLogs] (LoginTime DESC);
            END

            IF EXISTS (SELECT * FROM sys.tables WHERE name = 'ConfigAuditLog' AND schema_id = SCHEMA_ID('System'))
            BEGIN
                IF NOT EXISTS (SELECT name FROM sys.indexes WHERE name = 'IX_ConfigAudit_Date')
                    CREATE INDEX IX_ConfigAudit_Date ON [System].[ConfigAuditLog] (UpdatedAt DESC);
            END

            IF EXISTS (SELECT * FROM sys.tables WHERE name = 'AuthorizationAudit' AND schema_id = SCHEMA_ID('System'))
            BEGIN
                IF NOT EXISTS (SELECT name FROM sys.indexes WHERE name = 'IX_AuthAudit_Date')
                    CREATE INDEX IX_AuthAudit_Date ON [System].[AuthorizationAudit] (ActionDate DESC);
            END

            IF EXISTS (SELECT * FROM sys.tables WHERE name = 'AccessAudit' AND schema_id = SCHEMA_ID('System'))
            BEGIN
                IF NOT EXISTS (SELECT name FROM sys.indexes WHERE name = 'IX_AccessAudit_Date')
                    CREATE INDEX IX_AccessAudit_Date ON [System].[AccessAudit] (ActionDate DESC);
            END
        `);

        // 3. Tạo Trigger Audit JSON cho bảng tài chính (HR.PhuCapCoDinh)
        // Lưu ý: Đảm bảo bảng [System].[DMLAuditLog] đã tồn tại (thường đã có từ module Employee)
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'DMLAuditLog' AND schema_id = SCHEMA_ID('System'))
            BEGIN
                CREATE TABLE [System].[DMLAuditLog] (
                    LogID INT IDENTITY(1,1) PRIMARY KEY,
                    TableName VARCHAR(100),
                    Action VARCHAR(10),
                    OldData NVARCHAR(MAX),
                    NewData NVARCHAR(MAX),
                    UpdatedBy VARCHAR(20),
                    UpdatedAt DATETIME DEFAULT GETUTCDATE()
                );
            END
        `);

        await pool.request().query(`
            IF OBJECT_ID('HR.PhuCapCoDinh', 'U') IS NOT NULL
            BEGIN
                EXEC('
                    CREATE OR ALTER TRIGGER [HR].[trg_Audit_PhuCap]
                    ON [HR].[PhuCapCoDinh]
                    AFTER INSERT, UPDATE, DELETE
                    AS
                    BEGIN
                        SET NOCOUNT ON;
                        DECLARE @OldData NVARCHAR(MAX) = (SELECT * FROM deleted FOR JSON AUTO);
                        DECLARE @NewData NVARCHAR(MAX) = (SELECT * FROM inserted FOR JSON AUTO);
                        DECLARE @Action VARCHAR(10) = CASE 
                            WHEN EXISTS(SELECT * FROM inserted) AND EXISTS(SELECT * FROM deleted) THEN ''UPDATE''
                            WHEN EXISTS(SELECT * FROM inserted) THEN ''INSERT''
                            ELSE ''DELETE'' END;

                        INSERT INTO [System].[DMLAuditLog] (TableName, Action, OldData, NewData, UpdatedBy, UpdatedAt)
                        VALUES (''HR.PhuCapCoDinh'', @Action, @OldData, @NewData, CAST(SESSION_CONTEXT(N''MaNV'') AS VARCHAR(20)), GETUTCDATE());
                    END
                ');
                PRINT 'Trigger HR.trg_Audit_PhuCap created/updated successfully.';
            END
            ELSE
            BEGIN
                PRINT 'WARNING: Table HR.PhuCapCoDinh does not exist. Trigger creation skipped.';
            END
        `);

        console.log('Hardening DB Setup completed successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Hardening Setup Error:', err);
        process.exit(1);
    }
};

setup();
