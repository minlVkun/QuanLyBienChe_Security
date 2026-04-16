const SalaryModel = require('../models/salaryModel');

class SalaryService {
    /**
     * Lấy danh sách lương hiện tại và xử lý Dynamic Data Masking
     */
    static async fetchCurrentSalaries(reqUser) {
        const rawData = await SalaryModel.getCurrentSalaries(reqUser);

        // XỬ LÝ MASKING: Nếu SQL Server trả về 0 do chặn quyền, chuyển thành "***"
        const maskedData = rawData.map(record => {
            let parsedRecord = { ...record };

            if (parsedRecord.HeSoLuong !== null && Number(parsedRecord.HeSoLuong) === 0) {
                parsedRecord.HeSoLuong = "***";
            }

            if (parsedRecord.MucLuongDong !== null && Number(parsedRecord.MucLuongDong) === 0) {
                parsedRecord.MucLuongDong = "***";
            }

            return parsedRecord;
        });

        return maskedData;
    }

    static async getScales(reqUser) {
        return await SalaryModel.getSalaryScales(reqUser);
    }

    /**
     * Xử lý thăng bậc lương
     */
    static async processPromotion(reqUser, payload) {
        const { MaNV, MaNgach, BacLuong, NgayHuong } = payload;

        // 1. Validate đầu vào (Không yêu cầu HeSoLuong từ Frontend)
        if (!MaNV || !MaNgach || !BacLuong || !NgayHuong) {
            throw new Error("VALIDATION_ERROR: Thiếu thông tin bắt buộc (Mã NV, Mã ngạch, Bậc, Ngày hưởng).");
        }

        try {
            await SalaryModel.promoteSalary(reqUser, payload);
            return { message: `Đã cập nhật lương mới cho nhân viên ${MaNV} thành công.` };
            
        } catch (error) {
            console.error(`[SalaryService.processPromotion] Error: `, error.message);
            
            // 2. Mapping lỗi từ SQL THROW sang thông báo dễ hiểu
            if (error.message.includes('không hợp lệ trong danh mục')) {
                throw new Error("VALIDATION_ERROR: Ngạch hoặc bậc lương bạn chọn không tồn tại trong hệ thống.");
            }
            if (error.message.includes('FOREIGN KEY')) {
                throw new Error("VALIDATION_ERROR: Mã nhân viên không tồn tại.");
            }

            throw new Error("TRANSACTION_ERROR: Không thể thực hiện cập nhật thăng bậc lương lúc này.");
        }
    }
}

module.exports = SalaryService;