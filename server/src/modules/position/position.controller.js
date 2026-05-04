const PositionService = require('./position.service');

const getAllChucVu = async (req, res) => {
    try {
        const data = await PositionService.getAll(req.user);
        return res.status(200).json({ success: true, data });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({ success: false, message: error.message || "Lỗi hệ thống khi tải danh mục chức vụ." });
    }
};

const getChucVuById = async (req, res) => {
    try {
        const { id } = req.params;
        const data = await PositionService.getById(req.user, id);
        return res.status(200).json({ success: true, data });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({ success: false, message: error.message || "Lỗi khi lấy chi tiết chức vụ." });
    }
};

const createChucVu = async (req, res) => {
    try {
        const result = await PositionService.create(req.user, req.body);
        return res.status(201).json({ success: true, message: result.message });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({ success: false, message: error.message || "Lỗi hệ thống khi thêm chức vụ." });
    }
};

const updateChucVu = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await PositionService.update(req.user, id, req.body);
        return res.status(200).json({ success: true, message: result.message });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({ success: false, message: error.message || "Lỗi hệ thống khi cập nhật chức vụ." });
    }
};

const deleteChucVu = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await PositionService.delete(req.user, id);
        return res.status(200).json({ success: true, message: result.message });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({ success: false, message: error.message || "Lỗi hệ thống khi xóa chức vụ." });
    }
};

module.exports = {
    getAllChucVu,
    getChucVuById,
    createChucVu,
    updateChucVu,
    deleteChucVu
};