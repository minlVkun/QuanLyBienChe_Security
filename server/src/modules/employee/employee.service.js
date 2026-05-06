//src/services/employeeService.js
const EmployeeModel = require('./employee.model');
const AuditService = require('../audit/audit.service');
const bcrypt = require('bcryptjs');
const dayjs = require('dayjs');
const { poolPromise, sql } = require('../../config/db');
const SalaryModel = require('../salary/salary.model');
const { createEmployeeSchema, updateEmployeeSchema, formatZodError } = require('./employee.validation');

class EmployeeService {
    static maskCCCD(cccd) {
        if (!cccd) return cccd;
        // Nếu là object Buffer (trường hợp AE chưa giải mã được), trả về nguyên trạng
        if (typeof cccd === 'object' && cccd.type === 'Buffer') return cccd;
        
        const str = String(cccd);
        if (str.length <= 6) return str;
        return str.substring(0, 3) + '*'.repeat(str.length - 6) + str.substring(str.length - 3);
    }

    // Hàm để lấy tất cả thông tin nhân viên
    static async getAllEmployees(reqUser) {
        let employees = await EmployeeModel.getAll(reqUser);
        
        // Logic che mờ (Masking): Chỉ Admin và HR_Human mới thấy Full CCCD của người khác
        const canViewFull = ['db_Admin', 'db_HR_Human'].includes(reqUser.role);

        if (!canViewFull) {
            employees = employees.map(emp => {
                // Tôn trọng quyền xem dữ liệu của chính mình
                if (emp.MaNV !== reqUser.MaNV) {
                    emp.SoCCCD = this.maskCCCD(emp.SoCCCD);
                }
                return emp;
            });
        }
        return employees;
    }

    // Hàm để lấy thông tin nhân viên theo ID
    static async getEmployeeById(reqUser, maNV) {
        if (!maNV) {
            throw Object.assign(new Error("MaNV không hợp lệ"), { status: 400 });
        }

        const employee = await EmployeeModel.getById(reqUser, maNV);

        if (!employee) {
            return null;
        }

        // Logic che mờ (Masking)
        const canViewFull = ['db_Admin', 'db_HR_Human'].includes(reqUser.role);
        if (!canViewFull && employee.MaNV !== reqUser.MaNV) {
            employee.SoCCCD = this.maskCCCD(employee.SoCCCD);
        }

        return employee;
    }

    // Hàm để tự động tạo mã nhân viên mới
    static async generateMaNV(reqUser) {
        const maxId = await EmployeeModel.getMaxMaNV(reqUser);
        const nextId = maxId + 1;

        return 'NV' + nextId.toString().padStart(3, '0');
    }

