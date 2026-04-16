const DisciplineModel = require('../models/disciplineModel');

class DisciplineService {
    static async getDisciplineByMaNV(reqUser, maNV) {
        if (!maNV || typeof maNV !== 'string' || maNV.trim() === '') {
            throw new Error("Mã nhân viên (MaNV) không hợp lệ hoặc bị trống.");
        }
        
        return await DisciplineModel.getByMaNV(reqUser, maNV);
    }

    static async createDiscipline(reqUser, rawData) {
        const { MaNV, Loai, HinhThuc, NgayQuyetDinh, SoQuyetDinh, NoiDung } = rawData;

        // 1. Validate bắt buộc
        if (!MaNV || !Loai || !HinhThuc || !NgayQuyetDinh) {
            throw new Error("Vui lòng cung cấp đầy đủ các thông tin bắt buộc: Mã NV, Loại, Hình thức và Ngày quyết định.");
        }

        // 2. Gói dữ liệu sạch
        const cleanData = { MaNV, Loai, HinhThuc, NgayQuyetDinh, SoQuyetDinh, NoiDung };

        try {
            const rowsAffected = await DisciplineModel.create(reqUser, cleanData);
            
            if (rowsAffected === 0) {
                throw new Error("Không thể thêm mới bản ghi. Vui lòng kiểm tra lại dữ liệu hợp lệ.");
            }
            
            return rowsAffected;
        } catch (error) {
            // Xử lý lỗi trùng lặp số quyết định (UNIQUE KEY)
            if (error.message && error.message.includes('Violation of UNIQUE KEY constraint')) {
                throw new Error("Số quyết định này đã tồn tại trong hệ thống.");
            }
            // Nếu là các lỗi khác từ SQL
            console.error("[Service Error - createDiscipline]:", error.message);
            throw new Error("Lỗi hệ thống khi thêm mới dữ liệu khen thưởng/kỷ luật.");
        }
    }
}

module.exports = DisciplineService;