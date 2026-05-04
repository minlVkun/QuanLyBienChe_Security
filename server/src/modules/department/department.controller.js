const DepartmentService = require('./department.service');

class DepartmentController {
    /**
     * Lấy sơ đồ tổ chức
     */
    static async getOrgChart(req, res) {
        try {
            const data = await DepartmentService.getOrgChart(req.user);
            return res.status(200).json({
                success: true,
                count: data.length,
                data: data
            });
        } catch (err) {
            console.error(`[Controller Error - getOrgChart]:`, err.message);
            return res.status(500).json({ 
                success: false, 
                message: "Không thể tải sơ đồ tổ chức lúc này." 
            });
        }
    }

    /**
     * Thay đổi trưởng phòng đơn vị
     */
    static async changeDeptHead(req, res) {
        try {
            const { id } = req.params; // MaDonVi
            const { maTruongPhong } = req.body;

            const result = await DepartmentService.changeDeptHead(req.user, id, maTruongPhong);

            return res.status(200).json({
                success: true,
                message: result.message
            });

        } catch (err) {
            console.error(`[Controller Error - changeDeptHead]:`, err.message);
            const statusCode = err.statusCode || 500;
            return res.status(statusCode).json({ 
                success: false, 
                message: err.message || "Lỗi máy chủ khi cập nhật lãnh đạo." 
            });
        }
    }

    static async create(req, res) {
        try {
            await DepartmentService.create(req.user, req.body);
            res.status(201).json({ success: true, message: "Thêm đơn vị thành công" });
        } catch (error) {
            res.status(error.statusCode || 500).json({ success: false, message: error.message });
        }
    }

    static async update(req, res) {
        try {
            await DepartmentService.update(req.user, req.params.id, req.body);
            res.status(200).json({ success: true, message: "Cập nhật đơn vị thành công" });
        } catch (error) {
            res.status(error.statusCode || 500).json({ success: false, message: error.message });
        }
    }

    static async delete(req, res) {
        try {
            await DepartmentService.delete(req.user, req.params.id);
            res.status(200).json({ success: true, message: "Xóa đơn vị thành công" });
        } catch (error) {
            res.status(error.statusCode || 500).json({ success: false, message: error.message });
        }
    }
}

module.exports = DepartmentController;