    static removeVietnameseTones(str) {
        return str.normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/đ/g, 'd').replace(/Đ/g, 'D')
            .replace(/\s+/g, '');
    }

    static async createEmployee(reqUser, rawData) {
        // 1. Validate dữ liệu đầu vào
        const validationResult = createEmployeeSchema.safeParse(rawData);
        if (!validationResult.success) {
            throw Object.assign(new Error(formatZodError(validationResult.error)), { status: 400 });
        }

        // 2. Kiểm tra logic nghiệp vụ: Đơn vị đã có Trưởng phòng chưa?
        if (rawData.MaChucVu === 'TP') {
            const hasTruongPhong = await EmployeeModel.checkTruongPhongExists(reqUser, rawData.MaDonVi);
            if (hasTruongPhong) {
                throw Object.assign(new Error('Đơn vị này đã có Trưởng phòng. Vui lòng điều chuyển trước!'), { status: 400 });
            }
        }

        // 3. Lấy mã NV tự động
        const autoMaNV = await EmployeeService.generateMaNV(reqUser);
        rawData.MaNV = autoMaNV;

        // 4. Tạo mật khẩu mặc định: TênKhôngDấu + MaNV
        const cleanName = this.removeVietnameseTones(rawData.HoTen);
        const defaultPassword = cleanName + autoMaNV;

        // 5. Hash mật khẩu
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(defaultPassword, salt);
        rawData.PasswordHash = Buffer.from(hashedPassword, 'utf8');

        // ==== BẮT ĐẦU TRANSACTION (Quy trình 2 bước) ====
        const pool = await poolPromise;
        const transaction = new sql.Transaction(pool);
        await transaction.begin();

        try {
            // Bước 1: Tạo hồ sơ nhân viên trong giao dịch
            const newEmployee = await EmployeeModel.createEmployeeWithTransaction(transaction, reqUser, rawData);

            // Bước 2: Tạo bản ghi lương khởi tạo
            const thangNamStr = dayjs().format('MM/YYYY');
            await SalaryModel.initSalaryRecord(transaction, reqUser, newEmployee.MaNV, thangNamStr);

            // Xác nhận và lưu vào DB
            await transaction.commit();

            // Audit Log
            await AuditService.logAction(reqUser, {
                TableName: 'HR.NhanVien',
                Action: 'INSERT',
                RecordID: newEmployee.MaNV,
                NewData: { ...rawData, PasswordHash: '********' } // Mask password hash in logs
            });

            return newEmployee;
        } catch (error) {
            // Hủy bỏ toàn bộ quá trình nếu có lỗi
            await transaction.rollback();
            throw Object.assign(new Error(`Tạo hồ sơ và khởi tạo lương thất bại: ${error.message}`), { status: 500 });
        }
    }

    static async updateEmployee(reqUser, maNV, rawData) {
        console.log(`[Service - updateEmployee] Khởi chạy update cho MaNV: ${maNV}`);
        
        // 1. Kiểm tra MaNV đầu vào
        if (!maNV) throw Object.assign(new Error("Mã nhân viên không hợp lệ."), { status: 400 });

        // Fetch old data for audit
        const existing = await EmployeeModel.getById(reqUser, maNV);
        if (!existing) {
            throw Object.assign(new Error("Nhân viên không tồn tại."), { status: 404 });
        }

        // 2. Validate dữ liệu đầu vào bằng Zod
        const validationResult = updateEmployeeSchema.safeParse(rawData);
        if (!validationResult.success) {
            throw Object.assign(new Error(formatZodError(validationResult.error)), { status: 400 });
        }

        // Lấy dữ liệu sạch đã qua xử lý (Zod) - Tránh lỗi Case-sensitive
        const updateData = validationResult.data;

        // 3. Kiểm tra nếu object update rỗng
        if (Object.keys(updateData).length === 0) {
            throw Object.assign(new Error("Không có trường nào để cập nhật."), { status: 400 });
        }

        // 4. Gọi model xử lý (Truyền updateData đã validate)
        const affectedRows = await EmployeeModel.UpdateEmployee(reqUser, maNV, updateData);
        
        console.log(`[Service - updateEmployee] Kết quả: ${affectedRows} dòng bị tác động.`);

        // Audit Log - Bọc trong try-catch để không làm hỏng luồng chính
        try {
            if (affectedRows > 0) {
                // Loại bỏ các trường nhạy cảm/dữ liệu lớn không cần thiết cho audit
                const { PasswordHash, ...oldDataClean } = existing;
                const { ...newDataClean } = updateData;

                await AuditService.logAction(reqUser, {
                    TableName: 'HR.NhanVien',
                    Action: 'UPDATE',
                    RecordID: maNV,
                    OldData: oldDataClean,
                    NewData: newDataClean
                });
            }
        } catch (auditErr) {
            console.error("[EmployeeService] Lỗi ghi Audit Log (non-critical):", auditErr.message);
        }

        return affectedRows;
    }

    static async softDeleteEmployee(reqUser, maNV) {
        if (!maNV) {
            throw Object.assign(new Error("Mã nhân viên không hợp lệ."), { status: 400 });
        }

        // Có thể thêm logic tại đây: Ví dụ không được xóa chính mình
        if (reqUser.MaNV === maNV) {
            throw Object.assign(new Error("Bạn không thể tự xóa tài khoản của chính mình."), { status: 400 });
        }

        const existing = await EmployeeModel.getById(reqUser, maNV);

        const affectedRows = await EmployeeModel.softDelete(reqUser, maNV);

        // Audit Log
        if (affectedRows > 0) {
            await AuditService.logAction(reqUser, {
                TableName: 'HR.NhanVien',
                Action: 'SOFT_DELETE',
                RecordID: maNV,
                OldData: existing
            });
        }

        return affectedRows;
    }
}

module.exports = EmployeeService;
