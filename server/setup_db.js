const { sql, poolPromise } = require('./src/config/db');

const setup = async () => {
    try {
        const pool = await poolPromise;
        console.log('Connected to DB for setup...');

        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'PhuCapCoDinh' AND schema_id = SCHEMA_ID('HR'))
            BEGIN
                CREATE TABLE HR.PhuCapCoDinh (
                    Id INT IDENTITY(1,1) PRIMARY KEY,
                    MaNV VARCHAR(20) NOT NULL,
                    TenPhuCap NVARCHAR(100) NOT NULL,
                    SoTien DECIMAL(18, 2) NOT NULL DEFAULT 0,
                    IsActive BIT DEFAULT 1,
                    CreatedAt DATETIME DEFAULT GETDATE(),
                    CONSTRAINT FK_PhuCapCoDinh_NhanVien FOREIGN KEY (MaNV) REFERENCES HR.NhanVien(MaNV),
                    CONSTRAINT CK_PhuCapCoDinh_SoTien CHECK (SoTien >= 0),
                    CONSTRAINT UQ_PhuCapCoDinh_Employee_Name UNIQUE (MaNV, TenPhuCap)
                );
            END

            IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ResetTokens' AND schema_id = SCHEMA_ID('System'))
            BEGIN
                CREATE TABLE System.ResetTokens (
                    Id INT IDENTITY(1,1) PRIMARY KEY,
                    UserID INT NOT NULL,
                    Token VARCHAR(255) NOT NULL,
                    ExpiryDate DATETIME NOT NULL,
                    IsUsed BIT DEFAULT 0,
                    CONSTRAINT FK_ResetTokens_User FOREIGN KEY (UserID) REFERENCES System.[User](UserID)
                );
            END
        `);
        console.log('Tables created successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Setup Error:', err);
        process.exit(1);
    }
};

setup();
