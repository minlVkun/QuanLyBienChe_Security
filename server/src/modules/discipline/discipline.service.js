const DisciplineModel = require('./discipline.model');
const AuditService = require('../audit/audit.service');
const { disciplineSchema, formatZodError } = require('./discipline.validation');

class DisciplineService {
    static async getDisciplineByMaNV(reqUser, maNV) {
        if (!maNV || typeof maNV !== 'string' || maNV.trim() === '') {
            const err = new Error("Mã nhân viên (MaNV) không hợp lệ hoặc bị trống.");
            err.statusCode = 400;
            throw err;
        }
        
        return await DisciplineModel.getByMaNV(reqUser, maNV);
    }

    static async createDiscipline(reqUser, rawData) {
        const validationResult = disciplineSchema.safeParse(rawData);
        if (!validationResult.success) {
            const err = new Error(formatZodError(validationResult.error));
            err.statusCode = 400;
            throw err;
        }

        const cleanData = validationResult.data;

        try {
            const rowsAffected = await DisciplineModel.create(reqUser, cleanData);
            
            if (rowsAffected === 0) {
                const err = new Error("Không thể thêm mới bản ghi. Vui lòng kiểm tra lại dữ liệu hợp lệ.");
                err.statusCode = 400;
                throw err;
            }

            await AuditService.logAction(reqUser, {
                TableName: 'HR.KhenThuongKyLuat',
                Action: 'INSERT',
                RecordID: cleanData.MaNV,
                NewData: cleanData
            });
            
            return rowsAffected;
        } catch (error) {
            if (error.message && error.message.includes('Violation of UNIQUE KEY constraint')) {
                const err = new Error("Số quyết định này đã tồn tại trong hệ thống.");
                err.statusCode = 409;
                throw err;
            }
            console.error("[Service Error - createDiscipline]:", error.message);
            const err = new Error("Lỗi hệ thống khi thêm mới dữ liệu khen thưởng/kỷ luật.");
            err.statusCode = 500;
            throw err;
        }
    }

    static async deleteDiscipline(reqUser, id) {
        if (!id) {
            const err = new Error("ID quyết định là bắt buộc.");
            err.statusCode = 400;
            throw err;
        }

        try {
            const existing = await DisciplineModel.getById(reqUser, id);
            
            const rowsAffected = await DisciplineModel.delete(reqUser, id);
            
            if (rowsAffected === 0) {
                const err = new Error("Không tìm thấy bản ghi hoặc bạn không có quyền xóa.");
                err.statusCode = 404;
                throw err;
            }

            await AuditService.logAction(reqUser, {
                TableName: 'HR.KhenThuongKyLuat',
                Action: 'DELETE',
                RecordID: id,
                OldData: existing
            });
            
            return rowsAffected;
        } catch (error) {
            console.error("[Service Error - deleteDiscipline]:", error.message);
            if (error.statusCode) throw error;
            const err = new Error("Lỗi hệ thống khi xóa dữ liệu khen thưởng/kỷ luật.");
            err.statusCode = 500;
            throw err;
        }
    }
}

module.exports = DisciplineService;