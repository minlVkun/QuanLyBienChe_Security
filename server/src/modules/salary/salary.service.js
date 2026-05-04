// src/services/salaryService.js
const SalaryModel = require('./salary.model');
const EmployeeModel = require('../employee/employee.model');
const { salarySchema, formatZodError } = require('./salary.validation');
const { salaryScaleSchema, salaryStepSchema, formatZodError: formatScaleError } = require('./salaryScale.validation');

class SalaryService {
    
    // ==========================================
    // CÁC HÀM BẠN ĐÃ CÓ (GIỮ NGUYÊN LOGIC)
    // ==========================================
    static async getScales(reqUser) {
        return await SalaryModel.getScales(reqUser);
    }

    static async getHistory(reqUser, maNV) {
        if (!maNV) throw new Error("Mã nhân viên không được để trống.");
        return await SalaryModel.getHistory(reqUser, maNV);
    }

    static async generateMonthlyPayroll(reqUser, thangNam) {
        // Validate định dạng tháng/năm (VD: 04/2026)
        const regex = /^(0[1-9]|1[0-2])\/\d{4}$/;
        if (!regex.test(thangNam)) {
            const err = new Error("Định dạng tháng năm không hợp lệ. Vui lòng dùng MM/YYYY");
            err.statusCode = 400; throw err;
        }

        const activeCount = await SalaryModel.countActiveEmployees(reqUser);
        if (activeCount === 0) {
            const err = new Error("Không có nhân viên nào đang hoạt động để chốt lương.");
            err.statusCode = 422; throw err;
        }

        const LUONG_CO_SO = 2340000;
        const PHU_CAP_MAC_DINH = 500000;
        const TY_LE_KHAU_TRU = 0.105; 

        try {
            const result = await SalaryModel.generatePayroll(reqUser, thangNam, LUONG_CO_SO, PHU_CAP_MAC_DINH, TY_LE_KHAU_TRU);
            return { 
                message: `Đã chốt bảng lương tháng ${thangNam} thành công!`,
                rowsProcessed: result.RowsInserted,
                activeEmployees: activeCount
            };
        } catch (error) {
            // Lỗi từ custom THROW trong SQL (50001) hoặc UNIQUE KEY
            if (error.message.includes('Tháng này đã chốt lương') || error.message.includes('Violation of UNIQUE KEY')) {
                const err = new Error(`Bảng lương tháng ${thangNam} đã được chốt từ trước.`);
                err.statusCode = 409; throw err;
            }
            throw error;
        }
    }

    // ==========================================
    // CÁC HÀM VIẾT THÊM (BỔ SUNG)
    // ==========================================

    /**
     * Logic tính toán và lưu lương riêng lẻ
     */
    static async createMonthlySalary(reqUser, rawData) {
        // 1. Validate dữ liệu đầu vào
        const validationResult = salarySchema.safeParse(rawData);
        if (!validationResult.success) {
            const err = new Error(formatZodError(validationResult.error));
            err.statusCode = 400; throw err;
        }
        
        const validData = validationResult.data;
        
        // 1.5. Kiểm tra nhân viên có tồn tại không
        const employee = await EmployeeModel.getById(reqUser, validData.maNhanVien);
        if (!employee) {
            const err = new Error("Nhân viên không tồn tại trong hệ thống.");
            err.statusCode = 404; throw err;
        }
        
        // 2. Logic tính toán: tongLuong = (heSoLuong * luongCoBan) + phuCap - khauTru
        const tongLuong = (validData.heSoLuong * validData.luongCoBan) + validData.phuCap - validData.khauTru;
        
        const salaryDataToSave = {
            ...validData,
            tongLuong
        };
        
        // 3. Gọi Model lưu kết quả
        await SalaryModel.insertOrUpdateMonthlySalary(reqUser, salaryDataToSave);
        return { message: "Chốt lương cá nhân thành công", data: salaryDataToSave };
    }

    /**
     * Lấy mức lương hiện hưởng của 1 nhân viên
     */
    static async getCurrentSalary(reqUser, maNV) {
        if (!maNV) {
            const error = new Error("Mã nhân viên là bắt buộc.");
            error.statusCode = 400; throw error;
        }
        return await SalaryModel.getCurrentSalaryByMaNV(reqUser, maNV);
    }

