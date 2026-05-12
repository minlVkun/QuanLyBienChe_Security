const { poolPromise, sql } = require('../../config/db');
const AttendanceModel = require('./attendance.model');
const AuditService = require('../audit/audit.service');
const XLSX = require('xlsx');

class AttendanceService {
    /**
     * Thực hiện Check-in / Check-out tự động
     */
    static async processCheckInOut(reqUser) {
        const maNV = reqUser?.MaNV;
        if (!maNV) {
            const err = new Error("FAIL-CLOSED: Không tìm thấy thông tin định danh nhân viên.");
            err.statusCode = 403; throw err;
        }

        const pool = await poolPromise;
        const transaction = new sql.Transaction(pool);
        const today = new Date().toISOString().split('T')[0];

        try {
            await transaction.begin(sql.ISOLATION_LEVEL.READ_COMMITTED);
            
            // 1. Tự động đóng các phiên quên check-out từ những ngày trước
            const openSessions = await AttendanceModel.getOpenSessions(reqUser, maNV, today, transaction);
            for (const session of openSessions) {
                console.log(`[Attendance] Tự động đóng phiên quên checkout cho MaNV ${maNV} ngày ${session.NgayChamCong}`);
                await AttendanceModel.autoCloseSession(reqUser, session.ChamCongID, transaction);
            }

            // 2. Lấy phiên chấm công mới nhất của hôm nay
            const record = await AttendanceModel.getTodayAttendance(reqUser, maNV, today, transaction);
            console.log(`[Attendance] Trạng thái hôm nay (${today}) của NV ${maNV}:`, record ? `Đã có (ID: ${record.ChamCongID}, Vào: ${record.GioVao}, Ra: ${record.GioRa})` : "Chưa có bản ghi");

            // TÍCH HỢP SCHEDULE: Kiểm tra lịch làm việc hôm nay
            const checkQuery = `SELECT 1 FROM [HR].[LichLamViec] WHERE MaNV = @MaNV AND Ngay = @NgayLam`;
            const checkRes = await DBHelper.queryWithContext(reqUser, checkQuery, [
                { name: 'MaNV', type: sql.VarChar, value: maNV },
                { name: 'NgayLam', type: sql.Date, value: today }
            ], null, transaction);
            const hasSchedule = checkRes.recordset.length > 0;

            let action = "";
            // Nếu chưa có bản ghi hôm nay HOẶC bản ghi mới nhất đã hoàn tất (đã có GioRa) -> Tạo bản ghi mới (Check-in)
            if (!record || record.GioRa) {
                if (!hasSchedule) {
                    const err = new Error("Bạn không có lịch làm việc trong ngày hôm nay. Vui lòng liên hệ HR hoặc đăng ký OT.");
                    err.statusCode = 403; throw err;
                }
                console.log(`[Attendance] Thực hiện CREATE NEW Check-in cho MaNV ${maNV}`);
                await AttendanceModel.createCheckIn(reqUser, maNV, today, transaction);
                action = "check-in";
            } 
            // Nếu có bản ghi hôm nay và chưa có GioRa -> Cập nhật GioRa (Check-out)
            else if (record.GioVao && !record.GioRa) {
                console.log(`[Attendance] Thực hiện UPDATE Check-out cho ID ${record.ChamCongID}`);
                await AttendanceModel.updateCheckOut(reqUser, maNV, today, record.ChamCongID, transaction);
                action = "check-out";
            }

            await transaction.commit();
            console.log(`[Attendance] Giao dịch thành công: ${action.toUpperCase()}`);

            // Ghi Audit Log sau khi commit (không làm rollback luồng chính)
            await AuditService.logAction(reqUser, {
                TableName: 'HR.ChamCong',
                Action: action === 'check-in' ? 'INSERT' : 'UPDATE', // FIX: ActionType -> Action
                RecordID: maNV,
                Description: `NV ${maNV} thực hiện ${action.toUpperCase()} lúc ${new Date().toISOString()}`
            }).catch(auditErr => {
                console.warn('[AttendanceService] Audit log thất bại (non-critical):', auditErr.message);
            });

            return { action };

        } catch (err) {
            if (transaction) await transaction.rollback();
            console.error(`[Attendance Error] Thao tác thất bại:`, err.message);
            if (err.message.toLowerCase().includes('duplicate key')) {
                console.error(">>> NGUYÊN NHÂN: Bạn chưa xóa ràng buộc UNIQUE [UQ_ChamCong_MaNV_Ngay] trong Database!");
            }
            throw err;
        }
    }

    /**
     * Lấy lịch sử chấm công (Có bảo mật RBAC)
     */
    static async getHistory(reqUser, maNV, fromDate, toDate) {
        // SECURITY: Chỉ Admin/HR mới được xem người khác. Nhân viên thường chỉ xem mình.
        const isAdminOrHR = ['db_Admin', 'db_HR_Human', 'db_HR_Payroll'].includes(reqUser.role);
        
        if (!isAdminOrHR && reqUser.MaNV !== maNV) {
            const err = new Error("BẠN KHÔNG CÓ QUYỀN XEM LỊCH SỬ CHẤM CÔNG CỦA NGƯỜI KHÁC");
            err.statusCode = 403; throw err;
        }

        const now = new Date();
        const start = fromDate || new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        const end = toDate || new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

        return await AttendanceModel.getAttendanceHistory(reqUser, maNV, start, end);
    }

