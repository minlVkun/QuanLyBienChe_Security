const sql = require('mssql/msnodesqlv8');
require('dotenv').config();

// [PHẦN 2] Giả lập: Gọi API đến Secret Manager lấy chứng chỉ/mật khẩu
const fetchSecretFromVault = async () => {
    console.log("🔒 [Secret Manager] Đang kết nối tới Vault để lấy CMK Certificate...");
    await new Promise(resolve => setTimeout(resolve, 500)); // Giả lập Network Latency
    const inMemoryKey = process.env.VAULT_CMK_SECRET || "CERT_LOADED_IN_RAM";
    console.log("✅ [Secret Manager] Đã tải chứng chỉ CMK vào RAM thành công.");
    return inMemoryKey;
};

const connectionString = `Driver={ODBC Driver 17 for SQL Server};Server=${process.env.DB_SERVER};Database=${process.env.DB_DATABASE};Uid=${process.env.DB_USER};Pwd=${process.env.DB_PASSWORD};Encrypt=yes;TrustServerCertificate=yes;ColumnEncryption=Enabled;`;

const config = {
    connectionString: connectionString,
    pool: {
        max: 20,
        min: 1,
        idleTimeoutMillis: 30000
    }
};

// Khởi tạo Connection Pool theo quy trình: Lấy Key -> Mở Kết Nối
const poolPromise = (async () => {
    try {
        // 1. Tải key vào RAM trước (Kiến trúc chuẩn)
        const cmkCert = await fetchSecretFromVault();

        // Ghi chú: Vì Node.js đang chạy trên Windows và dùng mssql >= v10,
        // tedious driver đã tự động tích hợp sẵn mssqlCertificateStoreProvider.
        // Bạn chỉ cần bật 'columnEncryptionSetting: Enabled' ở trên là đủ.

        // 2. Khởi tạo Connection
        const pool = new sql.ConnectionPool(config);
        await pool.connect();
        console.log('✅ Database Connected Successfully (Always Encrypted: ENABLED)');
        return pool;
    } catch (err) {
        console.error('❌ Database Connection Failed! Error: ', err);
        throw err;
    }
})();

module.exports = {
    sql,
    poolPromise
};