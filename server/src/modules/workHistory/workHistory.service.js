const WorkHistoryModel = require('./workHistory.model');
const EmployeeModel = require('../employee/employee.model');
const AuditService = require('../audit/audit.service');
const { createWorkHistorySchema, transferSchema, formatZodError } = require('./workHistory.validation');
const { poolPromise, sql } = require('../../config/db');

class WorkHistoryService {
    static async getWorkHistory(reqUser, maNV) {
        if (!maNV) {
            const err = new Error("Mã nhân viên là bắt buộc.");
            err.statusCode = 400; throw err;
        }

        const nhanVien = await EmployeeModel.getById(reqUser, maNV);
        if (!nhanVien) {
            const err = new Error("Nhân viên không tồn tại");
            err.statusCode = 400; throw err;
        }

        return await WorkHistoryModel.getByMaNV(reqUser, maNV);
    }

    /**
     * Nghiệp vụ Luân chuyển / Điều động nhân sự
     * 1. Kiểm tra tồn tại và lấy dữ liệu cũ
     * 2. Chốt lịch sử công tác hiện tại (DenNgay = NOW)
     * 3. Thêm lịch sử công tác mới
     * 4. Cập nhật MaDonVi mới trong NhanVien
     * 5. Ghi Audit Log
     */
    static async transfer(reqUser, transferData) {
        // ... (existing transfer logic remains same as it has its own audit implementation)
        // 1. Validation
        const validation = transferSchema.safeParse(transferData);
        if (!validation.success) {
            const err = new Error(formatZodError(validation.error));
            err.statusCode = 400; throw err;
        }
        const { targetMaNV, newMaDonVi, newMaChucVu, lyDo } = validation.data;

        const pool = await poolPromise;
        const transaction = new sql.Transaction(pool);

        try {
            // Khởi tạo Transaction
            await transaction.begin(sql.ISOLATION_LEVEL.READ_COMMITTED);

            // Bước 1: Lấy dữ liệu cũ để audit và validate (Sử dụng transaction để tránh deadlock)
            const oldUser = await EmployeeModel.getById(reqUser, targetMaNV, transaction);
            if (!oldUser) throw new Error("Nhân viên đích không tồn tại");

            const today = new Date();

            // Bước 2: Chốt lịch sử cũ
            await WorkHistoryModel.updateActiveHistory(transaction, reqUser, targetMaNV, today);

            // Bước 3: Thêm lịch sử mới
            await WorkHistoryModel.createWithTransaction(transaction, reqUser, {
                MaNV: targetMaNV,
                TuNgay: today,
                DenNgay: null,
                MaDonVi: newMaDonVi,
                MaChucVu: newMaChucVu,
                NoiDung: lyDo
            });

            // Bước 4: Cập nhật bảng NhanVien
            await EmployeeModel.updateInfoWithTransaction(transaction, reqUser, targetMaNV, {
                maDonVi: newMaDonVi
            });

            // Bước 5: Ghi Audit Log (Giả sử AuditModel có hỗ trợ transaction request)
            const auditQuery = `
                INSERT INTO [System].[Audit] (TableName, Action, OldData, NewData, ChangedBy, ChangedDate, RecordID)
                VALUES (@TableName, @Action, @OldData, @NewData, @ChangedBy, GETDATE(), @RecordID)
            `;
            const auditRequest = transaction.request();
            auditRequest.input('TableName', sql.NVarChar, 'HR.QuaTrinhCongTac');
            auditRequest.input('Action', sql.NVarChar, 'TRANSFER');
            auditRequest.input('OldData', sql.NVarChar, JSON.stringify({ MaDonVi: oldUser.MaDonVi, MaChucVu: oldUser.MaChucVu }));
            auditRequest.input('NewData', sql.NVarChar, JSON.stringify({ MaDonVi: newMaDonVi, MaChucVu: newMaChucVu, LyDo: lyDo }));
            auditRequest.input('ChangedBy', sql.VarChar, reqUser.MaNV || 'SYSTEM');
            auditRequest.input('RecordID', sql.NVarChar, targetMaNV);
            await auditRequest.query(auditQuery);

            // Hoàn tất
            await transaction.commit();
            return { success: true, message: "Điều động nhân sự thành công" };

        } catch (error) {
            if (transaction) await transaction.rollback();
            console.error("[Service Error - WorkHistory.transfer]:", error);
            throw error;
        }
    }

    static async create(reqUser, data) {
        const validationResult = createWorkHistorySchema.safeParse(data);
        if (!validationResult.success) {
            const err = new Error(formatZodError(validationResult.error));
            err.statusCode = 400; throw err;
        }

        const validData = validationResult.data;

        const nhanVien = await EmployeeModel.getById(reqUser, validData.MaNV);
        if (!nhanVien) {
            const err = new Error("Nhân viên không tồn tại");
            err.statusCode = 400; throw err;
        }

        const result = await WorkHistoryModel.create(reqUser, validData);

        await AuditService.logAction(reqUser, {
            TableName: 'HR.QuaTrinhCongTac',
            Action: 'INSERT',
            RecordID: validData.MaNV,
            NewData: validData
        });

        return result;
    }
}

module.exports = WorkHistoryService;
