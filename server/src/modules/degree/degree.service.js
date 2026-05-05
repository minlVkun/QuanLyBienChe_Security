const DegreeModel = require('./degree.model');
const AuditService = require('../audit/audit.service');
const { createDegreeSchema, updateDegreeSchema, formatZodError } = require('./degree.validation');

class DegreeService {
    static async getByMaNV(reqUser, maNV) {
        if (!maNV) {
            const err = new Error("Mã nhân viên là bắt buộc.");
            err.statusCode = 400; throw err;
        }
        return await DegreeModel.getByMaNV(reqUser, maNV);
    }

    static async create(reqUser, data) {
        const validationResult = createDegreeSchema.safeParse(data);
        if (!validationResult.success) {
            const err = new Error(formatZodError(validationResult.error));
            err.statusCode = 400; throw err;
        }

        const affectedRows = await DegreeModel.create(reqUser, validationResult.data);
        if (affectedRows === 0) {
            const err = new Error("Thêm bằng cấp thất bại hoặc bạn không có quyền thực hiện thao tác này.");
            err.statusCode = 403; throw err;
        }

        await AuditService.logAction(reqUser, {
            TableName: 'HR.BangCap',
            Action: 'INSERT',
            RecordID: data.MaNV, // Using MaNV as RecordID for degree records
            NewData: validationResult.data
        });

        return { message: "Thêm bằng cấp thành công" };
    }

    static async update(reqUser, idBang, data) {
        if (!idBang) {
            const err = new Error("ID bằng cấp là bắt buộc.");
            err.statusCode = 400; throw err;
        }

        const validationResult = updateDegreeSchema.safeParse(data);
        if (!validationResult.success) {
            const err = new Error(formatZodError(validationResult.error));
            err.statusCode = 400; throw err;
        }

        const existing = await DegreeModel.getById(reqUser, idBang);
        if (!existing) {
            const err = new Error("Bằng cấp không tồn tại hoặc bạn không có quyền thực hiện thao tác này.");
            err.statusCode = 404; throw err;
        }

        // Merge existing data with new data for the update
        const updateData = {
            LoaiBang: data.LoaiBang || existing.LoaiBang,
            ChuyenNganh: data.ChuyenNganh || existing.ChuyenNganh,
            NoiDaoTao: data.NoiDaoTao || existing.NoiDaoTao,
            NamTotNghiep: data.NamTotNghiep || existing.NamTotNghiep
        };

        const affectedRows = await DegreeModel.update(reqUser, idBang, updateData);
        if (affectedRows === 0) {
            const err = new Error("Cập nhật bằng cấp thất bại.");
            err.statusCode = 500; throw err;
        }

        await AuditService.logAction(reqUser, {
            TableName: 'HR.BangCap',
            Action: 'UPDATE',
            RecordID: idBang,
            OldData: existing,
            NewData: updateData
        });

        return { message: "Cập nhật bằng cấp thành công" };
    }

    static async delete(reqUser, idBang) {
        if (!idBang) {
            const err = new Error("ID bằng cấp là bắt buộc.");
            err.statusCode = 400; throw err;
        }

        const existing = await DegreeModel.getById(reqUser, idBang);
        if (!existing) {
            const err = new Error("Bằng cấp không tồn tại hoặc bạn không có quyền thực hiện thao tác này.");
            err.statusCode = 404; throw err;
        }

        const affectedRows = await DegreeModel.delete(reqUser, idBang);
        if (affectedRows === 0) {
            const err = new Error("Xóa bằng cấp thất bại.");
            err.statusCode = 500; throw err;
        }

        await AuditService.logAction(reqUser, {
            TableName: 'HR.BangCap',
            Action: 'DELETE',
            RecordID: idBang,
            OldData: existing
        });

        return { message: "Xóa bằng cấp thành công" };
    }
}

module.exports = DegreeService;
