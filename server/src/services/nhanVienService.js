//src/services/nhanVienService.js
const NhanVienModel = require('../models/nhanVienModel');
const bcrypt = require('bcryptjs');

class NhanVienService {
    // Hàm để lấy tất cả thông tin nhân viên
    static async getAllEmployees(reqUser) {
        return await NhanVienModel.getAll(reqUser);
    }

    // Hàm để lấy thông tin nhân viên theo ID
    static async getEmployeeById(reqUser, maNV) {
        if (!maNV) {
            throw new Error("MaNV không hợp lệ");
        }

        const employee = await NhanVienModel.getById(reqUser, maNV);

        if (!employee) {
            return null;
        }

        return employee;
    }

    // Hàm để tự động tạo mã nhân viên mới
    static async generateMaNV(reqUser) {
        const maxId = await NhanVienModel.getMaxMaNV(reqUser);
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
        // 1. Lấy mã NV tự động
        const autoMaNV = await NhanVienModel.generateMaNV(reqUser);
        rawData.MaNV = autoMaNV;

        // 2. Tạo mật khẩu mặc định: TênKhôngDấu + MaNV
        const cleanName = this.removeVietnameseTones(rawData.HoTen);
        const defaultPassword = cleanName + autoMaNV;

        // 3. Hash mật khẩu
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(defaultPassword, salt);
        rawData.PasswordHash = Buffer.from(hashedPassword, 'utf8');

        // 4. Gọi Model lưu vào DB
        return await NhanVienModel.createEmployee(reqUser, rawData);
    }

    static async updateEmployee(reqUser, maNV, updateData) {
        // 1. Kiểm tra MaNV đầu vào
        if (!maNV) throw new Error("Mã nhân viên không hợp lệ.");

        // 2. Kiểm tra nếu object update rỗng
        const hasData = Object.keys(updateData).length > 0;
        if (!hasData) throw new Error("Không có trường nào để cập nhật.");

        // 3. Gọi model xử lý
        const affectedRows = await NhanVienModel.UpdateEmployee(reqUser, maNV, updateData);
        
        return affectedRows;
    }

    static async softDeleteEmployee(reqUser, maNV) {
        if (!maNV) {
            throw new Error("Mã nhân viên không hợp lệ.");
        }

        // Có thể thêm logic tại đây: Ví dụ không được xóa chính mình
        if (reqUser.MaNV === maNV) {
            throw new Error("Bạn không thể tự xóa tài khoản của chính mình.");
        }

        const affectedRows = await NhanVienModel.softDelete(reqUser, maNV);
        return affectedRows;
    }
}

module.exports = NhanVienService;