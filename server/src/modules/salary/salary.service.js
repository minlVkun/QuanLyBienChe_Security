// src/services/salaryService.js
const SalaryModel = require('./salary.model');
const EmployeeModel = require('../employee/employee.model');
const AuditService = require('../audit/audit.service');
const { poolPromise, sql } = require('../../config/db');
const DBHelper = require('../../utils/dbHelper');
const { salarySchema, formatZodError } = require('./salary.validation');
const { salaryScaleSchema, salaryStepSchema, formatZodError: formatScaleError } = require('./salaryScale.validation');
const ConfigModel = require('../systemConfig/config.model');

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

        const pool = await poolPromise;
        const transaction = new sql.Transaction(pool);

        try {
            await transaction.begin();

            const configs = await ConfigModel.getAllConfigs();
            const getConfig = (key, defaultVal, isFloat = false) => {
                const c = configs.find(x => x.ConfigKey === key);
                if (!c) return defaultVal;
                return isFloat ? parseFloat(c.ConfigValue) : parseInt(c.ConfigValue, 10);
            };

            const LUONG_CO_SO = getConfig('LUONG_CO_SO', 2340000);
            const PHU_CAP_MAC_DINH = getConfig('PHU_CAP_MAC_DINH', 500000);
            const TY_LE_KHAU_TRU = getConfig('TY_LE_KHAU_TRU', 0.105, true); 
            const NGAY_CONG_CHUAN = getConfig('NGAY_CONG_CHUAN', 26.0, true);
            const PHAT_DI_TRE = getConfig('PHAT_DI_TRE', 1000);

            // 1. Tính lương hàng loạt (Truyền transaction + Tăng timeout lên 2 phút cho batch lớn)
            const result = await SalaryModel.generatePayroll(reqUser, thangNam, LUONG_CO_SO, PHU_CAP_MAC_DINH, TY_LE_KHAU_TRU, NGAY_CONG_CHUAN, PHAT_DI_TRE, transaction);
            
            // 2. Ghi Audit Log TRONG Transaction
            await AuditService.logAction(reqUser, {
                TableName: 'Salary.BangLuong',
                Action: 'GENERATE_PAYROLL',
                RecordID: thangNam,
                NewData: { thangNam, LUONG_CO_SO, rowsProcessed: result.RowsInserted }
            }, transaction);

            await transaction.commit();

            return { 
                message: `Đã chốt bảng lương tháng ${thangNam} thành công!`,
                rowsProcessed: result.RowsInserted,
                activeEmployees: activeCount
            };
        } catch (error) {
            if (transaction) await transaction.rollback();
            
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
     * Logic tính toán xem trước (Preview) lương cá nhân dựa trên Chấm công
     */
    static async calculatePreview(reqUser, data) {
        const { maNhanVien, thang, nam, luongCoBan } = data;
        const thangNam = `${String(thang).padStart(2, '0')}/${nam}`;

        // 1. Lấy diễn biến lương hiện tại
        const currentSalary = await SalaryModel.getCurrentSalaryByMaNV(reqUser, maNhanVien);
        
        // 2. Lấy chấm công thực tế
        const pool = await poolPromise;
        const attQuery = `
            SELECT 
                SUM(CASE WHEN TrangThai NOT IN (N'Quên checkout', N'Chưa hoàn tất') THEN 1 ELSE 0 END) as NgayCong, 
                SUM(CASE WHEN TrangThai NOT IN (N'Quên checkout', N'Chưa hoàn tất') THEN (ISNULL(SoPhutDiTre, 0) + ISNULL(SoPhutVeSom, 0)) ELSE 0 END) as TongPhutTre
            FROM HR.ChamCong
            WHERE MaNV = @MaNV AND FORMAT(NgayChamCong, 'MM/yyyy') = @ThangNam
        `;
        const attRes = await DBHelper.queryWithContext(reqUser, attQuery, [
            { name: 'MaNV', type: sql.VarChar, value: maNhanVien },
            { name: 'ThangNam', type: sql.VarChar, value: thangNam }
        ]);
        
        const attendance = attRes.recordset[0] || { NgayCong: 0, TongPhutTre: 0 };

        // 3. Lấy phụ cấp cố định
        const pcQuery = `SELECT SUM(SoTien) as TongPhuCap FROM HR.PhuCapCoDinh WHERE MaNV = @MaNV AND IsActive = 1`;
        const pcRes = await DBHelper.queryWithContext(reqUser, pcQuery, [{ name: 'MaNV', type: sql.VarChar, value: maNhanVien }]);
        const phuCap = pcRes.recordset[0]?.TongPhuCap || 0;

        // 4. Tính toán theo công thức nghiệp vụ
        const heSo = currentSalary.HeSoLuong || 0;
        const base = luongCoBan || 2340000;
        const tyLeBH = 0.105;

        const luongTheoCong = Math.round((heSo * base / 26.0) * attendance.NgayCong);
        const tienBH = Math.round(heSo * base * tyLeBH);
        const tienPhatTre = attendance.TongPhutTre * 1000;

        const tongLuong = luongTheoCong + phuCap - tienBH - tienPhatTre;

        return {
            maNhanVien,
            thangNam,
            hoTen: currentSalary.HoTen || 'N/A',
            heSoLuong: heSo,
            ngayCong: attendance.NgayCong,
            tongPhutTre: attendance.TongPhutTre,
            luongTheoCong,
            phuCap,
            khauTruBH: tienBH,
            tienPhatTre,
            tongLuong: tongLuong > 0 ? tongLuong : 0
        };
    }

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

        await AuditService.logAction(reqUser, {
            TableName: 'Salary.BangLuong',
            Action: 'UPSERT_PERSONAL',
            RecordID: `${validData.maNhanVien}_${validData.thangNam}`,
            NewData: salaryDataToSave
        });

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

        const oldSalary = await SalaryModel.getCurrentSalaryByMaNV(reqUser, data.MaNV);
        
        data.HeSoLuong = validScale.HeSoLuong;

        await SalaryModel.promoteSalary(reqUser, data);

        await AuditService.logAction(reqUser, {
            TableName: 'Salary.DienBienLuong',
            Action: 'PROMOTE',
            RecordID: data.MaNV,
            OldData: oldSalary,
            NewData: data
        });

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
        const data = await SalaryModel.getPayrollList(reqUser, filters);
        
        // Log Read Audit
        await AuditService.logAction(reqUser, {
            TableName: 'Salary.BangLuong',
            Action: 'READ_LIST',
            RecordID: filters.thangNam,
            NewData: { filters, count: data.length }
        });

        return data;
    }

    /**
     * Lấy lịch sử phiếu lương của từng cá nhân
     */
    static async getPersonalPayslips(reqUser, maNV) {
        if (!maNV) {
            const error = new Error("Mã nhân viên là bắt buộc.");
            error.statusCode = 400; throw error;
        }
        const data = await SalaryModel.getPayslipHistory(reqUser, maNV);

        // Log Read Audit
        await AuditService.logAction(reqUser, {
            TableName: 'Salary.BangLuong',
            Action: 'READ_DETAIL',
            RecordID: maNV,
            NewData: { count: data.length }
        });

        return data;
    }

    /**
     * Cập nhật phiếu lương
     */
    static async updatePayroll(reqUser, id, data) {
        if (!id) throw new Error("Thiếu ID bản ghi lương.");
        
        const existing = await SalaryModel.getPayrollById(reqUser, id);
        if (!existing) {
            const err = new Error("Bản ghi lương không tồn tại.");
            err.statusCode = 404; throw err;
        }

        await SalaryModel.updatePayroll(reqUser, id, data);

        await AuditService.logAction(reqUser, {
            TableName: 'Salary.BangLuong',
            Action: 'UPDATE',
            RecordID: id,
            OldData: existing,
            NewData: data
        });

        return { success: true, message: "Cập nhật bảng lương thành công." };
    }

    /**
     * Xóa phiếu lương
     */
    static async deletePayroll(reqUser, id) {
        if (!id) throw new Error("Thiếu ID bản ghi lương.");
        
        const existing = await SalaryModel.getPayrollById(reqUser, id);
        if (!existing) {
            const err = new Error("Bản ghi lương không tồn tại.");
            err.statusCode = 404; throw err;
        }

        await SalaryModel.deletePayroll(reqUser, id);

        await AuditService.logAction(reqUser, {
            TableName: 'Salary.BangLuong',
            Action: 'DELETE',
            RecordID: id,
            OldData: existing
        });

        return { success: true, message: "Đã xóa bảng lương." };
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

        await AuditService.logAction(reqUser, {
            TableName: 'Salary.NgachLuong',
            Action: 'INSERT',
            RecordID: validation.data.MaNgach,
            NewData: validation.data
        });

        return { success: true, message: "Thêm ngạch lương mới thành công!" };
    }

    static async updateScale(reqUser, maNgach, data) {
        const existing = await SalaryModel.findScaleByMa(reqUser, maNgach);

        const validation = salaryScaleSchema.partial().safeParse(data);
        if (!validation.success) {
            const err = new Error(formatScaleError(validation.error));
            err.statusCode = 400; throw err;
        }
        await SalaryModel.updateScale(reqUser, maNgach, validation.data);

        await AuditService.logAction(reqUser, {
            TableName: 'Salary.NgachLuong',
            Action: 'UPDATE',
            RecordID: maNgach,
            OldData: existing,
            NewData: validation.data
        });

        return { success: true, message: "Cập nhật ngạch lương thành công!" };
    }

    static async deleteScale(reqUser, maNgach) {
        if (!maNgach) throw new Error("Thiếu mã ngạch cần xóa!");
        
        const existing = await SalaryModel.getScaleByMa(reqUser, maNgach);
        if (!existing) {
            const err = new Error("Ngạch lương không tồn tại.");
            err.statusCode = 404; throw err;
        }

        await SalaryModel.deleteScale(reqUser, maNgach);

        await AuditService.logAction(reqUser, {
            TableName: 'Salary.NgachLuong',
            Action: 'DELETE',
            RecordID: maNgach,
            OldData: existing
        });

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

        await AuditService.logAction(reqUser, {
            TableName: 'Salary.ChiTietNgachLuong',
            Action: 'INSERT',
            RecordID: `${validation.data.MaNgach}_${validation.data.BacLuong}`,
            NewData: validation.data
        });

        return { success: true, message: "Thêm bậc lương mới thành công!" };
    }

    static async deleteStep(reqUser, maNgach, bacLuong) {
        if (!maNgach || !bacLuong) throw new Error("Thiếu thông tin để xóa bậc lương!");
        
        const existing = await SalaryModel.getStep(reqUser, maNgach, bacLuong);
        if (!existing) {
            const err = new Error("Bậc lương không tồn tại.");
            err.statusCode = 404; throw err;
        }

        await SalaryModel.deleteStep(reqUser, maNgach, bacLuong);

        await AuditService.logAction(reqUser, {
            TableName: 'Salary.ChiTietNgachLuong',
            Action: 'DELETE',
            RecordID: `${maNgach}_${bacLuong}`,
            OldData: existing
        });

        return { success: true, message: "Đã xóa bậc lương!" };
    }
}

module.exports = SalaryService;