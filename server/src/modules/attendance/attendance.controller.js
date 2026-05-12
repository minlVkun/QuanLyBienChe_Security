const AttendanceService = require('./attendance.service');

class AttendanceController {
    /**
     * API: POST /api/attendance/check
     */
    static async checkInOut(req, res) {
        try {
            const result = await AttendanceService.processCheckInOut(req.user);
            return res.status(200).json({
                success: true,
                action: result.action,
                message: result.action === "check-in" ? "Check-in thành công" : "Check-out thành công"
            });
        } catch (err) {
            console.error(`[Controller - Attendance - checkInOut] Error:\n`, err.stack);
            const statusCode = (err.number === 2627 || err.number === 2601) ? 409 : (err.statusCode || 500);
            return res.status(statusCode).json({
                success: false,
                message: err.message || "Lỗi máy chủ khi xử lý chấm công."
            });
        }
    }

    /**
     * API: GET /api/attendance/history/:maNV
     */
    static async getHistory(req, res) {
        try {
            const maNV = req.params.maNV;
            const { fromDate, toDate } = req.query;
            const data = await AttendanceService.getHistory(req.user, maNV, fromDate, toDate);
            return res.status(200).json({
                success: true,
                data
            });
        } catch (err) {
            console.error(`[Controller - Attendance - getHistory] Error:`, err.message);
            return res.status(err.statusCode || 500).json({
                success: false,
                message: err.message || "Lỗi máy chủ khi lấy lịch sử chấm công."
            });
        }
    }

    /**
     * API: GET /api/attendance (Admin/HR)
     */
    static async getAll(req, res) {
        try {
            const filters = {
                fromDate: req.query.fromDate,
                toDate: req.query.toDate,
                maDonVi: req.query.maDonVi,
                trangThai: req.query.trangThai,
                keyword: req.query.keyword,
                page: parseInt(req.query.page) || 1,
                limit: parseInt(req.query.limit) || 50
            };
            const data = await AttendanceService.getAll(req.user, filters);
            
            const totalRows = data.length > 0 ? data[0].TotalRows : 0;
            return res.status(200).json({ 
                success: true, 
                data: data.map(({ TotalRows, ...item }) => item),
                pagination: {
                    totalRows,
                    page: filters.page,
                    limit: filters.limit
                }
            });
        } catch (err) {
            console.error('[AttendanceController.getAll] ERROR:', err);
            return res.status(err.statusCode || 500).json({ success: false, message: err.message });
        }
    }

    /**
     * API: PUT /api/attendance/:id (Admin/HR)
     */
    static async updateManual(req, res) {
        try {
            const id = req.params.id;
            const { gioVao, gioRa } = req.body;
            await AttendanceService.updateManual(req.user, id, { gioVao, gioRa });
            return res.status(200).json({ success: true, message: "Cập nhật thành công" });
        } catch (err) {
            return res.status(err.statusCode || 500).json({ success: false, message: err.message });
        }
    }

    /**
     * API: POST /api/attendance/export
     */
    static async exportExcel(req, res) {
        try {
            const filters = req.body;
            const buffer = await AttendanceService.exportToBuffer(req.user, filters);
            
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename=BaoCaoChamCong.xlsx');
            
            return res.status(200).send(buffer);
        } catch (err) {
            return res.status(err.statusCode || 500).json({ success: false, message: err.message });
        }
    }
    /**
     * API: POST /api/attendance/mark-absences (Admin/HR)
     */
    static async markAbsences(req, res) {
        try {
            const { date } = req.body;
            const result = await AttendanceService.markAbsencesForScheduled(req.user, date);
            return res.status(200).json({ success: true, message: result.message, count: result.count });
        } catch (err) {
            console.error(`[Controller - Attendance - markAbsences] Error:`, err.message);
            return res.status(err.statusCode || 500).json({ success: false, message: err.message });
        }
    }
}

module.exports = AttendanceController;
