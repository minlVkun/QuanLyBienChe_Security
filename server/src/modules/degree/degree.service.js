const DegreeModel = require('./degree.model');
const { createDegreeSchema, formatZodError } = require('./degree.validation');

class DegreeService {
    static async getByMaNV(reqUser, maNV) {
        if (!maNV) {
            const err = new Error("Mã nhân viên là bắt buộc.");
            err.statusCode = 400; throw err;
        }
        return await DegreeModel.getByMaNV(reqUser, maNV);
    }

    static async create(reqUser, data) {
        const validationResult = createDegreeSchema.safeParse(data);
        if (!validationResult.success) {
            const err = new Error(formatZodError(validationResult.error));
            err.statusCode = 400; throw err;
        }

        const affectedRows = await DegreeModel.create(reqUser, validationResult.data);
        if (affectedRows === 0) {
            const err = new Error("Thêm bằng cấp thất bại hoặc bạn không có quyền thực hiện thao tác này.");
            err.statusCode = 403; throw err;
        }
        return { message: "Thêm bằng cấp thành công" };
    }

    static async delete(reqUser, idBang) {
        if (!idBang) {
            const err = new Error("ID bằng cấp là bắt buộc.");
            err.statusCode = 400; throw err;
        }

        const affectedRows = await DegreeModel.delete(reqUser, idBang);
        if (affectedRows === 0) {
            const err = new Error("Bằng cấp không tồn tại hoặc bạn không có quyền thực hiện thao tác này.");
            err.statusCode = 404; throw err;
        }
        return { message: "Xóa bằng cấp thành công" };
    }
}

module.exports = DegreeService;
