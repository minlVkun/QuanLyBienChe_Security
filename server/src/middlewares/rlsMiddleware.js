// src/middlewares/rlsMiddleware.js
//
// BẢO MẬT (SECURITY): Middleware tính toán và gắn RLS context vào request.
//
// Vai trò trong chuỗi middleware:
//   authMiddleware (xác thực + nạp req.user từ DB)
//       ↓
//   rlsMiddleware (tính toán RLS flags từ req.user → gắn req.rlsContext)
//       ↓
//   controller → service → model → dbHelper.queryWithContext(req.user, req.rlsContext)
//
// Tại sao KHÔNG set SESSION_CONTEXT tại đây mà chỉ tính toán flags:
//   - mssql Connection Pool: mỗi pool.request() có thể được cấp phát
//     từ BẤT KỲ connection nào trong pool. Nếu set SESSION_CONTEXT ở đây
//     (trên request A), câu query sau đó (trên request B — connection khác)
//     sẽ KHÔNG nhìn thấy context đó.
//   - Giải pháp đúng: SESSION_CONTEXT + query phải chạy trong cùng 1 batch
//     trên cùng 1 pool.request() object (Atomic Batch Pattern).
//   - rlsMiddleware chỉ tính toán flags một lần, dbHelper sẽ inject vào batch.
//
// Fail-Closed:
//   - Nếu req.user không hợp lệ → 403 ngay tại đây.
//   - dbHelper.queryWithContext() kiểm tra req.rlsContext tồn tại trước khi query.

const BYPASS_ROLES  = new Set(['db_Admin', 'db_HR_Human', 'db_HR_Payroll']);
const DEPTHEAD_ROLE = 'db_DeptHead';

/**
 * Tính toán các cờ RLS (bypassRLS, isDeptHead) từ req.user
 * và gắn kết quả vào req.rlsContext để dbHelper sử dụng.
 *
 * PHẢI được đặt SAU authMiddleware trong chuỗi middleware.
 *
 * req.rlsContext = {
 *   maNV      : string  — mã nhân viên (nguồn sự thật từ DB)
 *   maDonVi   : string  — phòng ban (nguồn sự thật từ DB)
 *   roleName  : string  — tên role (nguồn sự thật từ DB)
 *   bypassRLS : 0 | 1   — 1 nếu Admin/HR
 *   isDeptHead: 0 | 1   — 1 nếu DeptHead
 * }
 */
const rlsMiddleware = (req, res, next) => {
    try {
        // ── Bước 1: Kiểm tra req.user đã được authMiddleware nạp vào chưa ──
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Chưa xác thực — rlsMiddleware phải đặt sau authMiddleware'
            });
        }

        const { RoleName, MaNV, MaDonVi } = req.user;

        // ── Bước 2: Validate MaNV — FAIL-CLOSED ──────────────────────────────
        // MaNV là mỏ neo danh tính (identity anchor) của RLS predicate.
        // Nếu MaNV không hợp lệ → không thể xác định danh tính → chặn hoàn toàn.
        // Trường hợp ngoại lệ hợp lệ: Admin không có record trong HR.NhanVien
        // sẽ có MaNV = 'ADMIN_SYSTEM' (được authMiddleware gán) — vẫn hợp lệ.
        const maNV = (typeof MaNV === 'string') ? MaNV.trim() : '';
        if (!maNV) {
            return res.status(403).json({
                success: false,
                message: 'Không thể xác định danh tính người dùng — truy cập bị từ chối'
            });
        }

        // ── Bước 3: Chuẩn hóa các trường từ req.user ─────────────────────────
        const roleName = (typeof RoleName === 'string') ? RoleName.trim() : '';
        const maDonVi  = (typeof MaDonVi  === 'string') ? MaDonVi.trim() : '';

        // ── Bước 4: Tính toán cờ RLS từ role (KHÔNG tin client) ──────────────
        // Cờ được tính từ req.user — nguồn sự thật do authMiddleware nạp từ DB.
        // Tuyệt đối không lấy bypassRLS / isDeptHead từ req.body hay req.headers.
        let bypassRLS  = 0;
        let isDeptHead = 0;

        if (BYPASS_ROLES.has(roleName)) {
            bypassRLS = 1;          // Admin/HR — bỏ qua RLS, thấy toàn bộ
        } else if (roleName === DEPTHEAD_ROLE) {
            isDeptHead = 1;         // Trưởng phòng — chỉ thấy nhân viên phòng mình
        }
        // Mặc định (db_Employee): cả hai = 0 → chỉ thấy dòng có MaNV của mình.

        // Mặc định (db_Employee): cả hai = 0 → chỉ thấy dòng có MaNV của mình.

        // ── Bước 5: Đính kèm context đã tính toán vào req.user ─────────────────────────
        // Gắn vào req.user.rlsContext (không phải req.rlsContext tực tiếp) để:
        //   - req.user được truyền từ controller → service → model → dbHelper
        //   - dbHelper đọc reqUser.rlsContext mà KHÔNG cần sửa bất kỳ tầng nào.
        //   - Không cần sửa controller, service, hay model.
        req.user.rlsContext = {
            maNV,
            maDonVi,
            roleName,
            bypassRLS,
            isDeptHead
        };
        next();

    } catch (err) {
        // Fail-Closed: bất kỳ lỗi nào trong middleware → chặn request ngay.
        console.error('[rlsMiddleware] Lỗi không mong đợi:', err);
        return res.status(500).json({
            success: false,
            message: 'Lỗi hệ thống khi chuẩn bị ngữ cảnh bảo mật'
        });
    }
};

module.exports = { rlsMiddleware };
