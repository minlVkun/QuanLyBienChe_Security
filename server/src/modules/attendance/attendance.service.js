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

            const record = await AttendanceModel.getTodayAttendance(reqUser, maNV, today, transaction);

            let action = "";
            if (!record) {
                await AttendanceModel.createCheckIn(reqUser, maNV, today, transaction);
                action = "check-in";
            } else if (record.GioVao && !record.GioRa) {
                await AttendanceModel.updateCheckOut(reqUser, maNV, today, record.ChamCongID, transaction);
                action = "check-out";
            } else {
                throw new Error("Bạn đã hoàn thành chấm công (vào & ra) cho ngày hôm nay.");
            }

            await transaction.commit();
            return { action };

        } catch (err) {
            if (transaction) await transaction.rollback();
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
     * Cập nhật thủ công (HR) + Ghi Audit Log
     */
    static async updateManual(reqUser, id, data) {
        const oldData = await AttendanceModel.getById(reqUser, id);
        if (!oldData) throw new Error("Không tìm thấy bản ghi chấm công");

        const pool = await poolPromise;
        const transaction = new sql.Transaction(pool);

        try {
            await transaction.begin(sql.ISOLATION_LEVEL.READ_COMMITTED);
            
            await AttendanceModel.updateManual(reqUser, id, data, transaction);
            
            const newData = await AttendanceModel.getById(reqUser, id);

            // Ghi Audit Log
            await AuditService.logAction(reqUser, {
                Action: 'UPDATE',
                TableName: 'HR.ChamCong',
                RecordID: id,
                OldData: JSON.stringify(oldData),
                NewData: JSON.stringify(newData),
                Description: `HR điều chỉnh thủ công giờ chấm công MaNV: ${oldData.MaNV}`
            }, transaction);

            await transaction.commit();
            return { success: true };
        } catch (err) {
            if (transaction) await transaction.rollback();
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
}

module.exports = AttendanceService;