    /**
     * Nghiệp vụ Nâng bậc lương / Chuyển ngạch
     */
    static async promoteSalary(reqUser, data) {
        if (!data.MaNV || !data.MaNgach || !data.BacLuong || !data.NgayHuong) {
            const error = new Error("Thiếu thông tin bắt buộc để nâng lương.");
            error.statusCode = 400; throw error;
        }

        const ngayHuongDate = new Date(data.NgayHuong);
        const today = new Date();
        if (ngayHuongDate > today) {
            const error = new Error("Ngày hưởng lương không hợp lệ (không được vượt quá ngày hiện tại).");
            error.statusCode = 400; throw error;
        }

        const validScale = await SalaryModel.findScale(reqUser, data.MaNgach, data.BacLuong);
        if (!validScale) {
            const error = new Error("Ngạch hoặc bậc lương không tồn tại trong hệ thống.");
            error.statusCode = 422; throw error;
        }

        if (data.HeSoLuong && Number(data.HeSoLuong) !== Number(validScale.HeSoLuong)) {
            const error = new Error(`Hệ số lương không khớp. Ngạch này yêu cầu hệ số ${validScale.HeSoLuong}.`);
            error.statusCode = 422; throw error;
        }
        
        data.HeSoLuong = validScale.HeSoLuong;

        await SalaryModel.promoteSalary(reqUser, data);
        return { message: "Nâng bậc lương thành công!" };
    }

    /**
     * Lấy danh sách bảng lương tổng hợp (Cho Admin/Trưởng phòng)
     */
    static async getPayroll(reqUser, filters) {
        // Nếu client không truyền tháng/năm, tự động lấy tháng hiện tại
        if (!filters.thangNam) {
            const d = new Date();
            filters.thangNam = `${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
        }
        return await SalaryModel.getPayrollList(reqUser, filters);
    }

    /**
     * Lấy lịch sử phiếu lương của từng cá nhân
     */
    static async getPersonalPayslips(reqUser, maNV) {
        if (!maNV) {
            const error = new Error("Mã nhân viên là bắt buộc.");
            error.statusCode = 400; throw error;
        }
        return await SalaryModel.getPayslipHistory(reqUser, maNV);
    }

    /**
     * Cập nhật phiếu lương
     */
    static async updatePayroll(reqUser, id, data) {
        if (!id) throw new Error("Thiếu ID bản ghi lương.");
        return await SalaryModel.updatePayroll(reqUser, id, data);
    }

    /**
     * Xóa phiếu lương
     */
    static async deletePayroll(reqUser, id) {
        if (!id) throw new Error("Thiếu ID bản ghi lương.");
        return await SalaryModel.deletePayroll(reqUser, id);
    }

    // --- QUẢN LÝ NGẠCH LƯƠNG ---

    static async createScale(reqUser, data) {
        const validation = salaryScaleSchema.safeParse(data);
        if (!validation.success) {
            const err = new Error(formatScaleError(validation.error));
            err.statusCode = 400; throw err;
        }

        const exist = await SalaryModel.findScaleByMa(reqUser, validation.data.MaNgach);
        if (exist) {
            const err = new Error("Mã ngạch lương đã tồn tại trong hệ thống!");
            err.statusCode = 400; throw err;
        }

        await SalaryModel.createScale(reqUser, validation.data);
        return { success: true, message: "Thêm ngạch lương mới thành công!" };
    }

    static async updateScale(reqUser, maNgach, data) {
        const validation = salaryScaleSchema.partial().safeParse(data);
        if (!validation.success) {
            const err = new Error(formatScaleError(validation.error));
            err.statusCode = 400; throw err;
        }
        await SalaryModel.updateScale(reqUser, maNgach, validation.data);
        return { success: true, message: "Cập nhật ngạch lương thành công!" };
    }

    static async deleteScale(reqUser, maNgach) {
        if (!maNgach) throw new Error("Thiếu mã ngạch cần xóa!");
        await SalaryModel.deleteScale(reqUser, maNgach);
        return { success: true, message: "Đã xóa ngạch lương!" };
    }

    // --- QUẢN LÝ BẬC LƯƠNG ---

    static async addStep(reqUser, data) {
        const validation = salaryStepSchema.safeParse(data);
        if (!validation.success) {
            const err = new Error(formatScaleError(validation.error));
            err.statusCode = 400; throw err;
        }

        // Fix Critical: Kiểm tra trùng bậc lương
        const isExisted = await SalaryModel.checkStepExists(reqUser, validation.data.MaNgach, validation.data.BacLuong);
        if (isExisted) {
            const err = new Error(`Bậc ${validation.data.BacLuong} đã tồn tại trong ngạch ${validation.data.MaNgach}!`);
            err.statusCode = 400; throw err;
        }

        await SalaryModel.addStep(reqUser, validation.data);
        return { success: true, message: "Thêm bậc lương mới thành công!" };
    }

    static async deleteStep(reqUser, maNgach, bacLuong) {
        if (!maNgach || !bacLuong) throw new Error("Thiếu thông tin để xóa bậc lương!");
        await SalaryModel.deleteStep(reqUser, maNgach, bacLuong);
        return { success: true, message: "Đã xóa bậc lương!" };
    }
}

module.exports = SalaryService;