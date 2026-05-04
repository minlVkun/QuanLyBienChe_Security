USE [master]
GO
/****** Object:  Database [QuanLyBienChe_Testing_V2]    Script Date: 22/04/2026 02:09:07 PM ******/
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
/****** Object:  User [HR_Payroll]    Script Date: 22/04/2026 02:09:07 PM ******/
CREATE USER [HR_Payroll] WITHOUT LOGIN WITH DEFAULT_SCHEMA=[dbo]
GO
/****** Object:  User [HR_Human]    Script Date: 22/04/2026 02:09:07 PM ******/
CREATE USER [HR_Human] WITHOUT LOGIN WITH DEFAULT_SCHEMA=[dbo]
GO
/****** Object:  User [Employee]    Script Date: 22/04/2026 02:09:07 PM ******/
CREATE USER [Employee] WITHOUT LOGIN WITH DEFAULT_SCHEMA=[dbo]
GO
/****** Object:  User [DeptHead]    Script Date: 22/04/2026 02:09:07 PM ******/
CREATE USER [DeptHead] WITHOUT LOGIN WITH DEFAULT_SCHEMA=[dbo]
GO
/****** Object:  User [AppBackendUser]    Script Date: 22/04/2026 02:09:07 PM ******/
CREATE USER [AppBackendUser] FOR LOGIN [AppBackendUser] WITH DEFAULT_SCHEMA=[dbo]
GO
/****** Object:  User [Admin]    Script Date: 22/04/2026 02:09:07 PM ******/
CREATE USER [Admin] WITHOUT LOGIN WITH DEFAULT_SCHEMA=[dbo]
GO
/****** Object:  DatabaseRole [db_HR_Payroll]    Script Date: 22/04/2026 02:09:07 PM ******/
CREATE ROLE [db_HR_Payroll]
GO
/****** Object:  DatabaseRole [db_HR_Human]    Script Date: 22/04/2026 02:09:07 PM ******/
CREATE ROLE [db_HR_Human]
GO
/****** Object:  DatabaseRole [db_Employee]    Script Date: 22/04/2026 02:09:07 PM ******/
CREATE ROLE [db_Employee]
GO
/****** Object:  DatabaseRole [db_DeptHead]    Script Date: 22/04/2026 02:09:07 PM ******/
CREATE ROLE [db_DeptHead]
GO
/****** Object:  DatabaseRole [db_Admin]    Script Date: 22/04/2026 02:09:07 PM ******/
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
/****** Object:  Schema [HR]    Script Date: 22/04/2026 02:09:07 PM ******/
CREATE SCHEMA [HR]
GO
/****** Object:  Schema [Salary]    Script Date: 22/04/2026 02:09:07 PM ******/
CREATE SCHEMA [Salary]
GO
/****** Object:  Schema [Security]    Script Date: 22/04/2026 02:09:07 PM ******/
CREATE SCHEMA [Security]
GO
/****** Object:  Schema [System]    Script Date: 22/04/2026 02:09:07 PM ******/
CREATE SCHEMA [System]
GO
/****** Object:  UserDefinedFunction [Security].[fn_MaskData]    Script Date: 22/04/2026 02:09:07 PM ******/
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
/****** Object:  Table [HR].[NhanVien_Internal]    Script Date: 22/04/2026 02:09:07 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [HR].[NhanVien_Internal](
	[MaNV] [varchar](20) NOT NULL,
	[HoTen] [nvarchar](100) NOT NULL,
	[NgaySinh] [date] MASKED WITH (FUNCTION = 'default()') NULL,
	[GioiTinh] [bit] NULL,
	[SoCCCD] [varchar](12) MASKED WITH (FUNCTION = 'partial(0, "******", 4)') NOT NULL,
	[Email] [varchar](100) MASKED WITH (FUNCTION = 'email()') NULL,
	[SoDienThoai] [varchar](15) MASKED WITH (FUNCTION = 'partial(0, "***", 3)') NULL,
	[QueQuan] [nvarchar](255) MASKED WITH (FUNCTION = 'default()') NULL,
	[MaDonVi] [varchar](20) NULL,
	[NgayVaoBienChe] [date] NULL,
	[TrangThai] [int] NULL,
	[UserID] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[MaNV] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
UNIQUE NONCLUSTERED 
(
	[SoCCCD] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  View [HR].[NhanVien]    Script Date: 22/04/2026 02:09:07 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE VIEW [HR].[NhanVien]
AS
SELECT 
    [MaNV],
    [HoTen],
    
    -- Logic che mờ linh hoạt
    [Security].[fn_MaskData]([Email], 'EMAIL', 
        CASE WHEN CAST(SESSION_CONTEXT(N'RoleName') AS NVARCHAR(50)) IN ('db_Admin', 'db_HR_Payroll', 'db_HR_Human') 
             OR [MaNV] = CAST(SESSION_CONTEXT(N'MaNV') AS VARCHAR(20)) THEN 1 ELSE 0 END) AS [Email],

    [Security].[fn_MaskData]([SoDienThoai], 'PHONE', 
        CASE WHEN CAST(SESSION_CONTEXT(N'RoleName') AS NVARCHAR(50)) IN ('db_Admin', 'db_HR_Payroll', 'db_HR_Human') 
             OR [MaNV] = CAST(SESSION_CONTEXT(N'MaNV') AS VARCHAR(20)) THEN 1 ELSE 0 END) AS [SoDienThoai],

    [Security].[fn_MaskData]([SoCCCD], 'CCCD', 
        CASE WHEN CAST(SESSION_CONTEXT(N'RoleName') AS NVARCHAR(50)) IN ('db_Admin', 'db_HR_Payroll') 
             OR [MaNV] = CAST(SESSION_CONTEXT(N'MaNV') AS VARCHAR(20)) THEN 1 ELSE 0 END) AS [SoCCCD],

    [NgaySinh], [GioiTinh], [QueQuan], [MaDonVi], [NgayVaoBienChe], [TrangThai], [UserID]
FROM [HR].[NhanVien_Internal];
GO
/****** Object:  UserDefinedFunction [Security].[fn_RLS_NhanVien]    Script Date: 22/04/2026 02:09:07 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE FUNCTION [Security].[fn_RLS_NhanVien]
(
    @MaNV    VARCHAR(20),  -- Cột MaNV của DÒNG DỮ LIỆU (SQL Server truyền vào từng hàng)
    @MaDonVi VARCHAR(20)   -- Cột MaDonVi của DÒNG DỮ LIỆU (SQL Server truyền vào từng hàng)
)
RETURNS TABLE
WITH SCHEMABINDING
AS
RETURN
(
    SELECT 1 AS fn_RLS_NhanVienResult
    FROM (VALUES(0)) AS _anchor(x)

    -- ⚡ CROSS APPLY: TRY_CAST SESSION_CONTEXT một lần duy nhất.
    -- TRY_CAST trả về NULL nếu kiểu dữ liệu không khớp (an toàn hơn CAST).
    -- Các biến ctx.* được tái sử dụng trong mọi tầng kiểm tra bên dưới.
    CROSS APPLY (
        SELECT
            TRY_CAST(SESSION_CONTEXT(N'MaNV')       AS VARCHAR(20)) AS ctx_MaNV,
            TRY_CAST(SESSION_CONTEXT(N'MaDonVi')    AS VARCHAR(20)) AS ctx_MaDonVi,
            TRY_CAST(SESSION_CONTEXT(N'BypassRLS')  AS INT)         AS ctx_Bypass,
            TRY_CAST(SESSION_CONTEXT(N'IsDeptHead') AS INT)         AS ctx_IsDept
    ) AS ctx

    WHERE
        -- 🌟 LỐI ĐI HỆ THỐNG: Dành riêng cho bước xác thực (Mapping UserID -> MaNV)
        TRY_CAST(SESSION_CONTEXT(N'SystemAuth') AS INT) = 1
        
        OR
        (
            -- ❌ FAIL-CLOSED (3 lớp — áp dụng cho MaNV của NGƯỜI GỌI):
            --   Lớp 1: TRY_CAST trả NULL nếu sai kiểu → ISNULL chuyển thành ''
            --   Lớp 2: LTRIM/RTRIM loại bỏ whitespace hai đầu
            --   Lớp 3: <> '' chặn empty string và chuỗi chỉ chứa khoảng trắng
            ISNULL(LTRIM(RTRIM(ctx.ctx_MaNV)), '') <> ''
    
            AND
            (
            -- 🔥 TẦNG SELF (selectivity cao nhất — Index Seek trên MaNV):
            -- Nhân viên chỉ được đọc/ghi dòng có MaNV của chính họ.
            -- Short-circuit OR: nếu khớp, SQL Server không đánh giá tầng sau.
            @MaNV = ctx.ctx_MaNV

            -- 🔥 TẦNG DEPTHEAD (HARDENED):
            -- IsDeptHead=1 xác nhận role là trưởng phòng (INT flag, không phải chuỗi).
            -- ctx_MaDonVi PHẢI hợp lệ (không rỗng) — ngăn bypass khi MaDonVi không được inject.
            -- @MaDonVi khớp ctx_MaDonVi → chỉ thấy nhân viên trong phòng của mình.
            OR (
                ctx.ctx_IsDept = 1
                AND ISNULL(LTRIM(RTRIM(ctx.ctx_MaDonVi)), '') <> ''
                AND @MaDonVi = ctx.ctx_MaDonVi
            )

            -- 🔥 TẦNG BYPASS (HARDENED — Admin/HR):
            -- BypassRLS=1 được backend tính từ RoleName lấy từ DB (Zero-Trust chain).
            -- HARDENED: Yêu cầu ĐỒNG THỜI ctx_Bypass=1 VÀ ctx_MaNV hợp lệ.
            -- Ngăn bypass khi chỉ có flag=1 nhưng context MaNV không hợp lệ
            -- (trường hợp backend inject thiếu hoặc bị can thiệp).
            OR (
                ctx.ctx_Bypass = 1
                -- ctx_MaNV đã được validate ở mệnh đề FAIL-CLOSED phía trên
                -- nên không cần kiểm tra lại tại đây — điều kiện AND đầu bảo đảm điều đó.
            )
        )
    )
);
GO
/****** Object:  UserDefinedFunction [Security].[fn_SecurityPredicate]    Script Date: 22/04/2026 02:09:07 PM ******/
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
/****** Object:  Table [HR].[BangCap]    Script Date: 22/04/2026 02:09:07 PM ******/
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
/****** Object:  Table [HR].[ChucVu]    Script Date: 22/04/2026 02:09:07 PM ******/
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
/****** Object:  Table [HR].[DonVi]    Script Date: 22/04/2026 02:09:07 PM ******/
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
/****** Object:  Table [HR].[KhenThuongKyLuat]    Script Date: 22/04/2026 02:09:07 PM ******/
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
/****** Object:  Table [HR].[QuaTrinhCongTac]    Script Date: 22/04/2026 02:09:07 PM ******/
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
/****** Object:  Table [Salary].[BangLuong]    Script Date: 22/04/2026 02:09:07 PM ******/
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
/****** Object:  Table [Salary].[BaoHiem]    Script Date: 22/04/2026 02:09:07 PM ******/
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
/****** Object:  Table [Salary].[ChiTietNgachLuong]    Script Date: 22/04/2026 02:09:07 PM ******/
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
/****** Object:  Table [Salary].[DienBienLuong]    Script Date: 22/04/2026 02:09:07 PM ******/
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
/****** Object:  Table [Salary].[HopDong]    Script Date: 22/04/2026 02:09:07 PM ******/
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
/****** Object:  Table [Salary].[LichSuDongBaoHiem]    Script Date: 22/04/2026 02:09:07 PM ******/
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
/****** Object:  Table [Salary].[NgachLuong]    Script Date: 22/04/2026 02:09:07 PM ******/
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
/****** Object:  Table [System].[Audit]    Script Date: 22/04/2026 02:09:07 PM ******/
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
/****** Object:  Table [System].[Config]    Script Date: 22/04/2026 02:09:07 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [System].[Config](
	[ConfigKey] [varchar](50) NOT NULL,
	[ConfigValue] [nvarchar](500) NULL,
	[Description] [nvarchar](255) NULL,
PRIMARY KEY CLUSTERED 
(
	[ConfigKey] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [System].[LoginLogs]    Script Date: 22/04/2026 02:09:07 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [System].[LoginLogs](
	[LogID] [int] IDENTITY(1,1) NOT NULL,
	[LoginName] [nvarchar](100) NULL,
	[LoginTime] [datetime] NULL,
	[HostName] [nvarchar](100) NULL,
	[AppName] [nvarchar](100) NULL,
PRIMARY KEY CLUSTERED 
(
	[LogID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [System].[User]    Script Date: 22/04/2026 02:09:07 PM ******/
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
/****** Object:  SecurityPolicy [Security].[BangLuongPolicy]    Script Date: 22/04/2026 02:09:07 PM ******/
CREATE SECURITY POLICY [Security].[BangLuongPolicy] 
ADD FILTER PREDICATE [Security].[fn_SecurityPredicate]([MaNV],'') ON [Salary].[BangLuong],
ADD BLOCK PREDICATE [Security].[fn_SecurityPredicate]([MaNV],'') ON [Salary].[BangLuong]
WITH (STATE = ON, SCHEMABINDING = ON)
GO
/****** Object:  SecurityPolicy [Security].[BaoHiemPolicy]    Script Date: 22/04/2026 02:09:07 PM ******/
CREATE SECURITY POLICY [Security].[BaoHiemPolicy] 
ADD FILTER PREDICATE [Security].[fn_SecurityPredicate]([MaNV],'') ON [Salary].[BaoHiem],
ADD BLOCK PREDICATE [Security].[fn_SecurityPredicate]([MaNV],'') ON [Salary].[BaoHiem]
WITH (STATE = ON, SCHEMABINDING = ON)
GO
/****** Object:  SecurityPolicy [Security].[DienBienLuongPolicy]    Script Date: 22/04/2026 02:09:07 PM ******/
CREATE SECURITY POLICY [Security].[DienBienLuongPolicy] 
ADD FILTER PREDICATE [Security].[fn_SecurityPredicate]([MaNV],'') ON [Salary].[DienBienLuong],
ADD BLOCK PREDICATE [Security].[fn_SecurityPredicate]([MaNV],'') ON [Salary].[DienBienLuong]
WITH (STATE = ON, SCHEMABINDING = ON)
GO
/****** Object:  SecurityPolicy [Security].[HopDongPolicy]    Script Date: 22/04/2026 02:09:07 PM ******/
CREATE SECURITY POLICY [Security].[HopDongPolicy] 
ADD FILTER PREDICATE [Security].[fn_SecurityPredicate]([MaNV],'') ON [Salary].[HopDong],
ADD BLOCK PREDICATE [Security].[fn_SecurityPredicate]([MaNV],'') ON [Salary].[HopDong]
WITH (STATE = ON, SCHEMABINDING = ON)
GO
/****** Object:  SecurityPolicy [Security].[KTKLPolicy]    Script Date: 22/04/2026 02:09:07 PM ******/
CREATE SECURITY POLICY [Security].[KTKLPolicy] 
ADD FILTER PREDICATE [Security].[fn_SecurityPredicate]([MaNV],'') ON [HR].[KhenThuongKyLuat],
ADD BLOCK PREDICATE [Security].[fn_SecurityPredicate]([MaNV],'') ON [HR].[KhenThuongKyLuat]
WITH (STATE = ON, SCHEMABINDING = ON)
GO
/****** Object:  SecurityPolicy [Security].[LichSuBaoHiemPolicy]    Script Date: 22/04/2026 02:09:07 PM ******/
CREATE SECURITY POLICY [Security].[LichSuBaoHiemPolicy] 
ADD FILTER PREDICATE [Security].[fn_SecurityPredicate]([MaNV],'') ON [Salary].[LichSuDongBaoHiem],
ADD BLOCK PREDICATE [Security].[fn_SecurityPredicate]([MaNV],'') ON [Salary].[LichSuDongBaoHiem]
WITH (STATE = ON, SCHEMABINDING = ON)
GO
/****** Object:  SecurityPolicy [Security].[Policy_HR_NhanVien]    Script Date: 22/04/2026 02:09:07 PM ******/
CREATE SECURITY POLICY [Security].[Policy_HR_NhanVien] 
ADD FILTER PREDICATE [Security].[fn_RLS_NhanVien]([MaNV],[MaDonVi]) ON [HR].[NhanVien_Internal],
ADD BLOCK PREDICATE [Security].[fn_RLS_NhanVien]([MaNV],[MaDonVi]) ON [HR].[NhanVien_Internal] AFTER INSERT,
ADD BLOCK PREDICATE [Security].[fn_RLS_NhanVien]([MaNV],[MaDonVi]) ON [HR].[NhanVien_Internal] AFTER UPDATE,
ADD BLOCK PREDICATE [Security].[fn_RLS_NhanVien]([MaNV],[MaDonVi]) ON [HR].[NhanVien_Internal] BEFORE DELETE
WITH (STATE = ON, SCHEMABINDING = ON)
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [IX_NhanVien_DonVi]    Script Date: 22/04/2026 02:09:08 PM ******/
CREATE NONCLUSTERED INDEX [IX_NhanVien_DonVi] ON [HR].[NhanVien_Internal]
(
	[MaDonVi] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UX_NhanVien_CCCD]    Script Date: 22/04/2026 02:09:08 PM ******/
