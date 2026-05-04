const DepartmentModel = require('./department.model');
const AuditService = require('../audit/audit.service');

class DepartmentService {
    static async getOrgChart(reqUser) {
        return await DepartmentModel.getOrgChart(reqUser);
    }

    static async getDeptHead(reqUser, maDonVi) {
        const dept = await DepartmentModel.getById(reqUser, maDonVi);
        if (!dept) {
            const err = new Error("Đơn vị không tồn tại.");
            err.statusCode = 404; throw err;
        }
        return {
            MaDonVi: dept.MaDonVi,
            MaTruongPhong: dept.MaTruongPhong
        };
    }

    static async changeDeptHead(reqUser, maDonVi, maTruongPhong) {
        if (!maDonVi) {
            const err = new Error("Mã đơn vị là bắt buộc.");
            err.statusCode = 400; throw err;
        }

        const existing = await DepartmentModel.getById(reqUser, maDonVi);
        if (!existing) {
            const err = new Error("Đơn vị không tồn tại.");
            err.statusCode = 404; throw err;
        }

        const affected = await DepartmentModel.updateDeptHead(reqUser, maDonVi, maTruongPhong);
        
        if (affected === 0) {
            const err = new Error("Không tìm thấy đơn vị hoặc bạn không có quyền.");
            err.statusCode = 404; throw err;
        }

        await AuditService.logAction(reqUser, {
            TableName: 'HR.DonVi',
            Action: 'UPDATE_HEAD',
            RecordID: maDonVi,
            OldData: existing,
            NewData: { MaTruongPhong: maTruongPhong }
        });

        return { message: "Cập nhật trưởng phòng thành công." };
    }

    static async create(reqUser, data) {
        if (!data.maDonVi || !data.tenDonVi) {
            const err = new Error("Thiếu thông tin bắt buộc (Mã, Tên).");
            err.statusCode = 400; throw err;
        }
        const result = await DepartmentModel.create(reqUser, data);

        await AuditService.logAction(reqUser, {
            TableName: 'HR.DonVi',
            Action: 'INSERT',
            RecordID: data.maDonVi,
            NewData: data
        });

        return result;
    }

    static async update(reqUser, id, data) {
        if (!id) throw new Error("Thiếu ID đơn vị.");
        
        const existing = await DepartmentModel.getById(reqUser, id);
        if (!existing) {
            const err = new Error("Đơn vị không tồn tại.");
            err.statusCode = 404; throw err;
        }

        const result = await DepartmentModel.update(reqUser, id, data);

        await AuditService.logAction(reqUser, {
            TableName: 'HR.DonVi',
            Action: 'UPDATE',
            RecordID: id,
            OldData: existing,
            NewData: data
        });

        return result;
    }

    static async delete(reqUser, id) {
        if (!id) throw new Error("Thiếu ID đơn vị.");
        
        const existing = await DepartmentModel.getById(reqUser, id);
        if (!existing) {
            const err = new Error("Đơn vị không tồn tại.");
            err.statusCode = 404; throw err;
        }

        const result = await DepartmentModel.delete(reqUser, id);

        await AuditService.logAction(reqUser, {
            TableName: 'HR.DonVi',
            Action: 'DELETE',
            RecordID: id,
            OldData: existing
        });

        return result;
    }
}

module.exports = DepartmentService;