USE [master]
GO
/****** Object:  Database [QuanLyBienChe_Testing_V2]    Script Date: 05/05/2026 03:50:54 PM ******/
CREATE DATABASE [QuanLyBienChe_Testing_V2]
 CONTAINMENT = NONE
 ON  PRIMARY 
( NAME = N'QuanLyBienChe', FILENAME = N'C:\Program Files\Microsoft SQL Server\MSSQL17.SQLEXPRESS\MSSQL\DATA\QuanLyBienChe_Testing_V2.mdf' , SIZE = 73728KB , MAXSIZE = UNLIMITED, FILEGROWTH = 65536KB )
 LOG ON 
( NAME = N'QuanLyBienChe_log', FILENAME = N'C:\Program Files\Microsoft SQL Server\MSSQL17.SQLEXPRESS\MSSQL\DATA\QuanLyBienChe_Testing_V2_log.ldf' , SIZE = 8192KB , MAXSIZE = 2048GB , FILEGROWTH = 65536KB )
 WITH CATALOG_COLLATION = DATABASE_DEFAULT, LEDGER = OFF
GO
ALTER DATABASE [QuanLyBienChe_Testing_V2] SET COMPATIBILITY_LEVEL = 160
GO
IF (1 = FULLTEXTSERVICEPROPERTY('IsFullTextInstalled'))
begin
EXEC [QuanLyBienChe_Testing_V2].[dbo].[sp_fulltext_database] @action = 'enable'
end
GO
ALTER DATABASE [QuanLyBienChe_Testing_V2] SET ANSI_NULL_DEFAULT OFF 
GO
ALTER DATABASE [QuanLyBienChe_Testing_V2] SET ANSI_NULLS OFF 
GO
ALTER DATABASE [QuanLyBienChe_Testing_V2] SET ANSI_PADDING OFF 
GO
ALTER DATABASE [QuanLyBienChe_Testing_V2] SET ANSI_WARNINGS OFF 
GO
ALTER DATABASE [QuanLyBienChe_Testing_V2] SET ARITHABORT OFF 
GO
ALTER DATABASE [QuanLyBienChe_Testing_V2] SET AUTO_CLOSE OFF 
GO
ALTER DATABASE [QuanLyBienChe_Testing_V2] SET AUTO_SHRINK OFF 
GO
ALTER DATABASE [QuanLyBienChe_Testing_V2] SET AUTO_UPDATE_STATISTICS ON 
GO
ALTER DATABASE [QuanLyBienChe_Testing_V2] SET CURSOR_CLOSE_ON_COMMIT OFF 
GO
ALTER DATABASE [QuanLyBienChe_Testing_V2] SET CURSOR_DEFAULT  GLOBAL 
GO
ALTER DATABASE [QuanLyBienChe_Testing_V2] SET CONCAT_NULL_YIELDS_NULL OFF 
GO
ALTER DATABASE [QuanLyBienChe_Testing_V2] SET NUMERIC_ROUNDABORT OFF 
GO
ALTER DATABASE [QuanLyBienChe_Testing_V2] SET QUOTED_IDENTIFIER OFF 
GO
ALTER DATABASE [QuanLyBienChe_Testing_V2] SET RECURSIVE_TRIGGERS OFF 
GO
ALTER DATABASE [QuanLyBienChe_Testing_V2] SET  DISABLE_BROKER 
GO
ALTER DATABASE [QuanLyBienChe_Testing_V2] SET AUTO_UPDATE_STATISTICS_ASYNC OFF 
GO
ALTER DATABASE [QuanLyBienChe_Testing_V2] SET DATE_CORRELATION_OPTIMIZATION OFF 
GO
ALTER DATABASE [QuanLyBienChe_Testing_V2] SET TRUSTWORTHY OFF 
GO
ALTER DATABASE [QuanLyBienChe_Testing_V2] SET ALLOW_SNAPSHOT_ISOLATION OFF 
GO
ALTER DATABASE [QuanLyBienChe_Testing_V2] SET PARAMETERIZATION SIMPLE 
GO
ALTER DATABASE [QuanLyBienChe_Testing_V2] SET READ_COMMITTED_SNAPSHOT OFF 
GO
ALTER DATABASE [QuanLyBienChe_Testing_V2] SET HONOR_BROKER_PRIORITY OFF 
GO
ALTER DATABASE [QuanLyBienChe_Testing_V2] SET RECOVERY SIMPLE 
GO
ALTER DATABASE [QuanLyBienChe_Testing_V2] SET  MULTI_USER 
GO
ALTER DATABASE [QuanLyBienChe_Testing_V2] SET PAGE_VERIFY CHECKSUM  
GO
ALTER DATABASE [QuanLyBienChe_Testing_V2] SET DB_CHAINING OFF 
GO
ALTER DATABASE [QuanLyBienChe_Testing_V2] SET FILESTREAM( NON_TRANSACTED_ACCESS = OFF ) 
GO
ALTER DATABASE [QuanLyBienChe_Testing_V2] SET TARGET_RECOVERY_TIME = 60 SECONDS 
GO
ALTER DATABASE [QuanLyBienChe_Testing_V2] SET DELAYED_DURABILITY = DISABLED 
GO
ALTER DATABASE [QuanLyBienChe_Testing_V2] SET OPTIMIZED_LOCKING = OFF 
GO
ALTER DATABASE [QuanLyBienChe_Testing_V2] SET ACCELERATED_DATABASE_RECOVERY = OFF  
GO
ALTER DATABASE [QuanLyBienChe_Testing_V2] SET QUERY_STORE = ON
GO
ALTER DATABASE [QuanLyBienChe_Testing_V2] SET QUERY_STORE (OPERATION_MODE = READ_WRITE, CLEANUP_POLICY = (STALE_QUERY_THRESHOLD_DAYS = 30), DATA_FLUSH_INTERVAL_SECONDS = 900, INTERVAL_LENGTH_MINUTES = 60, MAX_STORAGE_SIZE_MB = 1000, QUERY_CAPTURE_MODE = AUTO, SIZE_BASED_CLEANUP_MODE = AUTO, MAX_PLANS_PER_QUERY = 200, WAIT_STATS_CAPTURE_MODE = ON)
GO
USE [QuanLyBienChe_Testing_V2]
GO
/****** Object:  User [HR_Payroll]    Script Date: 05/05/2026 03:50:54 PM ******/
CREATE USER [HR_Payroll] WITHOUT LOGIN WITH DEFAULT_SCHEMA=[dbo]
GO
/****** Object:  User [HR_Human]    Script Date: 05/05/2026 03:50:54 PM ******/
CREATE USER [HR_Human] WITHOUT LOGIN WITH DEFAULT_SCHEMA=[dbo]
GO
/****** Object:  User [Employee]    Script Date: 05/05/2026 03:50:54 PM ******/
CREATE USER [Employee] WITHOUT LOGIN WITH DEFAULT_SCHEMA=[dbo]
GO
/****** Object:  User [DeptHead]    Script Date: 05/05/2026 03:50:54 PM ******/
CREATE USER [DeptHead] WITHOUT LOGIN WITH DEFAULT_SCHEMA=[dbo]
GO
/****** Object:  User [AppBackendUser]    Script Date: 05/05/2026 03:50:54 PM ******/
CREATE USER [AppBackendUser] FOR LOGIN [AppBackendUser] WITH DEFAULT_SCHEMA=[dbo]
GO
/****** Object:  User [Admin]    Script Date: 05/05/2026 03:50:54 PM ******/
CREATE USER [Admin] WITHOUT LOGIN WITH DEFAULT_SCHEMA=[dbo]
GO
/****** Object:  DatabaseRole [db_HR_Payroll]    Script Date: 05/05/2026 03:50:54 PM ******/
CREATE ROLE [db_HR_Payroll]
GO
/****** Object:  DatabaseRole [db_HR_Human]    Script Date: 05/05/2026 03:50:54 PM ******/
CREATE ROLE [db_HR_Human]
GO
/****** Object:  DatabaseRole [db_Employee]    Script Date: 05/05/2026 03:50:54 PM ******/
CREATE ROLE [db_Employee]
GO
/****** Object:  DatabaseRole [db_DeptHead]    Script Date: 05/05/2026 03:50:54 PM ******/
CREATE ROLE [db_DeptHead]
GO
/****** Object:  DatabaseRole [db_Admin]    Script Date: 05/05/2026 03:50:54 PM ******/
CREATE ROLE [db_Admin]
GO
ALTER ROLE [db_HR_Payroll] ADD MEMBER [HR_Payroll]
GO
ALTER ROLE [db_HR_Human] ADD MEMBER [HR_Human]
GO
ALTER ROLE [db_Employee] ADD MEMBER [Employee]
GO
ALTER ROLE [db_DeptHead] ADD MEMBER [DeptHead]
GO
ALTER ROLE [db_Admin] ADD MEMBER [Admin]
GO
/****** Object:  Schema [HR]    Script Date: 05/05/2026 03:50:54 PM ******/
CREATE SCHEMA [HR]
GO
/****** Object:  Schema [Salary]    Script Date: 05/05/2026 03:50:54 PM ******/
CREATE SCHEMA [Salary]
GO
/****** Object:  Schema [Security]    Script Date: 05/05/2026 03:50:54 PM ******/
CREATE SCHEMA [Security]
GO
/****** Object:  Schema [System]    Script Date: 05/05/2026 03:50:54 PM ******/
CREATE SCHEMA [System]
GO
/****** Object:  UserDefinedFunction [Security].[fn_MaskData]    Script Date: 05/05/2026 03:50:54 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE   FUNCTION [Security].[fn_MaskData]
(
    @Value NVARCHAR(MAX),
    @Type NVARCHAR(20), -- 'EMAIL', 'PHONE', 'CCCD', 'SECRET'
    @IsFull BIT -- 1: Hiện hết, 0: Che mờ
)
RETURNS NVARCHAR(MAX)
AS
BEGIN
    IF @Value IS NULL RETURN NULL;
    IF @IsFull = 1 RETURN @Value;

    IF @Type = 'EMAIL' 
        RETURN LEFT(@Value, 2) + 'xxx@' + SUBSTRING(@Value, CHARINDEX('@', @Value) + 1, LEN(@Value));
    
    IF @Type = 'PHONE'
        RETURN LEFT(@Value, 3) + 'xxxx' + RIGHT(@Value, 3);

    IF @Type = 'CCCD'
        RETURN 'xxxxxx' + RIGHT(@Value, 4);

    RETURN '*******';
END
GO
/****** Object:  ColumnMasterKey [CMK_HRM_Auto]    Script Date: 05/05/2026 03:50:54 PM ******/
CREATE COLUMN MASTER KEY [CMK_HRM_Auto]
WITH
(
	KEY_STORE_PROVIDER_NAME = N'MSSQL_CERTIFICATE_STORE',
	KEY_PATH = N'LocalMachine/My/1543F019200AA3DF1763B80940346357AA9DBD30'
)
GO
/****** Object:  ColumnEncryptionKey [CEK_HRM_Auto]    Script Date: 05/05/2026 03:50:54 PM ******/
CREATE COLUMN ENCRYPTION KEY [CEK_HRM_Auto]
WITH VALUES
(
	COLUMN_MASTER_KEY = [CMK_HRM_Auto],
	ALGORITHM = 'RSA_OAEP',
	ENCRYPTED_VALUE = 0x01700000016C006F00630061006C006D0061006300680069006E0065002F006D0079002F003100350034003300660030003100390032003000300061006100330064006600310037003600330062003800300039003400300033003400360033003500370061006100390064006200640033003000D21F1EE04F70276C791A0F2C8F12DCC7ABF519418CE852F5EE63C11A1E1337CD211EBC70893A2FACE0990D920FFC4D71BDA09EE1824B3D2348C8BCD5907210E643932640FFF9E0D43EBADCA134FC462BD613F9E8B220272BFCE0FE63E5CF443F4774DD95ADA0B2D957BBCB08E095CE7DBF8D8F44A3CE5FF7626170F82E7D7A9B8B9545F25FA0AAE48130DB664013903317BC5004B31C022D02A3DD133AABA8906FE9B73839C5872749D46B6A94470845F3264CAEA052113725B5591E6DBBD45652ACDC6C63558F1167D104DECFA434CE725194248C1588728A181A414A231B2402961BA9121E576DFAB945C44C6DCA662B6F117C645439F8CE1C642AD5BF737A24E94DCDE12C5B601901AEEF99DA6DB483C15AEFC290B0AE2B24DD73180712CAA9AC1E3D1C52C1829BC7BD5FBA99B07F5D69BC03B90C6314CFB782BA81ABA48FC76EA18D069F89DA1FBF365CFD4F7D6CC8FAA87E6DED87761640431D3BBEA726462577AA431F60EF1A61677C342B1761481411382F8A357C14DC26C1859713A01EB293CB1C95CF46B7EF462057706C2EE282E7F696241E7ABDDFEFF7C9F2A1C04431B295A38889A752A7F8961B628551F33F75291D954BAB18C7B5089B3DBB7A628127E365F268E21B0EBA5E897126B0DB3BE5CD5B73C2A4B460B86C8370CA330BFB4D859709F911DD5C8B0CE124C89B68964F334582ACF6A19183563AC23616
)
GO
/****** Object:  Table [HR].[NhanVien_Internal]    Script Date: 05/05/2026 03:50:54 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [HR].[NhanVien_Internal](
	[MaNV] [varchar](20) NOT NULL,
	[HoTen] [nvarchar](100) NOT NULL,
	[NgaySinh] [date] MASKED WITH (FUNCTION = 'default()') NULL,
	[GioiTinh] [bit] NULL,
	[SoCCCD] [varchar](20) COLLATE Latin1_General_BIN2 ENCRYPTED WITH (COLUMN_ENCRYPTION_KEY = [CEK_HRM_Auto], ENCRYPTION_TYPE = Deterministic, ALGORITHM = 'AEAD_AES_256_CBC_HMAC_SHA_256') NULL,
	[Email] [varchar](100) MASKED WITH (FUNCTION = 'email()') NULL,
	[SoDienThoai] [varchar](15) MASKED WITH (FUNCTION = 'partial(0, "***", 3)') NULL,
	[QueQuan] [nvarchar](255) MASKED WITH (FUNCTION = 'default()') NULL,
	[MaDonVi] [varchar](20) NULL,
	[NgayVaoBienChe] [date] NULL,
	[TrangThai] [int] NULL,
	[UserID] [int] NULL,
	[MaCaLamViec] [varchar](10) NULL,
PRIMARY KEY CLUSTERED 
(
	[MaNV] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT [UX_NhanVien_CCCD] UNIQUE NONCLUSTERED 
(
	[SoCCCD] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  UserDefinedFunction [Security].[fn_rls_BangLuong]    Script Date: 05/05/2026 03:50:54 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER OFF
GO

CREATE   FUNCTION [Security].[fn_rls_BangLuong](
    @MaNV_Row VARCHAR(20),
    @NgayChot DATETIME
)
RETURNS TABLE
WITH SCHEMABINDING
AS
RETURN (
    SELECT 1 AS fn_securitypredicate
    WHERE 
        CAST(SESSION_CONTEXT(N'BypassRLS') AS INT) = 1
        OR (
            CAST(SESSION_CONTEXT(N'IsDeptHead') AS INT) = 1 
            AND EXISTS (
                SELECT 1 
                FROM [HR].[NhanVien_Internal] nv 
                WHERE nv.MaNV = @MaNV_Row 
                  AND nv.MaDonVi = CAST(SESSION_CONTEXT(N'MaDonVi') AS VARCHAR(20))
            )
        )
        OR (
            @MaNV_Row = CAST(SESSION_CONTEXT(N'MaNV') AS VARCHAR(20))
            AND @NgayChot IS NOT NULL
        )
);

GO
/****** Object:  UserDefinedFunction [Security].[fn_RLS_NhanVien]    Script Date: 05/05/2026 03:50:54 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =========================================================================
-- BƯỚC 2: TÁI TẠO HÀM RLS DỰA TRÊN 5 THAM SỐ CONTEXT CỦA BẠN
-- =========================================================================
CREATE   FUNCTION [Security].[fn_RLS_NhanVien] (@MaDonVi VARCHAR(20), @MaNV VARCHAR(20))
RETURNS TABLE
WITH SCHEMABINDING
AS
RETURN (
    SELECT 1 AS fn_securitypredicate_result
    WHERE 
        -- 1. Nếu Context báo BypassRLS = 1 (Dành cho Admin / HR_Human / HR_Payroll)
        -- -> Cho phép thấy toàn bộ dữ liệu ngay lập tức
        CAST(SESSION_CONTEXT(N'BypassRLS') AS INT) = 1
        
        -- 2. Nếu Context báo IsDeptHead = 1 (Là Trưởng phòng)
        -- -> Chỉ lấy những nhân viên có MaDonVi trong bảng TRÙNG VỚI MaDonVi trong Context
        OR (
            CAST(SESSION_CONTEXT(N'IsDeptHead') AS INT) = 1
            AND @MaDonVi = CAST(SESSION_CONTEXT(N'MaDonVi') AS VARCHAR(20))
        )
        
        -- 3. Cấp Nhân viên bình thường
        -- -> Chỉ thấy đúng bản ghi có MaNV trùng với MaNV trong Context
        OR @MaNV = CAST(SESSION_CONTEXT(N'MaNV') AS VARCHAR(20))
);
GO
/****** Object:  UserDefinedFunction [Security].[fn_rls_ChamCong_Predicate]    Script Date: 05/05/2026 03:50:54 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE FUNCTION [Security].[fn_rls_ChamCong_Predicate]
(
    @MaNV VARCHAR(20)
)
RETURNS TABLE
WITH SCHEMABINDING
AS
RETURN
(
    SELECT 1 AS result
    FROM [HR].[NhanVien_Internal] nv
    WHERE nv.MaNV = @MaNV
      AND EXISTS (
            SELECT 1
            FROM [Security].[fn_RLS_NhanVien](nv.MaDonVi, nv.MaNV)
      )
);
GO
/****** Object:  View [HR].[NhanVien]    Script Date: 05/05/2026 03:50:54 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


-- 3. Update VIEW
CREATE VIEW [HR].[NhanVien]
AS
SELECT 
    nv.[MaNV], nv.[HoTen], nv.[Email], nv.[SoDienThoai], nv.[SoCCCD], nv.[NgaySinh], 
    nv.[GioiTinh], nv.[QueQuan], nv.[MaDonVi], nv.[NgayVaoBienChe], 
    nv.[TrangThai], nv.[UserID],
    nv.[MaCaLamViec]
FROM [HR].[NhanVien_Internal] nv;
GO
/****** Object:  UserDefinedFunction [Security].[fn_SecurityPredicate]    Script Date: 05/05/2026 03:50:54 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE FUNCTION [Security].[fn_SecurityPredicate]
(
    @MaNV    VARCHAR(20),
    @MaDonVi VARCHAR(20)
)
RETURNS TABLE
WITH SCHEMABINDING
AS
RETURN
(
    SELECT 1 AS fn_SecurityPredicateResult
    WHERE
        -- Tier 1: SELF — employee can always see their own rows.
        -- Evaluated first — most frequent path, leverages index on MaNV.
        @MaNV = CAST(SESSION_CONTEXT(N'MaNV') AS VARCHAR(20))

        -- Tier 2: DEPTHEAD — sees all rows belonging to their department.
        -- Flag (IsDeptHead) is an optimisation hint computed by the backend
        -- from the DB-authoritative RoleName. The MaDonVi check prevents
        -- a misconfigured flag from leaking cross-department data.
        OR (
            CAST(SESSION_CONTEXT(N'IsDeptHead') AS INT) = 1
            AND @MaDonVi = CAST(SESSION_CONTEXT(N'MaDonVi') AS VARCHAR(20))
        )

        -- Tier 3: BYPASS — Admin / HR can see all rows.
        -- The BypassRLS flag is set by the backend from the DB-authoritative
        -- RoleName (zero-trust: authMiddleware fetches role from DB on every
        -- request, never from the JWT). No additional SQL-layer string check
        -- is needed — the security guarantee comes from the backend chain.
        OR (
            CAST(SESSION_CONTEXT(N'BypassRLS') AS INT) = 1
        )
);
GO
/****** Object:  Table [HR].[BangCap]    Script Date: 05/05/2026 03:50:54 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [HR].[BangCap](
	[ID_Bang] [int] IDENTITY(1,1) NOT NULL,
	[MaNV] [varchar](20) NULL,
	[LoaiBang] [nvarchar](50) NULL,
	[ChuyenNganh] [nvarchar](100) NULL,
	[NoiDaoTao] [nvarchar](200) NULL,
	[NamTotNghiep] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[ID_Bang] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [HR].[CaLamViec]    Script Date: 05/05/2026 03:50:54 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [HR].[CaLamViec](
	[MaCaLamViec] [varchar](10) NOT NULL,
	[TenCa] [nvarchar](100) NOT NULL,
	[GioBatDau] [time](0) NOT NULL,
	[GioKetThuc] [time](0) NOT NULL,
	[PhutChoPhepTre] [int] NULL,
 CONSTRAINT [PK_CaLamViec] PRIMARY KEY CLUSTERED 
(
	[MaCaLamViec] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT [UQ_CaLamViec_TenCa] UNIQUE NONCLUSTERED 
(
	[TenCa] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [HR].[ChamCong]    Script Date: 05/05/2026 03:50:54 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [HR].[ChamCong](
	[ChamCongID] [int] IDENTITY(1,1) NOT NULL,
	[MaNV] [varchar](20) NOT NULL,
	[NgayChamCong] [date] NOT NULL,
	[GioVao] [datetime2](7) NULL,
	[GioRa] [datetime2](7) NULL,
	[SoPhutDiTre] [int] NULL,
	[SoPhutVeSom] [int] NULL,
	[TrangThai] [nvarchar](50) NULL,
 CONSTRAINT [PK_ChamCong] PRIMARY KEY CLUSTERED 
(
	[ChamCongID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT [UQ_ChamCong_MaNV_Ngay] UNIQUE NONCLUSTERED 
(
	[MaNV] ASC,
	[NgayChamCong] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [HR].[ChucVu]    Script Date: 05/05/2026 03:50:54 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [HR].[ChucVu](
	[MaChucVu] [varchar](20) NOT NULL,
	[TenChucVu] [nvarchar](100) NOT NULL,
	[PhuCapChucVu] [decimal](10, 2) NULL,
PRIMARY KEY CLUSTERED 
(
	[MaChucVu] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [HR].[DonVi]    Script Date: 05/05/2026 03:50:54 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [HR].[DonVi](
	[MaDonVi] [varchar](20) NOT NULL,
	[TenDonVi] [nvarchar](100) NOT NULL,
	[MaTruongPhong] [varchar](20) NULL,
	[MaDonViCha] [varchar](20) NULL,
	[SoDienThoai] [varchar](15) NULL,
PRIMARY KEY CLUSTERED 
(
	[MaDonVi] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [HR].[KhenThuongKyLuat]    Script Date: 05/05/2026 03:50:54 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [HR].[KhenThuongKyLuat](
	[ID_KTKL] [int] IDENTITY(1,1) NOT NULL,
	[MaNV] [varchar](20) NULL,
	[Loai] [nvarchar](50) NULL,
	[HinhThuc] [nvarchar](100) NULL,
	[NgayQuyetDinh] [date] NULL,
	[SoQuyetDinh] [varchar](50) NULL,
	[NoiDung] [nvarchar](max) NULL,
PRIMARY KEY CLUSTERED 
(
	[ID_KTKL] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [HR].[PhuCapCoDinh]    Script Date: 05/05/2026 03:50:54 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [HR].[PhuCapCoDinh](
	[ID_PhuCap] [int] IDENTITY(1,1) NOT NULL,
	[MaNV] [varchar](20) NOT NULL,
	[TenPhuCap] [nvarchar](100) NULL,
	[SoTien] [decimal](18, 2) NULL,
	[IsActive] [bit] NULL,
	[NgayTao] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[ID_PhuCap] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [HR].[QuaTrinhCongTac]    Script Date: 05/05/2026 03:50:54 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [HR].[QuaTrinhCongTac](
	[ID_CT] [int] IDENTITY(1,1) NOT NULL,
	[MaNV] [varchar](20) NULL,
	[TuNgay] [date] NULL,
	[DenNgay] [date] NULL,
	[MaDonVi] [varchar](20) NULL,
	[MaChucVu] [varchar](20) NULL,
	[NoiDung] [nvarchar](500) NULL,
PRIMARY KEY CLUSTERED 
(
	[ID_CT] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [Salary].[BangLuong]    Script Date: 05/05/2026 03:50:54 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [Salary].[BangLuong](
	[ID_BangLuong] [int] IDENTITY(1,1) NOT NULL,
	[MaNV] [varchar](20) NOT NULL,
	[ThangNam] [varchar](7) NOT NULL,
	[HeSoLuong] [decimal](10, 2) NULL,
	[LuongCoSo] [decimal](18, 2) NULL,
	[PhuCap] [decimal](18, 2) NULL,
	[MucLuongDongBH] [decimal](18, 2) NULL,
	[TienKhauTruBH] [decimal](18, 2) NULL,
	[ThucLanh] [decimal](18, 2) NOT NULL,
	[NgayChot] [datetime] NULL,
	[GhiChu] [nvarchar](255) NULL,
PRIMARY KEY CLUSTERED 
(
	[ID_BangLuong] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT [UQ_NV_Thang] UNIQUE NONCLUSTERED 
(
	[MaNV] ASC,
	[ThangNam] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [Salary].[BaoHiem]    Script Date: 05/05/2026 03:50:54 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [Salary].[BaoHiem](
	[MaNV] [varchar](20) NOT NULL,
	[SoSoBHXH] [varchar](20) MASKED WITH (FUNCTION = 'partial(0, "XXXXXX", 2)') NOT NULL,
	[MaSoBHYT] [varchar](20) NULL,
	[NgayBatDauDong] [date] NULL,
	[NoiDANGKY_KCB] [nvarchar](200) NULL,
PRIMARY KEY CLUSTERED 
(
	[MaNV] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
UNIQUE NONCLUSTERED 
(
	[SoSoBHXH] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
UNIQUE NONCLUSTERED 
(
	[MaSoBHYT] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [Salary].[ChiTietNgachLuong]    Script Date: 05/05/2026 03:50:54 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [Salary].[ChiTietNgachLuong](
	[MaNgach] [varchar](20) NOT NULL,
	[BacLuong] [int] NOT NULL,
	[HeSoLuong] [decimal](10, 2) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[MaNgach] ASC,
	[BacLuong] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [Salary].[DienBienLuong]    Script Date: 05/05/2026 03:50:54 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [Salary].[DienBienLuong](
	[ID_Luong] [int] IDENTITY(1,1) NOT NULL,
	[MaNV] [varchar](20) NULL,
	[MaNgach] [varchar](20) NULL,
	[BacLuong] [int] NULL,
	[HeSoLuong] [decimal](10, 2) MASKED WITH (FUNCTION = 'default()') NULL,
	[NgayHuong] [date] NULL,
	[NgayXetNangBacTiepTheo] [date] NULL,
	[GhiChu] [nvarchar](255) MASKED WITH (FUNCTION = 'default()') NULL,
	[IsCurrent] [bit] NULL,
PRIMARY KEY CLUSTERED 
(
	[ID_Luong] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [Salary].[HopDong]    Script Date: 05/05/2026 03:50:54 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [Salary].[HopDong](
	[MaHopDong] [varchar](50) NOT NULL,
	[MaNV] [varchar](20) NOT NULL,
	[LoaiHopDong] [nvarchar](100) NOT NULL,
	[NgayKy] [date] NOT NULL,
	[NgayCoHieuLuc] [date] NOT NULL,
	[NgayHetHan] [date] NULL,
	[TrangThai] [nvarchar](50) NULL,
	[TepDinhKem] [nvarchar](max) NULL,
PRIMARY KEY CLUSTERED 
(
	[MaHopDong] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [Salary].[LichSuDongBaoHiem]    Script Date: 05/05/2026 03:50:54 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [Salary].[LichSuDongBaoHiem](
	[ID_Log] [int] IDENTITY(1,1) NOT NULL,
	[MaNV] [varchar](20) NULL,
	[TuThangYear] [varchar](7) NULL,
	[MucLuongDong] [decimal](18, 2) MASKED WITH (FUNCTION = 'default()') NULL,
	[PhanTramDong_NV] [decimal](5, 2) NULL,
	[PhanTramDong_DV] [decimal](5, 2) NULL,
	[GhiChu] [nvarchar](255) NULL,
PRIMARY KEY CLUSTERED 
(
	[ID_Log] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [Salary].[NgachLuong]    Script Date: 05/05/2026 03:50:54 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [Salary].[NgachLuong](
	[MaNgach] [varchar](20) NOT NULL,
	[TenNgach] [nvarchar](100) NOT NULL,
	[NhomNgach] [nvarchar](50) NULL,
PRIMARY KEY CLUSTERED 
(
	[MaNgach] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [System].[AccessAudit]    Script Date: 05/05/2026 03:50:54 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [System].[AccessAudit](
	[LogID] [int] IDENTITY(1,1) NOT NULL,
	[UserID] [int] NULL,
	[MaNV] [varchar](20) NULL,
	[Action] [varchar](50) NULL,
	[Resource] [varchar](100) NULL,
	[TargetMaNV] [varchar](20) NULL,
	[ActionDate] [datetime] NULL,
	[ClientIP] [varchar](50) NULL,
	[AppName] [nvarchar](128) NULL,
PRIMARY KEY CLUSTERED 
(
	[LogID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [System].[Audit]    Script Date: 05/05/2026 03:50:54 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [System].[Audit](
	[AuditID] [bigint] IDENTITY(1,1) NOT NULL,
	[TableName] [nvarchar](100) NULL,
	[Action] [nvarchar](20) NULL,
	[OldData] [nvarchar](max) NULL,
	[NewData] [nvarchar](max) NULL,
	[ChangedBy] [varchar](50) NULL,
	[ChangedDate] [datetime] NULL,
	[RecordID] [nvarchar](50) NULL,
PRIMARY KEY CLUSTERED 
(
	[AuditID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [System].[AuthorizationAudit]    Script Date: 05/05/2026 03:50:54 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [System].[AuthorizationAudit](
	[LogID] [int] IDENTITY(1,1) NOT NULL,
	[Actor_MaNV] [varchar](20) NULL,
	[Target_MaNV] [varchar](20) NULL,
	[OldRole] [nvarchar](50) NULL,
	[NewRole] [nvarchar](50) NULL,
	[Reason] [nvarchar](500) NULL,
	[ActionDate] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[LogID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [System].[Config]    Script Date: 05/05/2026 03:50:54 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [System].[Config](
	[ConfigKey] [varchar](50) NOT NULL,
	[ConfigValue] [nvarchar](500) NULL,
	[Description] [nvarchar](255) NULL,
	[ValueType] [varchar](20) NULL,
PRIMARY KEY CLUSTERED 
(
	[ConfigKey] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [System].[ConfigAuditLog]    Script Date: 05/05/2026 03:50:54 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [System].[ConfigAuditLog](
	[LogID] [int] IDENTITY(1,1) NOT NULL,
	[ConfigKey] [varchar](50) NULL,
	[OldValue] [nvarchar](4000) NULL,
	[NewValue] [nvarchar](4000) NULL,
	[UpdatedBy] [varchar](20) NULL,
	[UpdatedAt] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[LogID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [System].[LoginLogs]    Script Date: 05/05/2026 03:50:54 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [System].[LoginLogs](
	[LogID] [int] IDENTITY(1,1) NOT NULL,
	[LoginName] [nvarchar](100) NULL,
	[LoginTime] [datetime] NULL,
	[HostName] [nvarchar](100) NULL,
	[AppName] [nvarchar](500) NULL,
PRIMARY KEY CLUSTERED 
(
	[LogID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [System].[User]    Script Date: 05/05/2026 03:50:54 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [System].[User](
	[UserID] [int] IDENTITY(1,1) NOT NULL,
	[Username] [varchar](50) NOT NULL,
	[PasswordHash] [varbinary](max) NOT NULL,
	[RoleName] [nvarchar](50) NOT NULL,
	[TrangThai] [int] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[UserID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
UNIQUE NONCLUSTERED 
(
	[Username] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  SecurityPolicy [Security].[BangLuongPolicy]    Script Date: 05/05/2026 03:50:54 PM ******/
