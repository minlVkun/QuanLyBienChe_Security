const ShiftService = require('./shift.service');

class ShiftController {
    static async getAll(req, res) {
        try {
            const filters = {
                page: parseInt(req.query.page) || 1,
                limit: parseInt(req.query.limit) || 50
            };
            const data = await ShiftService.getAll(req.user, filters);
            
            // Nếu có dữ liệu, trả về kèm metadata
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
            console.error("[Controller - Shift - getAll] Error:", err);
            return res.status(err.statusCode || 500).json({ success: false, message: err.message });
        }
    }

    static async getById(req, res) {
        try {
            const data = await ShiftService.getById(req.user, req.params.id);
            if (!data) return res.status(404).json({ success: false, message: "Không tìm thấy ca làm việc" });
            return res.status(200).json({ success: true, data });
        } catch (err) {
            return res.status(err.statusCode || 500).json({ success: false, message: err.message });
        }
    }

    static async create(req, res) {
        try {
            await ShiftService.create(req.user, req.body);
            return res.status(201).json({ success: true, message: "Thêm mới thành công" });
        } catch (err) {
            return res.status(err.statusCode || 500).json({ success: false, message: err.message });
        }
    }

    static async update(req, res) {
        try {
            await ShiftService.update(req.user, req.params.id, req.body);
            return res.status(200).json({ success: true, message: "Cập nhật thành công" });
        } catch (err) {
            return res.status(err.statusCode || 500).json({ success: false, message: err.message });
        }
    }

    static async delete(req, res) {
        try {
            await ShiftService.delete(req.user, req.params.id);
            return res.status(200).json({ success: true, message: "Xóa thành công" });
        } catch (err) {
            const statusCode = (err.number === 547) ? 409 : (err.statusCode || 500);
            const message = (err.number === 547) ? "Không thể xóa vì ca làm việc đang được sử dụng" : err.message;
            return res.status(statusCode).json({ success: false, message });
        }
    }
}

module.exports = ShiftController;
