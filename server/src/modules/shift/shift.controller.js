const ShiftModel = require('./shift.model');
const AuditService = require('../audit/audit.service');

class ShiftController {
    static async getAll(req, res) {
        try {
            const data = await ShiftModel.getAll(req.user);
            return res.status(200).json({ success: true, data });
        } catch (err) {
            return res.status(err.statusCode || 500).json({ success: false, message: err.message });
        }
    }

    static async getById(req, res) {
        try {
            const data = await ShiftModel.getById(req.user, req.params.id);
            if (!data) return res.status(404).json({ success: false, message: "Không tìm thấy ca làm việc" });
            return res.status(200).json({ success: true, data });
        } catch (err) {
            return res.status(err.statusCode || 500).json({ success: false, message: err.message });
        }
    }

    static async create(req, res) {
        try {
            const oldData = null;
            await ShiftModel.create(req.user, req.body);
            
            await AuditService.logAction(req.user, {
                TableName: 'HR.CaLamViec',
                ActionType: 'INSERT',
                RecordID: req.body.maCa,
                NewData: req.body,
                Description: `Thêm ca làm việc mới: ${req.body.tenCa}`
            });

            return res.status(201).json({ success: true, message: "Thêm mới thành công" });
        } catch (err) {
            return res.status(err.statusCode || 500).json({ success: false, message: err.message });
        }
    }

    static async update(req, res) {
        try {
            const maCa = req.params.id;
            const oldData = await ShiftModel.getById(req.user, maCa);
            if (!oldData) return res.status(404).json({ success: false, message: "Không tìm thấy ca làm việc" });

            await ShiftModel.update(req.user, maCa, req.body);

            await AuditService.logAction(req.user, {
                TableName: 'HR.CaLamViec',
                ActionType: 'UPDATE',
                RecordID: maCa,
                OldData: oldData,
                NewData: { ...oldData, ...req.body },
                Description: `Cập nhật ca làm việc: ${maCa}`
            });

            return res.status(200).json({ success: true, message: "Cập nhật thành công" });
        } catch (err) {
            return res.status(err.statusCode || 500).json({ success: false, message: err.message });
        }
    }

    static async delete(req, res) {
        try {
            const maCa = req.params.id;
            const oldData = await ShiftModel.getById(req.user, maCa);
            if (!oldData) return res.status(404).json({ success: false, message: "Không tìm thấy ca làm việc" });

            await ShiftModel.delete(req.user, maCa);

            await AuditService.logAction(req.user, {
                TableName: 'HR.CaLamViec',
                ActionType: 'DELETE',
                RecordID: maCa,
                OldData: oldData,
                Description: `Xóa ca làm việc: ${maCa}`
            });

            return res.status(200).json({ success: true, message: "Xóa thành công" });
        } catch (err) {
            const statusCode = (err.number === 547) ? 409 : (err.statusCode || 500);
            const message = (err.number === 547) ? "Không thể xóa vì ca làm việc đang được sử dụng" : err.message;
            return res.status(statusCode).json({ success: false, message });
        }
    }
}

module.exports = ShiftController;
