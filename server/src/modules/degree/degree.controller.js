const DegreeService = require('./degree.service');

const getDegrees = async (req, res) => {
    try {
        const maNV = req.params.id;
        const data = await DegreeService.getByMaNV(req.user, maNV);
        res.status(200).json({ success: true, data });
    } catch (err) {
        const statusCode = err.statusCode || 500;
        res.status(statusCode).json({ success: false, message: err.message || "Lỗi máy chủ khi lấy danh sách bằng cấp." });
    }
};

const addDegree = async (req, res) => {
    try {
        const result = await DegreeService.create(req.user, req.body);
        res.status(201).json({ success: true, message: result.message });
    } catch (err) {
        const statusCode = err.statusCode || 500;
        res.status(statusCode).json({ success: false, message: err.message || "Lỗi máy chủ khi thêm bằng cấp." });
    }
};

const deleteDegree = async (req, res) => {
    try {
        const idBang = req.params.id;
        const result = await DegreeService.delete(req.user, idBang);
        res.status(200).json({ success: true, message: result.message });
    } catch (err) {
        const statusCode = err.statusCode || 500;
        res.status(statusCode).json({ success: false, message: err.message || "Lỗi máy chủ khi xóa bằng cấp." });
    }
};

const updateDegree = async (req, res) => {
    try {
        const idBang = req.params.id;
        const result = await DegreeService.update(req.user, idBang, req.body);
        res.status(200).json({ success: true, message: result.message });
    } catch (err) {
        const statusCode = err.statusCode || 500;
        res.status(statusCode).json({ success: false, message: err.message || "Lỗi máy chủ khi cập nhật bằng cấp." });
    }
};

module.exports = {  
    getDegrees, 
    addDegree, 
    updateDegree,
    deleteDegree 
};