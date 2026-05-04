// src/middlewares/authMiddleware.js
//
// BẢO MẬT (SECURITY): Middleware xác thực theo mô hình Hybrid Zero-Trust.
//
// Mô hình tin cậy (Trust model):
//   - JWT CHỈ chứa UserID (được ký, nhưng không tin cậy đối với dữ liệu phân quyền/định danh)
//   - Toàn bộ dữ liệu phân quyền/định danh (role/identity) được truy xuất lại từ cơ sở dữ liệu trên mỗi request
//   - req.user do server quyết định 100% — tuyệt đối không lấy từ dữ liệu phía client truyền lên
//
// Tại sao MaDonVi được truy xuất ở đây:
//   - RLS predicate dành cho DeptHead kiểm tra @MaDonVi = SESSION_CONTEXT(N'MaDonVi')
//   - Nếu MaDonVi đến từ client, một trưởng phòng (dept head) có thể giả mạo quyền truy cập vào
//     phòng ban khác bằng cách gửi một giá trị MaDonVi khác.
//   - Truy xuất từ DB (thông qua NhanVien.MaDonVi) giúp ngăn chặn việc can thiệp, giả mạo.
//
// Luồng xử lý (Flow):
//   1. Xác minh chữ ký JWT → CHỈ trích xuất UserID
//   2. Truy vấn DB: User JOIN NhanVien → lấy RoleName, MaNV, MaDonVi
//   3. Xây dựng req.user hoàn toàn từ kết quả DB
//   4. Tùy chọn kiểm tra quyền (role) so với danh sách allowanceRoles

const jwt = require('jsonwebtoken');
const { sql, poolPromise } = require('../config/db');
const UserBlacklist = require('../utils/userBlacklist');
const TokenBlacklist = require('../utils/tokenBlacklist');

/**
 * Lấy bản ghi chuẩn của người dùng từ cơ sở dữ liệu.
 * Trả về null nếu người dùng không tồn tại hoặc bị khóa (TrangThai = -1).
 *
 * Bao gồm MaDonVi để RLS predicate của DeptHead có thể được xác minh
 * mà không cần bất kỳ dữ liệu nào do client cung cấp.
 *
 * @param {number} userID
 * @returns {Promise<{UserID, RoleName, MaNV, MaDonVi}|null>}
 */
async function fetchUserFromDB(userID) {
    const pool = await poolPromise;

    const request = pool.request();
    request.input('UserID', sql.Int, userID);

    // Batching: Mở lối đi riêng, thực hiện lấy dữ liệu, rồi khóa lại ngay
    // Đảm bảo chạy trên CÙNG 1 connection từ pool
    const batch = `
        EXEC sp_set_session_context @key = N'SystemAuth', @value = 1, @read_only = 0;
        EXEC sp_set_session_context @key = N'BypassRLS', @value = 1, @read_only = 0;
        
        SELECT
            u.UserID,
            u.RoleName,
            u.TrangThai,
            n.MaNV,
            n.MaDonVi
        FROM [System].[User] u
        LEFT JOIN [HR].[NhanVien] n ON u.UserID = n.UserID
        WHERE u.UserID = @UserID;
        
        EXEC sp_set_session_context @key = N'SystemAuth', @value = 0, @read_only = 0;
        EXEC sp_set_session_context @key = N'BypassRLS', @value = 0, @read_only = 0;
    `;

    const result = await request.query(batch);
    const user = result.recordset[0];

    if (!user) return null;

    // XỬ LÝ ALWAYS ENCRYPTED: Nếu driver trả về Buffer cho MaNV/MaDonVi, chuyển về String
    if (user.MaNV && typeof user.MaNV === 'object' && user.MaNV.type === 'Buffer') {
        user.MaNV = Buffer.from(user.MaNV.data).toString();
    }
    if (user.MaDonVi && typeof user.MaDonVi === 'object' && user.MaDonVi.type === 'Buffer') {
        user.MaDonVi = Buffer.from(user.MaDonVi.data).toString();
    }

    // Từ chối hoàn toàn các tài khoản bị khóa/vô hiệu hóa (TrangThai = -1).
    if (user.TrangThai === -1) {
        UserBlacklist.add(userID);
        return null;
    }

    // XỬ LÝ TRƯỜNG HỢP MAPPING BROKEN (Fail-safe):
    if (!user.MaNV) {
        if (user.RoleName && user.RoleName.trim() === 'db_Admin') {
            user.MaNV = 'SYSTEM_ADMIN';
            user.MaDonVi = 'ALL';
        } else {
            console.warn(`[authMiddleware] UserID ${userID} (${user.RoleName}) chưa được map với nhân sự. Gán UNASSIGNED.`);
            user.MaNV = 'UNASSIGNED';
            user.MaDonVi = 'UNASSIGNED';
        }
    }

    return user;
}