CREATE SECURITY POLICY [Security].[BangLuongPolicy] 
ADD FILTER PREDICATE [Security].[fn_rls_BangLuong]([MaNV],[NgayChot]) ON [Salary].[BangLuong],
ADD BLOCK PREDICATE [Security].[fn_rls_BangLuong]([MaNV],[NgayChot]) ON [Salary].[BangLuong] AFTER UPDATE
WITH (STATE = ON, SCHEMABINDING = ON)
GO
/****** Object:  SecurityPolicy [Security].[BaoHiemPolicy]    Script Date: 05/05/2026 03:50:54 PM ******/
CREATE SECURITY POLICY [Security].[BaoHiemPolicy] 
ADD FILTER PREDICATE [Security].[fn_SecurityPredicate]([MaNV],'') ON [Salary].[BaoHiem],
ADD BLOCK PREDICATE [Security].[fn_SecurityPredicate]([MaNV],'') ON [Salary].[BaoHiem]
WITH (STATE = ON, SCHEMABINDING = ON)
GO
/****** Object:  SecurityPolicy [Security].[ChamCongPolicy]    Script Date: 05/05/2026 03:50:54 PM ******/
CREATE SECURITY POLICY [Security].[ChamCongPolicy] 
ADD FILTER PREDICATE [Security].[fn_rls_ChamCong_Predicate]([MaNV]) ON [HR].[ChamCong],
ADD BLOCK PREDICATE [Security].[fn_rls_ChamCong_Predicate]([MaNV]) ON [HR].[ChamCong] AFTER INSERT,
ADD BLOCK PREDICATE [Security].[fn_rls_ChamCong_Predicate]([MaNV]) ON [HR].[ChamCong] AFTER UPDATE
WITH (STATE = ON, SCHEMABINDING = ON)
GO
/****** Object:  SecurityPolicy [Security].[DienBienLuongPolicy]    Script Date: 05/05/2026 03:50:54 PM ******/
CREATE SECURITY POLICY [Security].[DienBienLuongPolicy] 
ADD FILTER PREDICATE [Security].[fn_SecurityPredicate]([MaNV],'') ON [Salary].[DienBienLuong],
ADD BLOCK PREDICATE [Security].[fn_SecurityPredicate]([MaNV],'') ON [Salary].[DienBienLuong]
WITH (STATE = ON, SCHEMABINDING = ON)
GO
/****** Object:  SecurityPolicy [Security].[HopDongPolicy]    Script Date: 05/05/2026 03:50:54 PM ******/
CREATE SECURITY POLICY [Security].[HopDongPolicy] 
ADD FILTER PREDICATE [Security].[fn_SecurityPredicate]([MaNV],'') ON [Salary].[HopDong],
ADD BLOCK PREDICATE [Security].[fn_SecurityPredicate]([MaNV],'') ON [Salary].[HopDong]
WITH (STATE = ON, SCHEMABINDING = ON)
GO
/****** Object:  SecurityPolicy [Security].[KTKLPolicy]    Script Date: 05/05/2026 03:50:54 PM ******/
CREATE SECURITY POLICY [Security].[KTKLPolicy] 
ADD FILTER PREDICATE [Security].[fn_SecurityPredicate]([MaNV],'') ON [HR].[KhenThuongKyLuat],
ADD BLOCK PREDICATE [Security].[fn_SecurityPredicate]([MaNV],'') ON [HR].[KhenThuongKyLuat]
WITH (STATE = ON, SCHEMABINDING = ON)
GO
/****** Object:  SecurityPolicy [Security].[LichSuBaoHiemPolicy]    Script Date: 05/05/2026 03:50:54 PM ******/
CREATE SECURITY POLICY [Security].[LichSuBaoHiemPolicy] 
ADD FILTER PREDICATE [Security].[fn_SecurityPredicate]([MaNV],'') ON [Salary].[LichSuDongBaoHiem],
ADD BLOCK PREDICATE [Security].[fn_SecurityPredicate]([MaNV],'') ON [Salary].[LichSuDongBaoHiem]
WITH (STATE = ON, SCHEMABINDING = ON)
GO
/****** Object:  SecurityPolicy [Security].[Policy_HR_NhanVien]    Script Date: 05/05/2026 03:50:54 PM ******/
CREATE SECURITY POLICY [Security].[Policy_HR_NhanVien] 
ADD FILTER PREDICATE [Security].[fn_RLS_NhanVien]([MaDonVi],[MaNV]) ON [HR].[NhanVien_Internal]
WITH (STATE = ON, SCHEMABINDING = ON)
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [IX_ChamCong_MaNV_Ngay]    Script Date: 05/05/2026 03:50:54 PM ******/
CREATE NONCLUSTERED INDEX [IX_ChamCong_MaNV_Ngay] ON [HR].[ChamCong]
(
	[MaNV] ASC,
	[NgayChamCong] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_ChamCong_Ngay]    Script Date: 05/05/2026 03:50:54 PM ******/
