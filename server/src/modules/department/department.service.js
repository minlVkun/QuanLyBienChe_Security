const DepartmentModel = require('./department.model');

class DepartmentService {
    static async getOrgChart(reqUser) {
        return await DepartmentModel.getOrgChart(reqUser);
    }

    static async changeDeptHead(reqUser, maDonVi, maTruongPhong) {
        if (!maDonVi) {
            const err = new Error("Mã đơn vị là bắt buộc.");
            err.statusCode = 400; throw err;
        }

        const affected = await DepartmentModel.updateDeptHead(reqUser, maDonVi, maTruongPhong);
        
        if (affected === 0) {
            const err = new Error("Không tìm thấy đơn vị hoặc bạn không có quyền.");
            err.statusCode = 404; throw err;
        }

        return { message: "Cập nhật trưởng phòng thành công." };
    }

    static async create(reqUser, data) {
        if (!data.maDonVi || !data.tenDonVi) {
            const err = new Error("Thiếu thông tin bắt buộc (Mã, Tên).");
            err.statusCode = 400; throw err;
        }
        return await DepartmentModel.create(reqUser, data);
    }

    static async update(reqUser, id, data) {
        if (!id) throw new Error("Thiếu ID đơn vị.");
        return await DepartmentModel.update(reqUser, id, data);
    }

    static async delete(reqUser, id) {
        if (!id) throw new Error("Thiếu ID đơn vị.");
        return await DepartmentModel.delete(reqUser, id);
    }
}

module.exports = DepartmentService;