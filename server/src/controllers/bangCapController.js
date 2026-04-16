//src/controllers/bangCapController.js
const BangCapModel = require('../models/bangCapModel');


// Lấy danh sách bằng cấp của một nhân viên
const getDegrees = async (req, res) => {
    try {
        const maNV = req.params.id;
        const data = await BangCapModel.getByMaNV(req.user, maNV);
        res.json({ success: true, data });
    } catch (err) {
        console.error("Error occurred while fetching degrees:", err);
        res.status(500).json({ 
            success: false, 
            message: err.message 
        });
    }
};

// Thêm bằng cấp mới cho nhân viên
const addDegree = async (req, res) => {
    try {
        const result = await BangCapModel.create(req.user, req.body);
        if (result > 0) {
            res.status(201).json({ success: true, message: 'Thêm bằng cấp thành công' });
        }
        else {
            res.status(400).json({ success: false, message: 'Thêm bằng cấp thất bại hoặc bạn không có quyền thực hiện thao tác này' });
        }
    } catch (err) {
        console.error("Error occurred while adding degree:", err);
        res.status(500).json({ 
            success: false, 
            message: err.message 
        });
    }
};

const deleteDegree = async (req, res) => {
    try {
        const idBang = req.params.idBang;
        const result = await BangCapModel.delete(req.user, idBang);
        if (result > 0) {
            res.json({ 
                success: true, 
                message: 'Xóa bằng cấp thành công' 
            });
        } else {
            res.status(404).json({ 
                success: false, 
                message: 'Bằng cấp không tồn tại hoặc bạn không có quyền thực hiện thao tác này' 
            });
        }   
    } catch (err) {
        console.error("Error occurred while deleting degree:", err);
        res.status(500).json({ 
            success: false, 
            message: err.message });
    }
};

module.exports = {  
    getDegrees, 
    addDegree, 
    deleteDegree 
};