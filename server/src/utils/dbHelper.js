// src/utils/dbHelper.js
//
// BẢO MẬT (SECURITY): Tiêm SESSION_CONTEXT theo mô hình Hybrid Zero-Trust cho RLS SQL Server.
//
// ┌─────────────────────────────────────────────────────────────────────────┐
// │  Kiến trúc: Atomic Batch — SET CONTEXT + QUERY trong một lô duy nhất   │
// │                                                                         │
// │  Tầng hiệu năng (cờ/flags — tính một lần ở rlsMiddleware):             │
// │    BypassRLS (INT)   → Admin/HR bỏ qua so sánh MaNV từng dòng          │
// │    IsDeptHead (INT)  → DeptHead thấy toàn bộ dòng trong phòng ban      │
// │                                                                         │
// │  Tầng danh tính (identity):                                             │
// │    MaNV (VARCHAR)    → mỏ neo danh tính RLS của người gọi              │
// │    MaDonVi (VARCHAR) → phạm vi phòng ban của DeptHead                  │
// └─────────────────────────────────────────────────────────────────────────┘
//
// Tại sao Atomic Batch là cách duy nhất đúng với mssql Connection Pool:
//   - pool.request() không đảm bảo cùng connection object giữa các lần gọi.
//   - Nếu set SESSION_CONTEXT ở một request, query ở request khác (connection khác)
//     sẽ KHÔNG thấy context đó → dữ liệu sai, bảo mật thủng.
//   - Atomic Batch: EXEC sp_set_session_context... + query chạy trong CÙNG 1 batch
//     trên CÙNG 1 pool.request() object → SESSION_CONTEXT luôn đúng.
//   - @read_only = 0: cho phép ghi đè context ở đầu mỗi batch mới (bắt buộc với pool).
//
// Fail-Closed: Nếu req.rlsContext không tồn tại → ném lỗi ngay, không query.
// SQL Injection: Context values truyền qua request.input() — không nối chuỗi.

const { poolPromise, sql } = require('../config/db');

// Các role được phép bypass RLS (thấy toàn bộ dữ liệu).
// Dùng khi không có rlsMiddleware (e.g. internal calls).
const BYPASS_ROLES = new Set(['db_Admin', 'db_HR_Human', 'db_HR_Payroll']);
const DEPTHEAD_ROLE = 'db_DeptHead';

