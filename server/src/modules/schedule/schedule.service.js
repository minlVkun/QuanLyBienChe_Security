// src/modules/schedule/schedule.service.js
const { poolPromise, sql } = require('../../config/db');
const ScheduleModel = require('./schedule.model');
const AuditService = require('../audit/audit.service');
const {
    scheduleSchema,
    bulkAssignSchema,
    updateScheduleSchema,
    formatZodError
} = require('./schedule.validation');

class ScheduleService {
    /**
     * Lấy danh sách lịch làm việc (có phân trang)
     */
    static async getAll(reqUser, filters = {}) {
        const rows = await ScheduleModel.getAll(reqUser, filters);
        const total = rows.length > 0 ? rows[0].TotalRows : 0;
        const page  = parseInt(filters.page  || 1, 10);
        const limit = parseInt(filters.limit || 50, 10);
        return {
            data: rows.map(({ TotalRows, ...r }) => r),
            pagination: { total, page, limit, totalPages: Math.ceil(total / limit) }
        };
    }

    /**
     * Lấy chi tiết 1 lịch
     */
    static async getById(reqUser, id) {
        const record = await ScheduleModel.getById(reqUser, id);
        if (!record) {
            const err = new Error('Không tìm thấy lịch làm việc.');
            err.statusCode = 404; throw err;
        }
        return record;
    }

    /**
     * Tạo 1 lịch làm việc (phân ca đơn)
     * Luồng: Validate → Kiểm tra trùng → Transaction (Insert + AuditLog)
     */
    static async create(reqUser, rawData) {
        const v = scheduleSchema.safeParse(rawData);
        if (!v.success) {
            const err = new Error(formatZodError(v.error));
            err.statusCode = 400; throw err;
        }
        const data = v.data;

        // Kiểm tra trùng lịch trước khi mở transaction
        const conflict = await ScheduleModel.checkConflict(reqUser, data.maNV, data.ngayLam);
        if (conflict) {
            const err = new Error(`Nhân viên ${data.maNV} đã có lịch làm việc ngày ${data.ngayLam}.`);
            err.statusCode = 409; throw err;
        }

        const pool = await poolPromise;
        const transaction = new sql.Transaction(pool);
        try {
            await transaction.begin();

            const inserted = await ScheduleModel.create(reqUser, data, transaction);

            await AuditService.logAction(reqUser, {
                TableName: 'HR.LichLamViec',
                ActionType: 'INSERT',
                RecordID: String(inserted.LichID),
                NewData: data,
                Description: `Phân ca ${data.maCaLamViec} cho NV ${data.maNV} ngày ${data.ngayLam}`
            }, transaction);

            await transaction.commit();
            return { message: 'Tạo lịch làm việc thành công!', id: inserted.LichID };
        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    }

    /**
     * Phân ca hàng loạt (nhiều NV × nhiều ngày)
     */
    static async bulkAssign(reqUser, rawData) {
        const v = bulkAssignSchema.safeParse(rawData);
        if (!v.success) {
            const err = new Error(formatZodError(v.error));
            err.statusCode = 400; throw err;
        }
        const { maNVList, maCaLamViec, ngayLamList, ghiChu } = v.data;

        // Tạo mảng phẳng mọi tổ hợp (NV × ngày)
        const records = [];
        for (const maNV of maNVList) {
            for (const ngayLam of ngayLamList) {
                records.push({ maNV, maCaLamViec, ngayLam, ghiChu });
            }
        }

        const pool = await poolPromise;
        const transaction = new sql.Transaction(pool);
        try {
            await transaction.begin();

            const result = await ScheduleModel.bulkAssign(reqUser, records, transaction);

            await AuditService.logAction(reqUser, {
                TableName: 'HR.LichLamViec',
                ActionType: 'BULK_ASSIGN',
                RecordID: `${maCaLamViec}_bulk`,
                NewData: { maNVList, maCaLamViec, ngayLamList },
                Description: `Phân ca hàng loạt: Ca ${maCaLamViec} cho ${maNVList.length} NV × ${ngayLamList.length} ngày`
            }, transaction);

            await transaction.commit();
            return {
                message: `Phân ca hàng loạt thành công!`,
                totalProcessed: records.length,
                inserted: result.inserted
            };
        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    }

    /**
     * Cập nhật lịch làm việc
     */
    static async update(reqUser, id, rawData) {
        const v = updateScheduleSchema.safeParse(rawData);
        if (!v.success) {
            const err = new Error(formatZodError(v.error));
            err.statusCode = 400; throw err;
        }
        const data = v.data;

        const pool = await poolPromise;
        const transaction = new sql.Transaction(pool);
        try {
            await transaction.begin();

            const oldData = await ScheduleModel.getById(reqUser, id, transaction);
            if (!oldData) {
                await transaction.rollback();
                const err = new Error('Không tìm thấy lịch làm việc.'); err.statusCode = 404; throw err;
            }

            // Kiểm tra trùng nếu đổi ngày
            if (data.ngayLam !== oldData.NgayLam?.toISOString().split('T')[0]) {
                const conflict = await ScheduleModel.checkConflict(reqUser, oldData.MaNV, data.ngayLam, id, transaction);
                if (conflict) {
                    await transaction.rollback();
                    const err = new Error(`Nhân viên đã có lịch làm việc ngày ${data.ngayLam}.`);
                    err.statusCode = 409; throw err;
                }
            }

            await ScheduleModel.update(reqUser, id, data, transaction);

            await AuditService.logAction(reqUser, {
                TableName: 'HR.LichLamViec',
                ActionType: 'UPDATE',
                RecordID: String(id),
                OldData: oldData,
                NewData: data,
                Description: `Cập nhật lịch NV ${oldData.MaNV} ngày ${data.ngayLam}`
            }, transaction);

            await transaction.commit();
            return { message: 'Cập nhật lịch làm việc thành công!' };
        } catch (err) {
            if (transaction) await transaction.rollback();
            throw err;
        }
    }

    /**
     * Xóa 1 lịch làm việc
     */
    static async delete(reqUser, id) {
        const pool = await poolPromise;
        const transaction = new sql.Transaction(pool);
        try {
            await transaction.begin();

            const oldData = await ScheduleModel.getById(reqUser, id, transaction);
            if (!oldData) {
                await transaction.rollback();
                const err = new Error('Không tìm thấy lịch làm việc.'); err.statusCode = 404; throw err;
            }

            await ScheduleModel.delete(reqUser, id, transaction);

            await AuditService.logAction(reqUser, {
                TableName: 'HR.LichLamViec',
                ActionType: 'DELETE',
                RecordID: String(id),
                OldData: oldData,
                Description: `Xóa lịch NV ${oldData.MaNV} ngày ${oldData.NgayLam?.toISOString().split('T')[0]}`
            }, transaction);

            await transaction.commit();
            return { message: 'Xóa lịch làm việc thành công!' };
        } catch (err) {
            if (transaction) await transaction.rollback();
            throw err;
        }
    }
}

module.exports = ScheduleService;
