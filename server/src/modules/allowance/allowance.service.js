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
            Description: `Thêm phụ cấp ${data.TenPhuCap} cho NV ${maNV}`,
            NewData: JSON.stringify(data)
        });

        return { success: true, message: "Thêm phụ cấp cố định thành công!" };
    }

    static async update(reqUser, id, data) {
        if (!data.TenPhuCap || data.SoTien < 0) {
            const err = new Error("Dữ liệu không hợp lệ!");
            err.statusCode = 400; throw err;
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
            Description: `Cập nhật phụ cấp ID ${id}`,
            NewData: JSON.stringify(data)
        });

        return { success: true, message: "Cập nhật phụ cấp thành công!" };
    }

    static async delete(reqUser, id) {
        await AllowanceModel.delete(reqUser, id);

        await AuditService.logAction(reqUser, {
            TableName: 'HR.PhuCapCoDinh',
            Action: 'DELETE',
            Description: `Xóa phụ cấp ID ${id}`
        });

        return { success: true, message: "Đã xóa phụ cấp cố định!" };
    }
}

module.exports = AllowanceService;