/**
 * authorize([...allowanceRoles])
 *
 * Express middleware factory thực thi xác thực (Authentication) và phân quyền RBAC tùy chọn.
 * Điền thông tin định danh vào req.user do server quyết định trước khi bất kỳ route handler nào chạy.
 *
 * @param {string[]} allowanceRoles - Các giá trị RoleName trong DB được phép truy cập route này.
 *                                    Mảng rỗng = cho phép bất kỳ người dùng nào đã xác thực.
 */
const authorize = (allowanceRoles = []) => {
    return async (req, res, next) => {

        // ── Bước 1: Trích xuất Bearer token ────────────────────────────────────
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Bạn chưa đăng nhập hoặc token không hợp lệ'
            });
        }

        // ── Bước 2: Xác minh JWT — trích xuất UserID ──────────────────────────────
        // Chấp nhận cả 'UserID' (định dạng mới) và 'userID' (định dạng chữ thường cũ)
        // để tương thích ngược trong quá trình chờ làm mới token.
        // Khi tất cả client đã đăng nhập lại, có thể xóa phần dự phòng 'decoded.userID'.
        let userID;
        let jti;
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Hỗ trợ cả hai định dạng payload của token cũ (userID) và mới (UserID).
            const resolvedID = decoded.UserID ?? decoded.userID;

            if (!resolvedID) {
                return res.status(401).json({
                    success: false,
                    message: 'Token không hợp lệ: thiếu UserID'
                });
            }
            userID = resolvedID;
            jti = decoded.jti;
        } catch (err) {
            return res.status(401).json({
                success: false,
                message: 'Token không hợp lệ hoặc đã hết hạn'
            });
        }

        // ── BƯỚC 2.5: Kiểm tra Blacklist (Khóa tài khoản tức thì) ────────────
        if (UserBlacklist.has(userID)) {
            return res.status(401).json({
                success: false,
                message: 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ Admin.',
                forceLogout: true // Cho Frontend biết để xóa localStorage ngay
            });
        }

        // Kiểm tra Token có bị thu hồi không (Đăng xuất)
        if (jti && TokenBlacklist.has(jti)) {
            return res.status(401).json({
                success: false,
                message: 'Phiên đăng nhập đã kết thúc. Vui lòng đăng nhập lại.',
                forceLogout: true
            });
        }

        // ── Bước 3: Phục hồi thông tin người dùng từ cơ sở dữ liệu (zero-trust) ───────────────
        try {
            const userFromDB = await fetchUserFromDB(userID);

            if (!userFromDB) {
                return res.status(401).json({
                    success: false,
                    message: 'Tài khoản không tồn tại hoặc đã bị khóa'
                });
            }

            // Xây dựng đối tượng req.user chính thức từ server.
            // FAIL-CLOSED: Validate MaDonVi
            // Bắt buộc phải có MaDonVi đối với người dùng không phải db_Admin
            if ((!userFromDB.MaDonVi || userFromDB.MaDonVi === 'ALL') && userFromDB.RoleName !== 'db_Admin') {
                return res.status(403).json({
                    success: false,
                    message: 'User không có MaDonVi hợp lệ'
                });
            }

            // Xây dựng đối tượng req.user chính thức từ server.
            // MaNV sử dụng giá trị dự phòng cho tài khoản admin/system không có bản ghi trong HR.NhanVien
            // Tuyệt đối không dùng 'ALL' cho MaDonVi vì sẽ làm sai logic RLS của DeptHead.
            req.user = {
                UserID: userFromDB.UserID,
                RoleName: userFromDB.RoleName ? userFromDB.RoleName.trim() : '',
                MaNV: (userFromDB.MaNV || '').trim(),
                MaDonVi: (userFromDB.MaDonVi || '').trim()
            };
        } catch (dbErr) {
            console.error('[authMiddleware] DB lookup failed:', dbErr);
            return res.status(500).json({
                success: false,
                message: 'Lỗi hệ thống khi xác thực người dùng'
            });
        }

        // ── Bước 4: Tùy chọn kiểm soát truy cập dựa trên vai trò (Role-based access control) ───────────────────────
        // Đây là chốt chặn ở mức độ thô (HTTP 403 trước khi gọi vào DB).
        // Việc lọc dữ liệu chi tiết ở mức dòng (row-level filtering) được thực thi bởi RLS của SQL Server.        
        if (allowanceRoles.length > 0 && !allowanceRoles.includes(req.user.RoleName)) {
            return res.status(403).json({
                success: false,
                message: 'Bạn không có quyền truy cập tài nguyên này'
            });
        }

        next();
    };
};

/**
 * Thu hồi token hiện tại (Đăng xuất khỏi thiết bị này)
 */
const revokeCurrentToken = (req) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            if (decoded.jti) {
                TokenBlacklist.add(decoded.jti);
            }
        } catch (err) {
            // Token không hợp lệ hoặc hết hạn thì bỏ qua
        }
    }
};

module.exports = {
    authorize,
    revokeCurrentToken
};