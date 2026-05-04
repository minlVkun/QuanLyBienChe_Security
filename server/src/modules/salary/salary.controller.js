// src/controllers/salaryController.js
const SalaryService = require('./salary.service');

const salaryController = {
    
    // [GET] /api/salary/scales
    async getScales(req, res) {
        try {
            const data = await SalaryService.getScales(req.user);
            res.status(200).json({ success: true, data });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // [GET] /api/salary/history/:maNV
    async getHistory(req, res) {
        try {
            const { maNV } = req.params;
            const data = await SalaryService.getHistory(req.user, maNV);
            res.status(200).json({ success: true, count: data.length, data });
        } catch (error) {
            const code = error.statusCode || 500;
            res.status(code).json({ success: false, message: error.message });
        }
    },

    // [GET] /api/salary/current/:maNV
    async getCurrentSalary(req, res) {
        try {
            const { maNV } = req.params;
            const data = await SalaryService.getCurrentSalary(req.user, maNV);
            if (!data) return res.status(404).json({ success: false, message: "Không tìm thấy dữ liệu lương hiện tại." });
            res.status(200).json({ success: true, data });
        } catch (error) {
            const code = error.statusCode || 500;
            res.status(code).json({ success: false, message: error.message });
        }
    },

    // [GET] /api/salary/payroll
    async getPayroll(req, res) {
        try {
            const { thangNam, maDonVi } = req.query;
            const data = await SalaryService.getPayroll(req.user, { thangNam, maDonVi });
            res.status(200).json({ success: true, count: data.length, data });
        } catch (error) {
            const code = error.statusCode || 500;
            res.status(code).json({ success: false, message: error.message });
        }
    },

    // [GET] /api/salary/payroll/:maNV
    async getPersonalPayslips(req, res) {
        try {
            const { maNV } = req.params;
            const data = await SalaryService.getPersonalPayslips(req.user, maNV);
            res.status(200).json({ success: true, count: data.length, data });
        } catch (error) {
            const code = error.statusCode || 500;
            res.status(code).json({ success: false, message: error.message });
        }
    },

    // [POST] /api/salary/promote
    async promoteSalary(req, res) {
        try {
            const payload = req.body; 
            const result = await SalaryService.promoteSalary(req.user, payload);
            res.status(200).json({ success: true, message: result.message });
        } catch (error) {
            // Lỗi 50005 từ SQL Server quăng ra
            if (error.message.includes('Ngạch lương hoặc Bậc lương không hợp lệ')) {
                return res.status(400).json({ success: false, message: error.message });
            }
            const statusCode = error.statusCode || 500;
            res.status(statusCode).json({ success: false, message: error.message });
        }
    },

    // [POST] /api/salary/monthly
    async createMonthlySalary(req, res) {
        try {
            const payload = req.body;
            const result = await SalaryService.createMonthlySalary(req.user, payload);
            res.status(200).json({ success: true, message: result.message, data: result.data });
        } catch (error) {
            const code = error.statusCode || 500;
            res.status(code).json({ success: false, message: error.message });
        }
    },

    // [POST] /api/salary/payroll/generate
    async generatePayroll(req, res) {
        try {
            const { thangNam } = req.body;
            const result = await SalaryService.generateMonthlyPayroll(req.user, thangNam);
            res.status(200).json({ success: true, message: result.message });
        } catch (error) {
            const code = error.statusCode || 500;
            res.status(code).json({ success: false, message: error.message });
        }
    },

    // [PUT] /api/salary/payroll/:id
    async updatePayroll(req, res) {
        try {
            const { id } = req.params;
            await SalaryService.updatePayroll(req.user, id, req.body);
            res.status(200).json({ success: true, message: "Cập nhật phiếu lương thành công" });
        } catch (error) {
            const code = error.statusCode || 500;
            res.status(code).json({ success: false, message: error.message });
        }
    },

    // [DELETE] /api/salary/payroll/:id
    async deletePayroll(req, res) {
        try {
            const { id } = req.params;
            await SalaryService.deletePayroll(req.user, id);
            res.status(200).json({ success: true, message: "Đã xóa phiếu lương thành công" });
        } catch (error) {
            const code = error.statusCode || 500;
            res.status(code).json({ success: false, message: error.message });
        }
    },

    // --- QUẢN LÝ NGẠCH LƯƠNG ---

    async createScale(req, res) {
        try {
            const result = await SalaryService.createScale(req.user, req.body);
            res.status(201).json(result);
        } catch (error) {
            const code = error.statusCode || 500;
            res.status(code).json({ success: false, message: error.message });
        }
    },

    async updateScale(req, res) {
        try {
            const { id } = req.params;
            const result = await SalaryService.updateScale(req.user, id, req.body);
            res.status(200).json(result);
        } catch (error) {
            const code = error.statusCode || 500;
            res.status(code).json({ success: false, message: error.message });
        }
    },

    async deleteScale(req, res) {
        try {
            const { id } = req.params;
            const result = await SalaryService.deleteScale(req.user, id);
            res.status(200).json(result);
        } catch (error) {
            const code = error.statusCode || 500;
            res.status(code).json({ success: false, message: error.message });
        }
    },

    // --- QUẢN LÝ BẬC LƯƠNG ---

    async addStep(req, res) {
        try {
            const result = await SalaryService.addStep(req.user, req.body);
            res.status(201).json(result);
        } catch (error) {
            const code = error.statusCode || 500;
            res.status(code).json({ success: false, message: error.message });
        }
    },

    async deleteStep(req, res) {
        try {
            const { maNgach, bacLuong } = req.params;
            const result = await SalaryService.deleteStep(req.user, maNgach, bacLuong);
            res.status(200).json(result);
        } catch (error) {
            const code = error.statusCode || 500;
            res.status(code).json({ success: false, message: error.message });
        }
    }
};
module.exports = salaryController;