    /**
     * Lấy toàn bộ danh sách (Admin)
     */
    static async getAll(reqUser, filters) {
        return await AttendanceModel.getAll(reqUser, filters);
    }

    /**
     * Cập nhật thủ công (HR) + Ghi Audit Log (Đảm bảo ATOMICITY & NO RACE CONDITION)
     */
    static async updateManual(reqUser, id, data) {
        // SECURITY: Chỉ HR/Admin mới được sửa
        const isAdminOrHR = ['db_Admin', 'db_HR_Human', 'db_HR_Payroll'].includes(reqUser.role);
        if (!isAdminOrHR) {
            const err = new Error("Bạn không có quyền điều chỉnh giờ công thủ công");
            err.statusCode = 403; throw err;
        }

        const pool = await poolPromise;
        const transaction = new sql.Transaction(pool);

        try {
            await transaction.begin(sql.ISOLATION_LEVEL.READ_COMMITTED);
            
            // 1. Lấy dữ liệu cũ TRONG transaction (Sử dụng UPDLOCK ngầm định bởi Isolation Level hoặc logic SELECT)
            // Ta gọi getById với transaction để khóa bản ghi này lại
            const oldData = await AttendanceModel.getById(reqUser, id, transaction);
            if (!oldData) {
                const err = new Error("Không tìm thấy bản ghi chấm công");
                err.statusCode = 404; throw err;
            }

            // 2. Thực hiện cập nhật
            await AttendanceModel.updateManual(reqUser, id, data, transaction);
            
            // 3. Lấy newData TRONG cùng transaction để đảm bảo tính nhất quán của Audit Log
            const newData = await AttendanceModel.getById(reqUser, id, transaction);

            // 4. Ghi Audit Log TRONG cùng transaction. 
            // Nếu log thất bại, toàn bộ quá trình UPDATE sẽ bị ROLLBACK.
            await AuditService.logAction(reqUser, {
                Action: 'UPDATE_MANUAL',
                TableName: 'HR.ChamCong',
                RecordID: String(id),
                OldData: oldData,
                NewData: newData,
                Description: `HR điều chỉnh thủ công giờ chấm công MaNV: ${oldData.MaNV}`
            }, transaction);

            await transaction.commit();
            return { success: true, message: 'Cập nhật thành công', data: newData };

        } catch (err) {
            if (transaction) {
                try { await transaction.rollback(); } catch (rbErr) { /* ignore rollback error */ }
            }
            console.error('[AttendanceService - updateManual] Critical Transaction Error:', err);
            throw err;
        }
    }

    /**
     * Xuất file Excel
     */
    static async exportToBuffer(reqUser, filters) {
        const data = await AttendanceModel.getAll(reqUser, filters);
        
        // Chuyển đổi dữ liệu cho Excel
        const rows = data.map(item => ({
            'Mã NV': item.MaNV,
            'Họ Tên': item.HoTen,
            'Đơn Vị': item.TenDonVi,
            'Ngày': item.NgayChamCong ? new Date(item.NgayChamCong).toLocaleDateString('vi-VN') : '',
            'Giờ Vào': item.GioVao ? new Date(item.GioVao).toLocaleTimeString('vi-VN') : '',
            'Giờ Ra': item.GioRa ? new Date(item.GioRa).toLocaleTimeString('vi-VN') : '',
            'Phút Trễ': item.SoPhutDiTre,
            'Phút Sớm': item.SoPhutVeSom,
            'Trạng Thái': item.TrangThai
        }));

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(rows);
        XLSX.utils.book_append_sheet(wb, ws, "ChamCong");
        
        return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    }

    /**
     * Chạy job đánh dấu vắng mặt
     */
    static async markAbsencesForScheduled(reqUser, dateString) {
        // Chỉ HR/Admin mới được chạy job thủ công
        const isAdminOrHR = ['db_Admin', 'db_HR_Human', 'db_HR_Payroll'].includes(reqUser.role);
        if (!isAdminOrHR) {
            const err = new Error("Bạn không có quyền thực hiện chức năng này.");
            err.statusCode = 403; throw err;
        }

        const date = dateString || new Date().toISOString().split('T')[0];
        
        const pool = await poolPromise;
        const transaction = new sql.Transaction(pool);
        try {
            await transaction.begin();
            
            const count = await AttendanceModel.markAbsencesForScheduled(reqUser, date, transaction);
            
            await AuditService.logAction(reqUser, {
                TableName: 'HR.ChamCong',
                Action: 'BATCH_INSERT',
                RecordID: `Batch_${date}`,
                Description: `Đã đánh dấu vắng mặt cho ${count} nhân viên ngày ${date}`
            }, transaction);

            await transaction.commit();
            return { message: `Đã đánh dấu vắng mặt cho ${count} nhân viên ngày ${date}`, count };
        } catch (err) {
            if (transaction) {
                try { await transaction.rollback(); } catch (rbErr) { /* ignore */ }
            }
            throw err;
        }
    }
}

module.exports = AttendanceService;
