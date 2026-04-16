const DonViModel = require('../models/donViModel');

class DonViService {
    static async getOrgChart(reqUser) {
        return await DonViModel.getOrgChart(reqUser);
    }

    static async changeDeptHead(reqUser, maDonVi, maTruongPhong) {
        // 1. Kiểm tra tồn tại mã đơn vị
        if (!maDonVi) throw new Error("Mã đơn vị không được để trống.");

        // 2. Thực thi cập nhật ở Model
        const affectedRows = await DonViModel.updateDeptHead(reqUser, maDonVi, maTruongPhong);

        if (affectedRows === 0) {
            throw new Error("Không tìm thấy đơn vị hoặc dữ liệu không thay đổi.");
        }

        // 3. Tạo câu thông báo nghiệp vụ
        const message = maTruongPhong 
            ? `Đã bổ nhiệm nhân viên ${maTruongPhong} làm lãnh đạo đơn vị ${maDonVi}.`
            : `Đã bãi nhiệm chức vụ lãnh đạo tại đơn vị ${maDonVi}.`;

        return { message };
    }
}

module.exports = DonViService;