class DBHelper {
    /**
     * Thực thi câu truy vấn SQL được tham số hóa với SESSION_CONTEXT injection đầy đủ.
     *
     * Ưu tiên nguồn context theo thứ tự:
     *   1. req.rlsContext — đã tính sẵn bởi rlsMiddleware (khuyến nghị)
     *   2. reqUser        — tính toán inline nếu không có rlsContext (fallback)
     *
     * @param {Object}   reqUser     - req.user từ authMiddleware (PHẢI từ DB, không từ JWT)
     * @param {string}   queryString - SQL đã tham số hóa hoàn toàn
     * @param {Array}    inputs      - [{name, type, value}]
     * @param {Object}   [rlsCtx]   - req.rlsContext từ rlsMiddleware (tùy chọn nhưng khuyến nghị)
     * @param {Object}   [transaction] - SQL Transaction object nếu đang chạy trong giao dịch
     * @returns {Promise<import('mssql').IResult<any>>}
     */
    static async queryWithContext(reqUser, queryString, inputs = [], rlsCtx = null, transaction = null) {

        // ── 1. Resolve RLS context (reqUser.rlsContext nếu có, fallback tính inline) ────
        //
        // Ưu tiên 1: reqUser.rlsContext đã được rlsMiddleware gắn vào (một lần / request).
        // ƯU tiên 2: rlsCtx truyền trực tiếp vào hàm (dùng cho internal calls / tests).
        // Fallback:   tính toán inline từ reqUser (trường hợp không qua middleware).
        const resolvedCtx = (reqUser && reqUser.rlsContext) ? reqUser.rlsContext
            : rlsCtx ? rlsCtx
                : null;

        let maNV, maDonVi, bypassRLS, isDeptHead, roleName;

        if (resolvedCtx && typeof resolvedCtx.maNV === 'string' && resolvedCtx.maNV.trim()) {
            // Đường dẫn tối ưu: rlsMiddleware đã tính toán sẵn — dùng trực tiếp.
            maNV = resolvedCtx.maNV;
            maDonVi = resolvedCtx.maDonVi || '';
            bypassRLS = resolvedCtx.bypassRLS;
            isDeptHead = resolvedCtx.isDeptHead;
            roleName = resolvedCtx.roleName || '';

        } else {
            // Fallback: tính toán inline từ reqUser (dùng cho internal calls / tests).
            roleName = (reqUser && reqUser.RoleName) ? reqUser.RoleName.trim() : '';
            maNV = (reqUser && typeof reqUser.MaNV === 'string') ? reqUser.MaNV.trim() : 'ADMIN_SYSTEM';
            maDonVi = (reqUser && typeof reqUser.MaDonVi === 'string') ? reqUser.MaDonVi.trim() : '';
            bypassRLS = BYPASS_ROLES.has(roleName) ? 1 : 0;
            isDeptHead = (roleName === DEPTHEAD_ROLE) ? 1 : 0;
        }

        // ── 2. Fail-Closed: MaNV phải hợp lệ trước khi cho phép query ────────────
        // Đây là lớp bảo vệ thứ hai (sau rlsMiddleware).
        // Ngăn chặn trường hợp dbHelper bị gọi trực tiếp mà không qua middleware.
        if (!maNV || !maNV.trim()) {
            const err = new Error('[dbHelper] FAIL-CLOSED: MaNV không hợp lệ — truy cập DB bị chặn');
            err.statusCode = 403;
            throw err;
        }

        // ── 3. Lấy Request (Từ Transaction nếu có, hoặc từ Pool) ────────────────
        const pool = await poolPromise;
        const request = transaction ? new sql.Request(transaction) : pool.request();

        // ── 4. Bind tham số context (tiền tố _ctx_ tránh trùng với query params) ──
        request.input('_ctx_Bypass', sql.Int, bypassRLS);
        request.input('_ctx_IsDept', sql.Int, isDeptHead);
        request.input('_ctx_MaNV', sql.VarChar(20), maNV);
        request.input('_ctx_MaDonVi', sql.VarChar(20), maDonVi);
        request.input('_ctx_Role', sql.NVarChar(50), roleName);

        // ── 5. Bind tham số truy vấn do người gọi cung cấp ───────────────────────
        inputs.forEach(param => {
            request.input(param.name, param.type, param.value);
        });

        // ── 6. Xây dựng và thực thi Atomic Batch ──────────────────────────────────
        //
        // TÍNH NGUYÊN TỬ (ATOMICITY):
        //   sp_set_session_context + query chạy trong MỘT lô duy nhất.
        //   Không có request nào khác có thể chen ngang → context luôn khớp với query.
        //
        // @read_only = 0 (bắt buộc với Connection Pool):
        //   Cho phép ghi đè context ở đầu mỗi lô mới.
        //   Nếu dùng @read_only=1 và connection được tái sử dụng từ pool,
        //   SQL Server sẽ ném lỗi "context key already set as read-only".
        //
        // An toàn SQL Injection:
        //   Tất cả giá trị context đi qua request.input() (parameterized).
        //   queryString do caller cung cấp nhưng cũng phải dùng @params.
        const batch = `
            EXEC sp_set_session_context @key = N'BypassRLS',  @value = @_ctx_Bypass,  @read_only = 0;
            EXEC sp_set_session_context @key = N'IsDeptHead', @value = @_ctx_IsDept,  @read_only = 0;
            EXEC sp_set_session_context @key = N'MaNV',       @value = @_ctx_MaNV,    @read_only = 0;
            EXEC sp_set_session_context @key = N'MaDonVi',    @value = @_ctx_MaDonVi, @read_only = 0;
            EXEC sp_set_session_context @key = N'RoleName',   @value = @_ctx_Role,    @read_only = 0;

            ${queryString}
        `;

        return await request.query(batch);
    }
}

module.exports = DBHelper;