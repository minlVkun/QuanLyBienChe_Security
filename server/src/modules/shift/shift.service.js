const ShiftModel = require('./shift.model');
const AuditService = require('../audit/audit.service');
const { shiftSchema, formatZodError } = require('./shift.validation');

class ShiftService {
    static async getAll(reqUser, filters = {}) {
        return await ShiftModel.getAll(reqUser, filters);
    }

    static async getById(reqUser, maCa) {
        return await ShiftModel.getById(reqUser, maCa);
    }

    static async create(reqUser, data) {
        // Validate input
        const validation = shiftSchema.safeParse(data);
        if (!validation.success) {
            const err = new Error(formatZodError(validation.error));
            err.statusCode = 400;
            throw err;
        }

        await ShiftModel.create(reqUser, data);
        
        await AuditService.logAction(reqUser, {
            TableName: 'HR.CaLamViec',
            ActionType: 'INSERT',
            RecordID: data.maCa,
            NewData: data,
            Description: `Thêm ca làm việc mới: ${data.tenCa}`
        });
    }

    static async update(reqUser, maCa, data) {
        const oldData = await ShiftModel.getById(reqUser, maCa);
        if (!oldData) {
            const err = new Error("Không tìm thấy ca làm việc");
            err.statusCode = 404;
            throw err;
        }

        // Merge dữ liệu mới vào dữ liệu cũ để validate toàn bộ logic (đặc biệt là gioBatDau < gioKetThuc)
        const mergedData = { 
            ...oldData, 
            ...data,
            // Chuyển đổi Date object từ DB sang string HH:mm:ss nếu cần
            gioBatDau: data.gioBatDau || (oldData.GioBatDau ? new Date(oldData.GioBatDau).toISOString().split('T')[1].substring(0, 8) : null),
            gioKetThuc: data.gioKetThuc || (oldData.GioKetThuc ? new Date(oldData.GioKetThuc).toISOString().split('T')[1].substring(0, 8) : null)
        };

        const validation = shiftSchema.safeParse(mergedData);
        if (!validation.success) {
            const err = new Error(formatZodError(validation.error));
            err.statusCode = 400;
            throw err;
        }

        await ShiftModel.update(reqUser, maCa, data);

        await AuditService.logAction(reqUser, {
            TableName: 'HR.CaLamViec',
            ActionType: 'UPDATE',
            RecordID: maCa,
            OldData: oldData,
            NewData: { ...oldData, ...data },
            Description: `Cập nhật ca làm việc: ${maCa}`
        });
    }

    static async delete(reqUser, maCa) {
        const oldData = await ShiftModel.getById(reqUser, maCa);
        if (!oldData) {
            const err = new Error("Không tìm thấy ca làm việc");
            err.statusCode = 404;
            throw err;
        }

        await ShiftModel.delete(reqUser, maCa);

        await AuditService.logAction(reqUser, {
            TableName: 'HR.CaLamViec',
            ActionType: 'DELETE',
            RecordID: maCa,
            OldData: oldData,
            Description: `Xóa ca làm việc: ${maCa}`
        });
    }
}

module.exports = ShiftService;