CREATE UNIQUE NONCLUSTERED INDEX [UX_NhanVien_CCCD] ON [HR].[NhanVien_Internal]
(
	[SoCCCD] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UX_NhanVien_Email]    Script Date: 22/04/2026 02:09:08 PM ******/
CREATE UNIQUE NONCLUSTERED INDEX [UX_NhanVien_Email] ON [HR].[NhanVien_Internal]
(
	[Email] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UX_NhanVien_MaNV]    Script Date: 22/04/2026 02:09:08 PM ******/
CREATE UNIQUE NONCLUSTERED INDEX [UX_NhanVien_MaNV] ON [HR].[NhanVien_Internal]
(
	[MaNV] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [IX_BangLuong_ThangNam]    Script Date: 22/04/2026 02:09:08 PM ******/
CREATE NONCLUSTERED INDEX [IX_BangLuong_ThangNam] ON [Salary].[BangLuong]
(
	[ThangNam] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [IX_Luong_MaNV]    Script Date: 22/04/2026 02:09:08 PM ******/
CREATE NONCLUSTERED INDEX [IX_Luong_MaNV] ON [Salary].[DienBienLuong]
(
	[MaNV] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UX_CurrentSalary]    Script Date: 22/04/2026 02:09:08 PM ******/
CREATE UNIQUE NONCLUSTERED INDEX [UX_CurrentSalary] ON [Salary].[DienBienLuong]
(
	[MaNV] ASC
)
WHERE ([IsCurrent]=(1))
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UX_User_Username]    Script Date: 22/04/2026 02:09:08 PM ******/
CREATE UNIQUE NONCLUSTERED INDEX [UX_User_Username] ON [System].[User]
(
	[Username] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
ALTER TABLE [HR].[ChucVu] ADD  DEFAULT ((0)) FOR [PhuCapChucVu]
GO
ALTER TABLE [HR].[NhanVien_Internal] ADD  DEFAULT ((1)) FOR [TrangThai]
GO
ALTER TABLE [Salary].[BangLuong] ADD  DEFAULT ((0)) FOR [PhuCap]
GO
ALTER TABLE [Salary].[BangLuong] ADD  DEFAULT ((0)) FOR [TienKhauTruBH]
GO
ALTER TABLE [Salary].[BangLuong] ADD  DEFAULT (getdate()) FOR [NgayChot]
GO
ALTER TABLE [Salary].[DienBienLuong] ADD  DEFAULT ((1)) FOR [IsCurrent]
GO
ALTER TABLE [Salary].[HopDong] ADD  DEFAULT (N'Đang hiệu lực') FOR [TrangThai]
GO
ALTER TABLE [Salary].[LichSuDongBaoHiem] ADD  DEFAULT ((10.5)) FOR [PhanTramDong_NV]
GO
ALTER TABLE [Salary].[LichSuDongBaoHiem] ADD  DEFAULT ((21.5)) FOR [PhanTramDong_DV]
GO
ALTER TABLE [System].[Audit] ADD  DEFAULT (getdate()) FOR [ChangedDate]
GO
ALTER TABLE [System].[User] ADD  DEFAULT ((1)) FOR [TrangThai]
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
USE [master]
GO
ALTER DATABASE [QuanLyBienChe_Testing_V2] SET  READ_WRITE 
GO