CREATE NONCLUSTERED INDEX [IX_ChamCong_Ngay] ON [HR].[ChamCong]
(
	[NgayChamCong] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [IX_NhanVien_DonVi]    Script Date: 05/05/2026 03:50:54 PM ******/
CREATE NONCLUSTERED INDEX [IX_NhanVien_DonVi] ON [HR].[NhanVien_Internal]
(
	[MaDonVi] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UX_NhanVien_Email]    Script Date: 05/05/2026 03:50:54 PM ******/
CREATE UNIQUE NONCLUSTERED INDEX [UX_NhanVien_Email] ON [HR].[NhanVien_Internal]
(
	[Email] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UX_NhanVien_MaNV]    Script Date: 05/05/2026 03:50:54 PM ******/
CREATE UNIQUE NONCLUSTERED INDEX [UX_NhanVien_MaNV] ON [HR].[NhanVien_Internal]
(
	[MaNV] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [IX_BangLuong_ThangNam]    Script Date: 05/05/2026 03:50:54 PM ******/
CREATE NONCLUSTERED INDEX [IX_BangLuong_ThangNam] ON [Salary].[BangLuong]
(
	[ThangNam] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [IX_Luong_MaNV]    Script Date: 05/05/2026 03:50:54 PM ******/
CREATE NONCLUSTERED INDEX [IX_Luong_MaNV] ON [Salary].[DienBienLuong]
(
	[MaNV] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UX_CurrentSalary]    Script Date: 05/05/2026 03:50:54 PM ******/
CREATE UNIQUE NONCLUSTERED INDEX [UX_CurrentSalary] ON [Salary].[DienBienLuong]
(
	[MaNV] ASC
)
WHERE ([IsCurrent]=(1))
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_AccessAudit_Date]    Script Date: 05/05/2026 03:50:54 PM ******/
CREATE NONCLUSTERED INDEX [IX_AccessAudit_Date] ON [System].[AccessAudit]
(
	[ActionDate] DESC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [IX_Audit_TargetDate]    Script Date: 05/05/2026 03:50:54 PM ******/
CREATE NONCLUSTERED INDEX [IX_Audit_TargetDate] ON [System].[AuthorizationAudit]
(
	[Target_MaNV] ASC,
	[ActionDate] DESC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_AuthAudit_Date]    Script Date: 05/05/2026 03:50:54 PM ******/
CREATE NONCLUSTERED INDEX [IX_AuthAudit_Date] ON [System].[AuthorizationAudit]
(
	[ActionDate] DESC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_ConfigAudit_Date]    Script Date: 05/05/2026 03:50:54 PM ******/
CREATE NONCLUSTERED INDEX [IX_ConfigAudit_Date] ON [System].[ConfigAuditLog]
(
	[UpdatedAt] DESC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_LoginLogs_Date]    Script Date: 05/05/2026 03:50:54 PM ******/
CREATE NONCLUSTERED INDEX [IX_LoginLogs_Date] ON [System].[LoginLogs]
(
	[LoginTime] DESC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UX_User_Username]    Script Date: 05/05/2026 03:50:54 PM ******/
CREATE UNIQUE NONCLUSTERED INDEX [UX_User_Username] ON [System].[User]
(
	[Username] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
ALTER TABLE [HR].[CaLamViec] ADD  DEFAULT ((0)) FOR [PhutChoPhepTre]
GO
ALTER TABLE [HR].[ChamCong] ADD  DEFAULT ((0)) FOR [SoPhutDiTre]
GO
ALTER TABLE [HR].[ChamCong] ADD  DEFAULT ((0)) FOR [SoPhutVeSom]
GO
ALTER TABLE [HR].[ChucVu] ADD  DEFAULT ((0)) FOR [PhuCapChucVu]
GO
ALTER TABLE [HR].[NhanVien_Internal] ADD  DEFAULT ((1)) FOR [TrangThai]
GO
ALTER TABLE [HR].[PhuCapCoDinh] ADD  DEFAULT ((0)) FOR [SoTien]
GO
ALTER TABLE [HR].[PhuCapCoDinh] ADD  DEFAULT ((1)) FOR [IsActive]
GO
ALTER TABLE [HR].[PhuCapCoDinh] ADD  DEFAULT (getdate()) FOR [NgayTao]
GO
ALTER TABLE [Salary].[BangLuong] ADD  DEFAULT ((0)) FOR [PhuCap]
GO
ALTER TABLE [Salary].[BangLuong] ADD  DEFAULT ((0)) FOR [TienKhauTruBH]
GO
ALTER TABLE [Salary].[DienBienLuong] ADD  DEFAULT ((1)) FOR [IsCurrent]
GO
ALTER TABLE [Salary].[HopDong] ADD  DEFAULT (N'Đang hiệu lực') FOR [TrangThai]
GO
ALTER TABLE [Salary].[LichSuDongBaoHiem] ADD  DEFAULT ((10.5)) FOR [PhanTramDong_NV]
GO
ALTER TABLE [Salary].[LichSuDongBaoHiem] ADD  DEFAULT ((21.5)) FOR [PhanTramDong_DV]
GO
ALTER TABLE [System].[AccessAudit] ADD  DEFAULT (getdate()) FOR [ActionDate]
GO
ALTER TABLE [System].[Audit] ADD  DEFAULT (getdate()) FOR [ChangedDate]
GO
ALTER TABLE [System].[AuthorizationAudit] ADD  DEFAULT (getdate()) FOR [ActionDate]
GO
ALTER TABLE [System].[Config] ADD  DEFAULT ('string') FOR [ValueType]
GO
ALTER TABLE [System].[ConfigAuditLog] ADD  DEFAULT (getdate()) FOR [UpdatedAt]
GO
ALTER TABLE [System].[User] ADD  DEFAULT ((1)) FOR [TrangThai]
GO
ALTER TABLE [HR].[ChamCong]  WITH CHECK ADD  CONSTRAINT [FK_ChamCong_NhanVien] FOREIGN KEY([MaNV])
REFERENCES [HR].[NhanVien_Internal] ([MaNV])
GO
ALTER TABLE [HR].[ChamCong] CHECK CONSTRAINT [FK_ChamCong_NhanVien]
GO
ALTER TABLE [HR].[DonVi]  WITH CHECK ADD  CONSTRAINT [FK_DonVi_Cha] FOREIGN KEY([MaDonViCha])
REFERENCES [HR].[DonVi] ([MaDonVi])
GO
ALTER TABLE [HR].[DonVi] CHECK CONSTRAINT [FK_DonVi_Cha]
GO
ALTER TABLE [HR].[DonVi]  WITH CHECK ADD  CONSTRAINT [FK_DonVi_NhanVien_TruongPhong] FOREIGN KEY([MaTruongPhong])
REFERENCES [HR].[NhanVien_Internal] ([MaNV])
GO
ALTER TABLE [HR].[DonVi] CHECK CONSTRAINT [FK_DonVi_NhanVien_TruongPhong]
GO
ALTER TABLE [HR].[KhenThuongKyLuat]  WITH CHECK ADD  CONSTRAINT [FK_KTKL_NhanVien] FOREIGN KEY([MaNV])
REFERENCES [HR].[NhanVien_Internal] ([MaNV])
GO
ALTER TABLE [HR].[KhenThuongKyLuat] CHECK CONSTRAINT [FK_KTKL_NhanVien]
GO
ALTER TABLE [HR].[NhanVien_Internal]  WITH CHECK ADD  CONSTRAINT [FK_NhanVien_CaLamViec] FOREIGN KEY([MaCaLamViec])
REFERENCES [HR].[CaLamViec] ([MaCaLamViec])
GO
ALTER TABLE [HR].[NhanVien_Internal] CHECK CONSTRAINT [FK_NhanVien_CaLamViec]
GO
ALTER TABLE [HR].[NhanVien_Internal]  WITH CHECK ADD  CONSTRAINT [FK_NhanVien_DonVi] FOREIGN KEY([MaDonVi])
REFERENCES [HR].[DonVi] ([MaDonVi])
GO
ALTER TABLE [HR].[NhanVien_Internal] CHECK CONSTRAINT [FK_NhanVien_DonVi]
GO
ALTER TABLE [HR].[NhanVien_Internal]  WITH CHECK ADD  CONSTRAINT [FK_NhanVien_User] FOREIGN KEY([UserID])
REFERENCES [System].[User] ([UserID])
GO
ALTER TABLE [HR].[NhanVien_Internal] CHECK CONSTRAINT [FK_NhanVien_User]
GO
ALTER TABLE [HR].[QuaTrinhCongTac]  WITH CHECK ADD  CONSTRAINT [FK_CT_ChucVu] FOREIGN KEY([MaChucVu])
REFERENCES [HR].[ChucVu] ([MaChucVu])
GO
ALTER TABLE [HR].[QuaTrinhCongTac] CHECK CONSTRAINT [FK_CT_ChucVu]
GO
ALTER TABLE [HR].[QuaTrinhCongTac]  WITH CHECK ADD  CONSTRAINT [FK_CT_DonVi] FOREIGN KEY([MaDonVi])
REFERENCES [HR].[DonVi] ([MaDonVi])
GO
ALTER TABLE [HR].[QuaTrinhCongTac] CHECK CONSTRAINT [FK_CT_DonVi]
GO
ALTER TABLE [HR].[QuaTrinhCongTac]  WITH CHECK ADD  CONSTRAINT [FK_CT_NhanVien] FOREIGN KEY([MaNV])
REFERENCES [HR].[NhanVien_Internal] ([MaNV])
GO
ALTER TABLE [HR].[QuaTrinhCongTac] CHECK CONSTRAINT [FK_CT_NhanVien]
GO
ALTER TABLE [Salary].[BangLuong]  WITH CHECK ADD  CONSTRAINT [FK_BangLuong_NhanVien] FOREIGN KEY([MaNV])
REFERENCES [HR].[NhanVien_Internal] ([MaNV])
GO
ALTER TABLE [Salary].[BangLuong] CHECK CONSTRAINT [FK_BangLuong_NhanVien]
GO
ALTER TABLE [Salary].[BaoHiem]  WITH CHECK ADD  CONSTRAINT [FK_BaoHiem_NhanVien] FOREIGN KEY([MaNV])
REFERENCES [HR].[NhanVien_Internal] ([MaNV])
GO
ALTER TABLE [Salary].[BaoHiem] CHECK CONSTRAINT [FK_BaoHiem_NhanVien]
GO
ALTER TABLE [Salary].[ChiTietNgachLuong]  WITH CHECK ADD  CONSTRAINT [FK_ChiTietNgach_Ngach] FOREIGN KEY([MaNgach])
REFERENCES [Salary].[NgachLuong] ([MaNgach])
ON DELETE CASCADE
GO
ALTER TABLE [Salary].[ChiTietNgachLuong] CHECK CONSTRAINT [FK_ChiTietNgach_Ngach]
GO
ALTER TABLE [Salary].[DienBienLuong]  WITH CHECK ADD  CONSTRAINT [FK_Luong_Ngach] FOREIGN KEY([MaNgach])
REFERENCES [Salary].[NgachLuong] ([MaNgach])
GO
ALTER TABLE [Salary].[DienBienLuong] CHECK CONSTRAINT [FK_Luong_Ngach]
GO
ALTER TABLE [Salary].[DienBienLuong]  WITH CHECK ADD  CONSTRAINT [FK_Luong_NhanVien] FOREIGN KEY([MaNV])
REFERENCES [HR].[NhanVien_Internal] ([MaNV])
GO
ALTER TABLE [Salary].[DienBienLuong] CHECK CONSTRAINT [FK_Luong_NhanVien]
GO
ALTER TABLE [Salary].[HopDong]  WITH CHECK ADD  CONSTRAINT [FK_HopDong_NhanVien] FOREIGN KEY([MaNV])
REFERENCES [HR].[NhanVien_Internal] ([MaNV])
GO
ALTER TABLE [Salary].[HopDong] CHECK CONSTRAINT [FK_HopDong_NhanVien]
GO
ALTER TABLE [Salary].[LichSuDongBaoHiem]  WITH CHECK ADD  CONSTRAINT [FK_LichSuBH_NhanVien] FOREIGN KEY([MaNV])
REFERENCES [HR].[NhanVien_Internal] ([MaNV])
GO
ALTER TABLE [Salary].[LichSuDongBaoHiem] CHECK CONSTRAINT [FK_LichSuBH_NhanVien]
GO
ALTER TABLE [HR].[CaLamViec]  WITH CHECK ADD  CONSTRAINT [CK_CaLamViec_Gio] CHECK  (([GioKetThuc]>[GioBatDau]))
GO
ALTER TABLE [HR].[CaLamViec] CHECK CONSTRAINT [CK_CaLamViec_Gio]
GO
ALTER TABLE [HR].[ChamCong]  WITH CHECK ADD  CONSTRAINT [CK_ChamCong_DiTre] CHECK  (([SoPhutDiTre]>=(0)))
GO
ALTER TABLE [HR].[ChamCong] CHECK CONSTRAINT [CK_ChamCong_DiTre]
GO
ALTER TABLE [HR].[ChamCong]  WITH CHECK ADD  CONSTRAINT [CK_ChamCong_Gio] CHECK  (([GioRa]>=[GioVao]))
GO
ALTER TABLE [HR].[ChamCong] CHECK CONSTRAINT [CK_ChamCong_Gio]
GO
ALTER TABLE [HR].[ChamCong]  WITH CHECK ADD  CONSTRAINT [CK_ChamCong_VeSom] CHECK  (([SoPhutVeSom]>=(0)))
GO
ALTER TABLE [HR].[ChamCong] CHECK CONSTRAINT [CK_ChamCong_VeSom]
GO
/****** Object:  StoredProcedure [HR].[sp_TinhCongNgay]    Script Date: 05/05/2026 03:50:54 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   PROCEDURE [HR].[sp_TinhCongNgay]
    @MaNV VARCHAR(20),
    @NgayChamCong DATE
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    DECLARE 
        @GioVao DATETIME2,
        @GioRa DATETIME2,
        @MaCa VARCHAR(10),
        @GioBatDau TIME,
        @GioKetThuc TIME,
        @SoPhutDiTre INT = 0,
        @SoPhutVeSom INT = 0;

    BEGIN TRY
        BEGIN TRAN;

        -- 1. LOCK ROW
        SELECT 
            @GioVao = GioVao,
            @GioRa = GioRa
        FROM [HR].[ChamCong] WITH (UPDLOCK, HOLDLOCK)
        WHERE MaNV = @MaNV 
          AND NgayChamCong = @NgayChamCong;

        IF @@ROWCOUNT = 0
            THROW 50001, N'Không tồn tại dữ liệu chấm công.', 1;

        -- 2. LẤY CA
        SELECT 
            @MaCa = nv.MaCaLamViec,
            @GioBatDau = ca.GioBatDau,
            @GioKetThuc = ca.GioKetThuc
        FROM [HR].[NhanVien_Internal] nv
        LEFT JOIN [HR].[CaLamViec] ca 
            ON nv.MaCaLamViec = ca.MaCaLamViec
        WHERE nv.MaNV = @MaNV;

        IF @MaCa IS NULL OR @GioBatDau IS NULL
            THROW 50002, N'Nhân viên chưa có ca làm việc.', 1;

        -- 3. BUILD DATETIME CHUẨN (FIX LỖI Ở ĐÂY)
        DECLARE 
            @StartDateTime DATETIME2,
            @EndDateTime   DATETIME2;

        SET @StartDateTime = DATEADD(SECOND,
            DATEDIFF(SECOND, '00:00:00', @GioBatDau),
            CAST(@NgayChamCong AS DATETIME2)
        );

        SET @EndDateTime = DATEADD(SECOND,
            DATEDIFF(SECOND, '00:00:00', @GioKetThuc),
            CAST(@NgayChamCong AS DATETIME2)
        );

        -- 4. ĐI TRỄ
        IF @GioVao IS NOT NULL AND @GioVao > @StartDateTime
            SET @SoPhutDiTre = DATEDIFF(MINUTE, @StartDateTime, @GioVao);
        ELSE
            SET @SoPhutDiTre = 0;

        -- 5. VỀ SỚM
        IF @GioRa IS NOT NULL AND @GioRa < @EndDateTime
            SET @SoPhutVeSom = DATEDIFF(MINUTE, @GioRa, @EndDateTime);
        ELSE
            SET @SoPhutVeSom = 0;

        -- 6. TRẠNG THÁI
        DECLARE @TrangThai NVARCHAR(50);

        SET @TrangThai = CASE 
            WHEN @GioVao IS NULL OR @GioRa IS NULL 
                THEN N'Chưa hoàn tất'
            WHEN @SoPhutDiTre > 0 OR @SoPhutVeSom > 0 
                THEN N'Thiếu giờ'
            ELSE 
                N'Đủ công'
        END;

        -- 7. UPDATE
        UPDATE [HR].[ChamCong]
        SET 
            SoPhutDiTre = @SoPhutDiTre,
            SoPhutVeSom = @SoPhutVeSom,
            TrangThai   = @TrangThai
        WHERE MaNV = @MaNV 
          AND NgayChamCong = @NgayChamCong;

        COMMIT;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK;
        THROW;
    END CATCH
END
GO
USE [master]
GO
ALTER DATABASE [QuanLyBienChe_Testing_V2] SET  READ_WRITE 
GO
