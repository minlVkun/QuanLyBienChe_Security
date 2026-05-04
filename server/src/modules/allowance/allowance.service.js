const AllowanceModel = require('./allowance.model');
const AuditService = require('../audit/audit.service');

class AllowanceService {
    static async getByEmployeeId(reqUser, maNV) {
        return await AllowanceModel.getByEmployeeId(reqUser, maNV);
    }

    static async create(reqUser, maNV, data) {
        if (!data.TenPhuCap || data.SoTien < 0) {
            const err = new Error("Dữ liệu không hợp lệ!");
            err.statusCode = 400; throw err;
        }

        const isDuplicate = await AllowanceModel.checkDuplicate(reqUser, maNV, data.TenPhuCap);
        if (isDuplicate) {
            const err = new Error("Tên phụ cấp này đã tồn tại cho nhân viên này!");
            err.statusCode = 400; throw err;
        }

        await AllowanceModel.create(reqUser, { ...data, MaNV: maNV });
        
        await AuditService.logAction(reqUser, {
            TableName: 'HR.PhuCapCoDinh',
            Action: 'INSERT',
            RecordID: maNV,
            NewData: data
        });

        return { success: true, message: "Thêm phụ cấp cố định thành công!" };
    }

    static async update(reqUser, id, data) {
        if (!data.TenPhuCap || data.SoTien < 0) {
            const err = new Error("Dữ liệu không hợp lệ!");
            err.statusCode = 400; throw err;
        }

        const existing = await AllowanceModel.getById(reqUser, id);
        if (!existing) {
            const err = new Error("Không tìm thấy phụ cấp để cập nhật.");
            err.statusCode = 404; throw err;
        }

        // FIX: Check duplicate when update
        const isDuplicate = await AllowanceModel.checkDuplicate(reqUser, data.MaNV, data.TenPhuCap, id);
        if (isDuplicate) {
            const err = new Error("Tên phụ cấp này đã tồn tại cho nhân viên này!");
            err.statusCode = 400; throw err;
        }
        
        await AllowanceModel.update(reqUser, id, data);

        await AuditService.logAction(reqUser, {
            TableName: 'HR.PhuCapCoDinh',
            Action: 'UPDATE',
            RecordID: id,
            OldData: existing,
            NewData: data
        });

        return { success: true, message: "Cập nhật phụ cấp thành công!" };
    }

    static async delete(reqUser, id) {
        const existing = await AllowanceModel.getById(reqUser, id);
        if (!existing) {
            const err = new Error("Không tìm thấy phụ cấp để xóa.");
            err.statusCode = 404; throw err;
        }

        await AllowanceModel.delete(reqUser, id);

        await AuditService.logAction(reqUser, {
            TableName: 'HR.PhuCapCoDinh',
            Action: 'DELETE',
            RecordID: id,
            OldData: existing
        });

        return { success: true, message: "Đã xóa phụ cấp cố định!" };
    }
}

module.exports = AllowanceService;
