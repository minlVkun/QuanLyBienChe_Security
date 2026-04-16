//src/controllers/nhanVienController.js
const NhanVienService = require('../services/nhanVienService');

// Lấy danh sách tất cả nhân viên
const getAllEmployees = async (req, res) => {
    try {
        const data = await NhanVienService.getAllEmployees(req.user);

        return res.status(200).json({
            success: true,
            data
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

// Lấy thông tin nhân viên theo ID
const getEmployeeById = async (req, res) => {
    try {
        const maNV = req.params.id;

        const employee = await NhanVienService.getEmployeeById(req.user, maNV);

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy nhân viên'
            });
        }

        return res.status(200).json({
            success: true,
            data: employee
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

// Thêm mới nhân viên -- fix
const addEmployee = async (req, res) => {
    try {
        const result = await NhanVienService.createEmployee(req.user, req.body);
        
        return res.status(201).json({ 
            success: true, 
            message: 'Thêm nhân viên thành công',
            data: result 
        });
    } catch (error) {
        console.error("Error in Controller:", error);
        
        // Lỗi từ RAISERROR trong SQL thường có số lỗi >= 50000
        const statusCode = error.number >= 50000 ? 400 : 500;
        const message = error.number >= 50000 ? error.message : "Lỗi hệ thống khi thêm nhân viên";

        res.status(statusCode).json({ 
            success: false, 
            message: message 
        });
    }
};

// Cập nhật thông tin nhân viên -- fix
const updateEmployee = async (req, res) => {
    try {
        const maNV = req.params.id;
        const updateData = req.body;

        const affectedRows = await NhanVienService.updateEmployee(req.user, maNV, updateData);
        
        if (affectedRows > 0) {
            return res.status(200).json({
                success: true,
                message: 'Cập nhật thông tin nhân viên thành công'
            });
        } else {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy hồ sơ nhân viên hoặc bạn không có quyền chỉnh sửa.'
            });
        }
    } catch (err) {
        console.error("[Controller - updateEmployee] Error:", err);

        // Xử lý lỗi nghiệp vụ (mã lỗi 400)
        const isClientError = err.number >= 50000 || 
                             err.message === "Không có trường nào để cập nhật" || 
                             err.message === "Mã nhân viên không hợp lệ.";

        res.status(isClientError ? 400 : 500).json({
            success: false,
            message: err.message || 'Đã xảy ra lỗi khi cập nhật thông tin nhân viên'
        });
    }
};

// Xóa nhân viên (xóa mềm)
const deleteEmployee = async (req, res) => {
    try {
        const maNV = req.params.id;
        
        // Gọi Service xử lý
        const result = await NhanVienService.softDeleteEmployee(req.user, maNV);

        if (result > 0) {
            return res.status(200).json({
                success: true,
                message: 'Nhân viên và tài khoản liên quan đã được khóa thành công.'
            });
        } else {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy nhân viên hoặc nhân viên đã bị xóa trước đó.'
            });
        }
    } catch (err) {
        console.error("[Controller - deleteEmployee] Error:", err.message);
        
        // Trả về lỗi 400 cho các lỗi logic nghiệp vụ từ Service
        const statusCode = (err.message.includes("không hợp lệ") || err.message.includes("không thể tự xóa")) ? 400 : 500;
        
        res.status(statusCode).json({
            success: false,
            message: err.message || 'Đã xảy ra lỗi khi xóa nhân viên'
        });
    }
};


module.exports = {
    getAllEmployees,
    getEmployeeById,
    addEmployee,
    updateEmployee,
    deleteEmployee
};