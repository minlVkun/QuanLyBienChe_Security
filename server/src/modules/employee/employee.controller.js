//src/controllers/employeeController.js
const EmployeeService = require('./employee.service');

// Lấy danh sách tất cả nhân viên
const getAllEmployees = async (req, res) => {
    try {
        const data = await EmployeeService.getAllEmployees(req.user);

        return res.status(200).json({
            success: true,
            data
        });
    } catch (err) {
        console.error("[Controller - getAllEmployees] Error:", err);
        return res.status(err.status || 500).json({
            success: false,
            message: err.message || "Lỗi hệ thống khi lấy danh sách nhân viên"
        });
    }
};

// Lấy thông tin nhân viên theo ID
const getEmployeeById = async (req, res) => {
    try {
        const maNV = req.params.id;

        const employee = await EmployeeService.getEmployeeById(req.user, maNV);

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
        console.error("[Controller - getEmployeeById] Error:", err);
        return res.status(err.status || 500).json({
            success: false,
            message: err.message || "Lỗi hệ thống khi lấy thông tin nhân viên"
        });
    }
};

// Thêm mới nhân viên -- fix
const addEmployee = async (req, res) => {
    try {
        const result = await EmployeeService.createEmployee(req.user, req.body);
        
        return res.status(201).json({ 
            success: true, 
            message: 'Thêm nhân viên thành công',
            data: result 
        });
    } catch (error) {
        console.error("[Controller - addEmployee] Error:", error);
        
        return res.status(error.status || 500).json({ 
            success: false, 
            message: error.message || "Lỗi hệ thống khi thêm nhân viên"
        });
    }
};

// Cập nhật thông tin nhân viên -- fix
const updateEmployee = async (req, res) => {
    try {
        const maNV = req.params.id;
        const updateData = req.body;

        const affectedRows = await EmployeeService.updateEmployee(req.user, maNV, updateData);
        
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

        return res.status(err.status || 500).json({
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
        const result = await EmployeeService.softDeleteEmployee(req.user, maNV);

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
        
        return res.status(err.status || 500).json({
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