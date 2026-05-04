const ContractModel = require('./contract.model');
const EmployeeModel = require('../employee/employee.model');
const AuditService = require('../audit/audit.service');
const { contractSchema, formatZodError } = require('./contract.validation');
const fs = require('fs');

class ContractService {
    // [Utility] Xóa file upload rác khi có lỗi
    static cleanupFile(filePath) {
        if (filePath && fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    }

    static async generateContractCode(reqUser) {
        const year = new Date().getFullYear();
        const maxSeq = await ContractModel.getMaxMaHopDong(reqUser, year);
        const nextSeq = (maxSeq + 1).toString().padStart(4, '0');
        return `HD-${year}-${nextSeq}`;
    }

    static async getAllContracts(reqUser) {
        return await ContractModel.getAll(reqUser);
    }

    static async getContractsByEmployeeId(reqUser, employeeId) {
        return await ContractModel.getByEmployeeId(reqUser, employeeId);
    }

    static async createContract(reqUser, contractData, file) {
        try {
            // 1. Validation Logic
            const validation = contractSchema.safeParse(contractData);
            if (!validation.success) {
                const err = new Error(formatZodError(validation.error));
                err.statusCode = 400; 
                throw err;
            }
            const validData = validation.data;

            // 2. Business Logic: Check MaNV có tồn tại (Và có quyền RLS không)
            const nhanVien = await EmployeeModel.getById(reqUser, validData.MaNV);
            if (!nhanVien) {
                const err = new Error("Nhân viên không tồn tại hoặc bạn không có quyền thao tác.");
                err.statusCode = 400; 
                throw err;
            }

            // Kiểm tra trùng mã Hợp đồng
            const existing = await ContractModel.getById(reqUser, validData.MaHopDong);
            if (existing) {
                const err = new Error("Mã hợp đồng đã tồn tại trong hệ thống.");
                err.statusCode = 400; 
                throw err;
            }

            // 3. Chuẩn bị FileScanPath (Lưu relative path, sử dụng dấu '/' cho chuẩn Web)
            if (file) {
                // Chỉ lưu path tương đối từ thư mục gốc của project hoặc public url
                validData.TepDinhKem = `uploads/contracts/${file.filename}`;
            }

            // 4. Lưu Database
            await ContractModel.create(reqUser, validData);

            // Audit Log
            await AuditService.logAction(reqUser, {
                TableName: 'Salary.HopDong',
                Action: 'INSERT',
                RecordID: validData.MaHopDong,
                NewData: validData
            });

            return { success: true, message: "Thêm hợp đồng thành công" };

        } catch (error) {
            // [Rollback] Nếu có lỗi bất kỳ (Validation sai, DB chết, ...), PHẢI xóa file đã upload
            if (file) {
                this.cleanupFile(file.path);
            }
            throw error;
        }
    }

    static async updateContract(reqUser, maHopDong, contractData, file) {
        try {
            // 1. Check existence
            const existing = await ContractModel.getById(reqUser, maHopDong);
            if (!existing) {
                const err = new Error("Hợp đồng không tồn tại.");
                err.statusCode = 404;
                throw err;
            }

            // 2. Validation
            const validation = contractSchema.safeParse({ ...contractData, MaHopDong: maHopDong });
            if (!validation.success) {
                const err = new Error(formatZodError(validation.error));
                err.statusCode = 400;
                throw err;
            }
            const validData = validation.data;

            // 3. File handling
            if (file) {
                // Xóa file cũ nếu có file mới
                if (existing.TepDinhKem) {
                    this.cleanupFile(existing.TepDinhKem);
                }
                validData.TepDinhKem = `uploads/contracts/${file.filename}`;
            }

            // 4. Update Database
            await ContractModel.update(reqUser, maHopDong, validData);

            // Audit Log
            await AuditService.logAction(reqUser, {
                TableName: 'Salary.HopDong',
                Action: 'UPDATE',
                RecordID: maHopDong,
                OldData: existing,
                NewData: validData
            });

            return { success: true, message: "Cập nhật hợp đồng thành công" };
        } catch (error) {
            if (file) this.cleanupFile(file.path);
            throw error;
        }
    }

    static async deleteContract(reqUser, maHopDong) {
        // 1. Check existence
        const existing = await ContractModel.getById(reqUser, maHopDong);
        if (!existing) {
            const err = new Error("Hợp đồng không tồn tại.");
            err.statusCode = 404;
            throw err;
        }

        // 2. Delete file
        if (existing.TepDinhKem) {
            this.cleanupFile(existing.TepDinhKem);
        }

        // 3. Delete from DB
        await ContractModel.delete(reqUser, maHopDong);

        // Audit Log
        await AuditService.logAction(reqUser, {
            TableName: 'Salary.HopDong',
            Action: 'DELETE',
            RecordID: maHopDong,
            OldData: existing
        });

        return { success: true, message: "Đã xóa hợp đồng" };
    }
}

module.exports = ContractService;
